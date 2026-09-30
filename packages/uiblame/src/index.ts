import type { Plugin } from "vite";
import path from "node:path";
import { instrumentJsx } from "./instrument.js";
import { createClientSource } from "./client.js";
import { inspectGit } from "./git.js";
import { matchProvenance } from "./provenance.js";
import type { SourceLocation } from "./types.js";

export type UIBlameOptions = {
  enabled?: boolean;
  /** Source/provenance root; defaults to the Vite root. Relative to the Vite root. */
  root?: string;
};

function parseSource(value: string): SourceLocation {
  const parts = value.split("|");
  if (parts.length < 3) throw new Error("Invalid UIBlame source marker.");
  const column = Number(parts.pop());
  const line = Number(parts.pop());
  const file = parts.join("|");
  if (!file || !Number.isSafeInteger(line) || !Number.isSafeInteger(column) || line < 1 || column < 1) {
    throw new Error("Invalid UIBlame source marker.");
  }
  return { file, line, column };
}

export function uiBlame(options: UIBlameOptions = {}): Plugin {
  let root = process.cwd();
  let base = "/";
  const enabled = options.enabled ?? true;

  return {
    name: "uiblame",
    apply: "serve",
    enforce: "pre",
    configResolved(config) {
      root = path.resolve(config.root, options.root ?? ".");
      base = config.base;
    },
    transform(code, id) {
      if (!enabled) return null;
      return instrumentJsx(code, id, root);
    },
    transformIndexHtml() {
      if (!enabled) return [];
      return [
        {
          tag: "script",
          attrs: { type: "module", "data-uiblame-runtime": "true" },
          children: createClientSource(`${base}__uiblame/api/inspect`),
          injectTo: "body"
        }
      ];
    },
    configureServer(server) {
      if (!enabled) return;
      server.middlewares.use(`${base}__uiblame/api/inspect`, async (req, res) => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        try {
          const url = new URL(req.url ?? "", "http://uiblame.local");
          const raw = url.searchParams.get("source");
          if (!raw) throw new Error("Missing source marker.");
          const source = parseSource(raw);
          const git = await inspectGit(root, source);
          const provenance = await matchProvenance(root, source, git);
          res.statusCode = 200;
          res.end(JSON.stringify({ source, git, provenance }));
        } catch (error) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Inspection failed." }));
        }
      });
    }
  };
}

export default uiBlame;
