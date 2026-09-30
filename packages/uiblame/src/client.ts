function browserRuntime() {
  const w = window as Window & { __UIBLAME__?: boolean };
  if (w.__UIBLAME__) return;
  w.__UIBLAME__ = true;

  const host = document.createElement('div');
  host.id = 'uiblame-root';
  host.style.all = 'initial';
  host.style.position = 'fixed';
  host.style.zIndex = '2147483647';
  document.documentElement.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });

  root.innerHTML = `
    <style>
      :host { all: initial; }
      *, *::before, *::after { box-sizing: border-box; }
      button { font: inherit; }
      .fab { position: fixed; right: 18px; bottom: 18px; border: 1px solid rgba(255,255,255,.12); background: #111216; color: #fff; height: 42px; padding: 0 14px; border-radius: 12px; font: 600 13px/1 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; box-shadow: 0 12px 38px rgba(0,0,0,.28); cursor: pointer; letter-spacing: -.01em; }
      .fab[data-on="true"] { background: #fff; color: #111216; border-color: #ddd; }
      .outline { position: fixed; display: none; pointer-events: none; border: 2px solid #7c5cff; background: rgba(124,92,255,.08); border-radius: 4px; }
      .panel { position: fixed; right: 18px; bottom: 70px; width: min(410px, calc(100vw - 28px)); max-height: min(680px, calc(100vh - 100px)); overflow: auto; display: none; color: #f6f7fb; background: rgba(18,19,24,.98); border: 1px solid rgba(255,255,255,.1); border-radius: 16px; box-shadow: 0 22px 70px rgba(0,0,0,.38); padding: 14px; font: 13px/1.5 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
      .panel.show { display: block; }
      .top { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
      .brand { font-weight:750; letter-spacing:-.02em; }
      .topActions { display:flex; align-items:center; gap:5px; }
      .mini,.close { appearance:none; border:1px solid rgba(255,255,255,.09); color:#b5b8c2; background:#1a1b20; cursor:pointer; border-radius:8px; }
      .mini { padding:5px 8px; font-size:11px; }
      .close { border:0; background:transparent; font-size:18px; padding:2px 5px; }
      .source { font: 600 12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; color:#d9d4ff; background:#24222e; border:1px solid #373346; border-radius:10px; padding:10px; overflow-wrap:anywhere; }
      .grid { display:grid; grid-template-columns:104px 1fr; gap:8px 12px; margin:14px 0; }
      .k { color:#8e919d; }
      .v { color:#f6f7fb; min-width:0; overflow-wrap:anywhere; }
      .pill { display:inline-flex; align-items:center; gap:6px; border-radius:999px; padding:4px 8px; font-size:11px; font-weight:750; }
      .verified { background:#173827; color:#7ef0ad; }
      .recorded { background:#3a3015; color:#f6d66a; }
      .unknown { background:#2a2c33; color:#b9bdc8; }
      .prompt { margin-top:8px; padding:10px; color:#d7d9e0; background:#17181d; border-radius:10px; white-space:pre-wrap; }
      details { margin-top:10px; border-top:1px solid rgba(255,255,255,.08); padding-top:10px; }
      summary { cursor:pointer; color:#c8cad2; user-select:none; }
      pre { white-space:pre-wrap; word-break:break-word; font:11px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; color:#b8bbc5; }
      .hint { color:#8e919d; font-size:11px; margin-top:9px; }
      .loading { color:#a8abb6; padding:6px 0; }
    </style>
    <div class="outline"></div>
    <section class="panel" aria-live="polite"></section>
    <button class="fab" type="button" title="Toggle UIBlame (Alt+Shift+B)">◎ UIBlame</button>
  `;

  const fab = root.querySelector<HTMLButtonElement>('.fab')!;
  const outline = root.querySelector<HTMLDivElement>('.outline')!;
  const panel = root.querySelector<HTMLElement>('.panel')!;
  let inspecting = false;
  let target: Element | null = null;
  let selectedSource = '';

  const escapeHtml = (value: unknown) => String(value ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');

  const setInspecting = (value: boolean) => {
    inspecting = value;
    target = null;
    fab.dataset.on = String(value);
    fab.textContent = value ? 'Click an element' : '◎ UIBlame';
    if (!value) outline.style.display = 'none';
  };

  const panelTop = () =>
    '<div class="top"><div class="brand">UIBlame</div><div class="topActions">' +
    (selectedSource ? '<button class="mini" data-copy-source type="button">Copy source</button>' : '') +
    '<button class="close" data-close type="button" aria-label="Close">×</button></div></div>';

  fab.addEventListener('click', () => setInspecting(!inspecting));

  panel.addEventListener('click', async (event) => {
    const eventTarget = event.target as Element | null;
    if (eventTarget?.closest?.('[data-close]')) {
      panel.classList.remove('show');
      return;
    }
    if (eventTarget?.closest?.('[data-copy-source]') && selectedSource) {
      try {
        await navigator.clipboard.writeText(selectedSource);
        const button = panel.querySelector<HTMLButtonElement>('[data-copy-source]');
        if (button) {
          button.textContent = 'Copied';
          window.setTimeout(() => { button.textContent = 'Copy source'; }, 1200);
        }
      } catch {
        // Clipboard access can be denied by the browser. Inspection remains usable.
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      setInspecting(!inspecting);
      return;
    }
    if (event.key === 'Escape') {
      setInspecting(false);
      panel.classList.remove('show');
    }
  }, true);

  document.addEventListener('mousemove', (event) => {
    if (!inspecting) return;
    const eventTarget = event.target;
    const el = eventTarget instanceof Element ? eventTarget.closest('[data-uiblame-source]') : null;
    if (!el || el === host || host.contains(el)) {
      outline.style.display = 'none';
      target = null;
      return;
    }
    target = el;
    const rect = el.getBoundingClientRect();
    Object.assign(outline.style, {
      display:'block',
      left:rect.left+'px',
      top:rect.top+'px',
      width:rect.width+'px',
      height:rect.height+'px'
    });
  }, true);

  document.addEventListener('click', async (event) => {
    if (event.composedPath().includes(host)) return;
    if (!inspecting || !target) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const marker = target.getAttribute('data-uiblame-source');
    if (!marker) return;

    setInspecting(false);
    panel.classList.add('show');
    selectedSource = marker.replaceAll('|', ':');
    panel.innerHTML = panelTop() + '<div class="loading">Tracing this pixel…</div>';

    try {
      const res = await fetch('/__uiblame/api/inspect?source=' + encodeURIComponent(marker));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Inspection failed');

      selectedSource = data.source.file + ':' + data.source.line + ':' + data.source.column;
      const p = data.provenance;
      const g = data.git;
      const statusClass = p.status === 'verified-ai' ? 'verified' : p.status === 'recorded-ai' ? 'recorded' : 'unknown';
      const statusText = p.status === 'verified-ai' ? 'Verified AI' : p.status === 'recorded-ai' ? 'Recorded AI' : 'Unknown';

      panel.innerHTML = `
        ${panelTop()}
        <div class="source">${escapeHtml(selectedSource)}</div>
        <div class="grid">
          <div class="k">Provenance</div><div class="v"><span class="pill ${statusClass}">${statusText}</span></div>
          <div class="k">Agent</div><div class="v">${escapeHtml(p.record?.agent || '—')}</div>
          <div class="k">Session</div><div class="v">${escapeHtml(p.record?.session || '—')}</div>
          <div class="k">Commit</div><div class="v">${escapeHtml(g.commit ? g.commit.slice(0, 10) : '—')}</div>
          <div class="k">Author</div><div class="v">${escapeHtml(g.author || '—')}</div>
          <div class="k">When</div><div class="v">${escapeHtml(g.authoredAt ? new Date(g.authoredAt).toLocaleString() : '—')}</div>
          <div class="k">Summary</div><div class="v">${escapeHtml(g.summary || g.error || '—')}</div>
        </div>
        ${p.record?.prompt ? '<div class="k">Recorded request</div><div class="prompt">'+escapeHtml(p.record.prompt)+'</div>' : ''}
        <div class="hint">${escapeHtml(p.reason)}${g.workingTreeModified ? ' The file also has uncommitted changes.' : ''}</div>
        ${g.diff ? '<details><summary>Git diff</summary><pre>'+escapeHtml(g.diff)+'</pre></details>' : ''}
      `;
    } catch (error) {
      panel.innerHTML = panelTop() + '<div class="prompt">' + escapeHtml(error instanceof Error ? error.message : error) + '</div>';
    }
  }, true);
}

export const CLIENT_SOURCE = `(${browserRuntime.toString()})();`;
