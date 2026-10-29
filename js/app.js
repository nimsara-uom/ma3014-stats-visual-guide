/* ============================================================
   App shell: topic registry, router, nav, progress, shared UI widgets
   ============================================================ */
(function () {
  const TOPICS = [];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('ma3014_' + k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('ma3014_' + k, JSON.stringify(v)); } catch { } }
  };

  /* ---------------- UI helpers ---------------- */
  const UI = {
    $, $$, store,
    fmt: (x, d = 4) => S.fmt(x, d),
    frac: (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`,
    sqrt: x => `<span class="sqrtw"><span class="sqrt">${x}</span></span>`,
    box: (type, tag, html) => `<div class="box ${type}"><b class="tag">${tag}</b><div>${html}</div></div>`,
    idea: html => UI.box('idea', '💡 Big idea', html),
    trap: html => UI.box('trap', '⚠️ Exam trap', html),
    exam: html => UI.box('exam', '📝 How it is asked in the exam', html),
    tip: html => UI.box('tip', '✅ Exam answer template', html),

    slider: (id, label, min, max, step, val) =>
      `<div class="ctl"><label for="${id}">${label} <output id="${id}_o">${val}</output></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`,
    num: (id, label, val, step = 'any') =>
      `<div class="ctl"><label for="${id}">${label}</label><input type="number" id="${id}" value="${val}" step="${step}"></div>`,
    /** bind range/number inputs; fn receives {id: number} */
    bind(root, ids, fn) {
      const read = () => { const v = {}; ids.forEach(id => { const e = $('#' + id, root); v[id] = e.type === 'checkbox' ? e.checked : (e.tagName === 'SELECT' ? e.value : +e.value); const o = $('#' + id + '_o', root); if (o) o.textContent = e.value; }); return v; };
      ids.forEach(id => $('#' + id, root).addEventListener('input', () => fn(read())));
      fn(read());
      return read;
    },
    seg: (id, opts, cur) => `<div class="seg" id="${id}">${opts.map(([v, l]) => `<button data-v="${v}" class="${v == cur ? 'on' : ''}">${l}</button>`).join('')}</div>`,
    bindSeg(root, id, fn) {
      const box = $('#' + id, root);
      box.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        $$('button', box).forEach(x => x.classList.toggle('on', x === b)); fn(b.dataset.v);
      });
      return () => $('button.on', box).dataset.v;
    },
    tabs: (id, items) => `<div class="tabs" data-tabs="${id}">${items.map((t, i) => `<button data-t="${i}" class="${i ? '' : 'on'}">${t[0]}</button>`).join('')}</div>` +
      items.map((t, i) => `<div class="pane ${i ? '' : 'on'}" data-pane="${id}:${i}">${t[1]}</div>`).join(''),
    /** worked solution stepper */
    steps: (src, question, steps) => `<div class="stepper"><div class="q"><div class="src">${src}</div>${question}</div>` +
      steps.map(s => `<div class="step"><b class="h">${s[0]}</b>${s[1]}</div>`).join('') +
      `<div class="btnrow"><button class="btn primary sm" data-next>Show next step ▸</button><button class="btn sm" data-all>Show all</button><button class="btn sm" data-reset>Hide all</button></div></div>`,

    initCommon(root) {
      $$('.stepper', root).forEach(st => {
        const steps = $$('.step', st);
        const upd = () => { const n = steps.filter(s => s.classList.contains('show')).length; $('[data-next]', st).disabled = n === steps.length; $('[data-next]', st).textContent = n === steps.length ? 'All steps shown ✓' : `Show step ${n + 1} of ${steps.length} ▸`; };
        $('[data-next]', st).onclick = () => { const s = steps.find(s => !s.classList.contains('show')); if (s) { s.classList.add('show'); s.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } upd(); };
        $('[data-all]', st).onclick = () => { steps.forEach(s => s.classList.add('show')); upd(); };
        $('[data-reset]', st).onclick = () => { steps.forEach(s => s.classList.remove('show')); upd(); };
        upd();
      });
      $$('[data-tabs]', root).forEach(tb => {
        const id = tb.dataset.tabs;
        tb.addEventListener('click', e => {
          const b = e.target.closest('button'); if (!b) return;
          $$('button', tb).forEach(x => x.classList.toggle('on', x === b));
          $$(`[data-pane^="${id}:"]`, root).forEach(p => p.classList.toggle('on', p.dataset.pane === `${id}:${b.dataset.t}`));
          tb.dispatchEvent(new CustomEvent('tabchange', { detail: +b.dataset.t }));
        });
      });
    },

    legend: items => `<div class="legend">${items.map(([c, l, ln]) => `<span><i class="${ln ? 'ln' : ''}" style="background:${c}"></i>${l}</span>`).join('')}</div>`,

    /* -------- distribution helpers for tests -------- */
    dist(name, df, df2) {
      switch (name) {
        case 'z': return { pdf: x => S.normPdf(x), cdf: x => S.normCdf(x), inv: p => S.normInv(p), lo: -4, hi: 4, sym: 'Z' };
        case 't': return { pdf: x => S.tPdf(x, df), cdf: x => S.tCdf(x, df), inv: p => S.tInv(p, df), lo: -4.5, hi: 4.5, sym: 't' };
        case 'chi': return { pdf: x => S.chiPdf(x, df), cdf: x => S.chiCdf(x, df), inv: p => S.chiInv(p, df), lo: 0, hi: Math.max(8, df + 4.5 * Math.sqrt(2 * df)), sym: 'χ²' };
        case 'F': return { pdf: x => S.fPdf(x, df, df2), cdf: x => S.fCdf(x, df, df2), inv: p => S.fInv(p, df, df2), lo: 0, hi: Math.max(4, S.fInv(0.995, df, df2)), sym: 'F' };
      }
    },
    /**
     * Draw a test-statistic distribution with rejection region + statistic marker.
     * o = {dist, df, df2, tail:'two'|'left'|'right', alpha, stat, h}
     */
    testPlot(container, o) {
      const D = UI.dist(o.dist, o.df, o.df2), a = o.alpha;
      let crit;
      if (o.tail === 'two') crit = [D.inv(a / 2), D.inv(1 - a / 2)];
      else if (o.tail === 'left') crit = [D.inv(a)];
      else crit = [D.inv(1 - a)];
      let lo = D.lo, hi = D.hi;
      if (o.stat != null && isFinite(o.stat)) { if (o.stat > hi * 0.95) hi = o.stat * 1.15 + 0.5; if (o.stat < lo * 0.95) lo = o.stat * 1.15 - 0.5; }
      crit.forEach(c => { if (c > hi) hi = c * 1.2; });
      let ymax = 0; for (let i = (o.dist === 'chi' || o.dist === 'F') && o.df <= 2 ? 10 : 0; i <= 200; i++) { const x = lo + (hi - lo) * i / 200; const y = D.pdf(x); if (isFinite(y) && y > ymax) ymax = y; }
      ymax = Math.min(ymax, 1.6) * 1.18;
      const p = Plot.make(container, { w: o.w || 640, h: o.h || 250, x: [lo, hi], y: [0, ymax], noY: true, margin: { l: 16 }, xlab: `${D.sym} value` });
      // acceptance and rejection areas
      const accA = o.tail === 'right' ? lo : crit[0], accB = o.tail === 'left' ? hi : crit[crit.length - 1];
      p.area(D.pdf, o.tail === 'two' ? crit[0] : accA, o.tail === 'two' ? crit[1] : accB, { color: 'var(--s1)', opacity: 0.12 });
      if (o.tail !== 'right') p.area(D.pdf, lo, crit[0], { color: 'var(--critical)', opacity: 0.45 });
      if (o.tail !== 'left') p.area(D.pdf, crit[crit.length - 1], hi, { color: 'var(--critical)', opacity: 0.45 });
      p.curve(D.pdf, { color: 'var(--s1)', width: 2 });
      crit.forEach((c, i) => {
        p.vline(c, { color: 'var(--critical)', y1: D.pdf(c) + ymax * 0.12, dash: '', width: 1.2 });
        p.text(c, D.pdf(c) + ymax * 0.12, `critical ${S.fmt(c, 3)}`, { dy: -6, color: 'var(--critical)', bold: true, bg: true, anchor: o.tail === 'two' ? (i ? 'start' : 'end') : 'middle', size: 11.5 });
      });
      const centerX = o.tail === 'two' ? (crit[0] + crit[1]) / 2 : (o.tail === 'left' ? (crit[0] + hi) / 2 : (lo + crit[0]) / 2);
      p.text(centerX, ymax * 0.06, 'do not reject H₀', { color: 'var(--s1)', bold: true, bg: true, size: 11.5 });
      let res = { crit };
      if (o.stat != null && isFinite(o.stat)) {
        const st = o.stat;
        p.vline(st, { color: 'var(--s2)', dash: '', width: 2.5, y1: ymax * 0.93 });
        p.text(st, ymax * 0.93, `your ${D.sym} = ${S.fmt(st, 3)}`, { dy: -5, color: 'var(--s2)', bold: true, bg: true });
        const cdf = D.cdf(st);
        const pv = o.tail === 'two' ? Math.min(1, 2 * Math.min(cdf, 1 - cdf)) : (o.tail === 'left' ? cdf : 1 - cdf);
        const reject = o.tail === 'two' ? (st < crit[0] || st > crit[1]) : (o.tail === 'left' ? st < crit[0] : st > crit[0]);
        res = { crit, p: pv, reject, stat: st };
      }
      p.hover(x => `${D.sym} = <b>${S.fmt(x, 3)}</b><br>area to the left: <b>${S.fmt(D.cdf(x), 4)}</b><br>area to the right: <b>${S.fmt(1 - D.cdf(x), 4)}</b>`);
      return res;
    },
    decision(res, alpha) {
      if (res.p == null) return '';
      return `<div class="readout">
        <div class="stat"><div class="k">critical value(s)</div><div class="v">${res.crit.map(c => S.fmt(c, 3)).join(' , ')}</div></div>
        <div class="stat"><div class="k">p-value</div><div class="v">${S.fmt(res.p, 4)}</div></div>
        <div class="stat"><div class="k">decision at α = ${alpha}</div><div class="v ${res.reject ? 'reject' : 'accept'}">${res.reject ? '✖ Reject H₀' : '✔ Do not reject H₀'}</div></div></div>`;
    },
    critName(dist, alpha, tail, df, df2) {
      const a = tail === 'two' ? alpha / 2 : alpha;
      const d = dist === 'z' ? `Z<sub>${a}</sub>` : dist === 't' ? `t<sub>${a}, ${df}</sub>` : dist === 'chi' ? `χ²<sub>${a}, ${df}</sub>` : `F<sub>${a}</sub>(${df}, ${df2})`;
      return d;
    }
  };

  /* ---------------- router & nav ---------------- */
  const App = {
    add(t) { TOPICS.push(t); },
    topics: TOPICS,
    start() {
      const theme = store.get('theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.dataset.theme = theme;
      $('#themeBtn').onclick = () => { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; store.set('theme', t); App.render(); };
      $('#menuBtn').onclick = () => $('#nav').classList.toggle('open');
      window.addEventListener('hashchange', () => App.render());
      App.buildNav(); App.render();
    },
    buildNav() {
      const done = store.get('done', {});
      let html = '', g = null;
      TOPICS.forEach(t => {
        if (t.group !== g) { g = t.group; html += `<div class="group">${g}</div>`; }
        html += `<a href="#${t.id}" data-id="${t.id}"><span class="ic">${t.icon || '•'}</span><span>${t.title}</span>${done[t.id] ? '<span class="done" title="Marked as understood">✓</span>' : ''}${t.week ? `<span class="wk">${t.week}</span>` : ''}</a>`;
      });
      $('#nav').innerHTML = html;
      const learnable = TOPICS.filter(t => !t.noProgress);
      const n = learnable.filter(t => done[t.id]).length;
      $('#progressPill').textContent = `✓ ${n} / ${learnable.length} understood`;
    },
    render() {
      const id = location.hash.slice(1) || TOPICS[0].id;
      const idx = Math.max(0, TOPICS.findIndex(t => t.id === id));
      const t = TOPICS[idx];
      $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.id === t.id));
      $('#nav').classList.remove('open');
      const done = store.get('done', {});
      const prev = TOPICS[idx - 1], next = TOPICS[idx + 1];
      const main = $('#main');
      Plot.hideTip();
      try {
      main.innerHTML =`<div class="crumb">${t.group}${t.week ? ' · ' + t.week : ''}</div><h1>${t.icon || ''} ${t.title}</h1>` + t.html() +
        `<div class="footer-nav">
          ${prev ? `<a class="btn" href="#${prev.id}">◂ ${prev.title}</a>` : '<span></span>'}
          ${t.noProgress ? '' : `<label class="understood"><input type="checkbox" id="doneChk" ${done[t.id] ? 'checked' : ''}> I understand this topic</label>`}
          ${next ? `<a class="btn primary" href="#${next.id}">${next.title} ▸</a>` : '<span></span>'}
        </div>`;
      const chk = $('#doneChk');
      if (chk) chk.onchange = () => { const d = store.get('done', {}); d[t.id] = chk.checked; store.set('done', d); App.buildNav(); $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.id === t.id)); };
      UI.initCommon(main);
      t.init && t.init(main);
      } catch (e) {
        console.error(e);
        main.insertAdjacentHTML('afterbegin', `<div class="box trap" id="renderError"><b class="tag">Page error</b><div>${String(e && e.message || e)}</div></div>`);
      }
      window.scrollTo(0, 0); main.focus({ preventScroll: true });
      document.title = `${t.title} — MA3014 Visual Guide`;
    }
  };
  window.App = App; window.UI = UI;
})();
