import { transformSync } from "@babel/core";
import * as t from "@babel/types";
import path from "node:path";

const DOM_TAG = /^[a-z]/;

export function instrumentJsx(code: string, id: string, root: string) {
  const cleanId = id.split("?")[0];
  if (!/\.[jt]sx$/.test(cleanId)) return null;
  if (cleanId.includes("node_modules")) return null;

  const relative = path.relative(root, cleanId).replaceAll(path.sep, "/");
  if (relative.startsWith("../")) return null;

  const isTs = cleanId.endsWith(".tsx");
  const result = transformSync(code, {
    filename: cleanId,
    sourceMaps: true,
    sourceFileName: relative,
    parserOpts: {
      sourceType: "module",
      plugins: ["jsx", ...(isTs ? (["typescript"] as const) : [])]
    },
    generatorOpts: {
      retainLines: true,
      compact: false
    },
    plugins: [
      function uiBlameInstrumentPlugin() {
        return {
          visitor: {
            JSXOpeningElement(p: { node: t.JSXOpeningElement }) {
              const node = p.node;
              if (!t.isJSXIdentifier(node.name) || !DOM_TAG.test(node.name.name)) return;
              if (!node.loc?.start) return;
              const alreadyTagged = node.attributes.some(
                (attr) => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name: "data-uiblame-source" })
              );
              if (alreadyTagged) return;
              const marker = `${relative}|${node.loc.start.line}|${node.loc.start.column + 1}`;
              node.attributes.push(
                t.jsxAttribute(t.jsxIdentifier("data-uiblame-source"), t.stringLiteral(marker))
              );
            }
          }
        };
      }
    ]
  });

  if (!result?.code) return null;
  return { code: result.code, map: result.map ?? null };
}
