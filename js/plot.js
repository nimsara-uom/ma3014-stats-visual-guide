/* ============================================================
   Plot — a minimal SVG chart helper with crosshair/hover tooltips.
   Colours always come from CSS custom properties so light/dark themes work.
   ============================================================ */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, style = {}) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    Object.assign(e.style, style);
    return e;
  };

  let tip;
  function tooltip() {
    if (!tip) { tip = document.createElement('div'); tip.className = 'viz-tip'; document.body.appendChild(tip); }
    return tip;
  }
  function showTip(html, ev) {
    const t = tooltip(); t.innerHTML = html; t.style.display = 'block';
    const pad = 14, w = t.offsetWidth, h = t.offsetHeight;
    let x = ev.clientX + pad, y = ev.clientY + pad;
    if (x + w > window.innerWidth - 8) x = ev.clientX - w - pad;
    if (y + h > window.innerHeight - 8) y = ev.clientY - h - pad;
    t.style.left = x + 'px'; t.style.top = y + 'px';
  }
  function hideTip() { if (tip) tip.style.display = 'none'; }

  function niceTicks(lo, hi, count = 6) {
    const span = hi - lo; if (span <= 0) return [lo];
    const raw = span / count, mag = 10 ** Math.floor(Math.log10(raw)), r = raw / mag;
    const step = (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag;
    const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-6; v += step) out.push(+v.toFixed(10));
    return out;
  }
  const tickFmt = v => Math.abs(v) >= 1000 ? v.toLocaleString() : (+v.toPrecision(6)).toString();

  function make(container, o) {
    if (typeof container === 'string') container = document.querySelector(container);
    container.innerHTML = '';
    const W = o.w || 640, H = o.h || 280;
    const m = Object.assign({ l: 52, r: 16, t: 14, b: 42 }, o.margin || {});
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const sx = x => m.l + (x - x0) / (x1 - x0) * (W - m.l - m.r);
    const sy = y => H - m.b - (y - y0) / (y1 - y0) * (H - m.t - m.b);
    const ix = px => x0 + (px - m.l) / (W - m.l - m.r) * (x1 - x0);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'viz', role: 'img' });
    if (o.title) svg.setAttribute('aria-label', o.title);
    container.appendChild(svg);

    const gGrid = el('g'), gData = el('g'), gTop = el('g'), gHover = el('g');
    svg.append(gGrid, gData, gTop, gHover);

    // grid + axes (recessive)
    const xt = o.xticks || niceTicks(x0, x1, o.xtickCount || 7);
    const yt = o.yticks || (o.noY ? [] : niceTicks(y0, y1, 4));
    yt.forEach(v => {
      gGrid.append(el('line', { x1: m.l, x2: W - m.r, y1: sy(v), y2: sy(v), class: 'grid' }));
      const t = el('text', { x: m.l - 6, y: sy(v) + 4, 'text-anchor': 'end', class: 'tick' }); t.textContent = tickFmt(v); gGrid.append(t);
    });
    gGrid.append(el('line', { x1: m.l, x2: W - m.r, y1: sy(y0), y2: sy(y0), class: 'axis' }));
    xt.forEach(v => {
      if (v < x0 - 1e-9 || v > x1 + 1e-9) return;
      gGrid.append(el('line', { x1: sx(v), x2: sx(v), y1: sy(y0), y2: sy(y0) + 4, class: 'axis' }));
      const t = el('text', { x: sx(v), y: sy(y0) + 17, 'text-anchor': 'middle', class: 'tick' }); t.textContent = o.xfmt ? o.xfmt(v) : tickFmt(v); gGrid.append(t);
    });
    if (o.xlab) { const t = el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle', class: 'axlab' }); t.textContent = o.xlab; gGrid.append(t); }
    if (o.ylab) { const t = el('text', { x: 12, y: (m.t + H - m.b) / 2, 'text-anchor': 'middle', class: 'axlab', transform: `rotate(-90 12 ${(m.t + H - m.b) / 2})` }); t.textContent = o.ylab; gGrid.append(t); }

    const clampY = y => Math.max(m.t - 2, Math.min(H - m.b, sy(y)));
    const api = {
      svg, sx, sy, ix, W, H, m,
      curve(fn, s = {}) {
        const n = s.n || 300, a = s.from ?? x0, b = s.to ?? x1; let d = '';
        for (let i = 0; i <= n; i++) {
          const x = a + (b - a) * i / n, y = fn(x);
          if (!isFinite(y)) continue;
          d += (d ? 'L' : 'M') + sx(x).toFixed(2) + ',' + clampY(y).toFixed(2);
        }
        const p = el('path', { d, fill: 'none' }, { stroke: s.color || 'var(--s1)', strokeWidth: s.width || 2, strokeDasharray: s.dash || '' , strokeLinejoin: 'round'});
        (s.top ? gTop : gData).append(p); return p;
      },
      area(fn, a, b, s = {}) {
        a = Math.max(a, x0); b = Math.min(b, x1); if (b <= a) return;
        const n = s.n || 200; let d = `M${sx(a)},${sy(Math.max(y0, 0))}`;
        for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n, y = fn(x); d += `L${sx(x).toFixed(2)},${clampY(isFinite(y) ? y : y1).toFixed(2)}`; }
        d += `L${sx(b)},${sy(Math.max(y0, 0))}Z`;
        const p = el('path', { d }, { fill: s.color || 'var(--s1)', fillOpacity: s.opacity ?? 0.25, stroke: 'none' });
        if (s.pattern) p.style.fill = `url(#${s.pattern})`;
        gData.insertBefore(p, gData.firstChild); return p;
      },
      bars(data, s = {}) {
        const bw = s.width ?? 0.8; const half = (sx(x0 + bw) - sx(x0)) / 2;
        const out = [];
        data.forEach(d => {
          const top = sy(d.y), base = sy(0), h = Math.max(0, base - top);
          const x = sx(d.x) - half + 1, w = Math.max(1, 2 * half - 2), r = Math.min(4, w / 2, h);
          // rounded data-end, square baseline
          const path = h <= 0 ? '' : `M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + w - r}Q${x + w},${top} ${x + w},${top + r}V${base}Z`;
          const p = el('path', { d: path, class: 'bar' }, { fill: d.color || s.color || 'var(--s1)', fillOpacity: d.opacity ?? s.opacity ?? 1 });
          gData.append(p); out.push(p);
          if (d.tip || s.tip) {
            const hit = el('rect', { x: x - 1, y: Math.min(top, base - 24), width: w + 2, height: Math.max(h, 24), fill: 'transparent' });
            hit.addEventListener('mousemove', ev => { p.style.filter = 'brightness(1.12)'; showTip((d.tip || s.tip)(d), ev); });
            hit.addEventListener('mouseleave', () => { p.style.filter = ''; hideTip(); });
            gHover.append(hit);
          }
        });
        return out;
      },
      line(xa, ya, xb, yb, s = {}) {
        const l = el('line', { x1: sx(xa), y1: sy(ya), x2: sx(xb), y2: sy(yb) }, { stroke: s.color || 'var(--text-secondary)', strokeWidth: s.width || 1.5, strokeDasharray: s.dash || '' });
        (s.under ? gData : gTop).append(l); return l;
      },
      rect(xa, ya, xb, yb, s = {}) {
        const r = el('rect', { x: Math.min(sx(xa), sx(xb)), y: Math.min(sy(ya), sy(yb)), width: Math.abs(sx(xb) - sx(xa)), height: Math.abs(sy(yb) - sy(ya)), rx: s.rx || 0 },
          { fill: s.color || 'var(--s1)', fillOpacity: s.opacity ?? 0.2, stroke: s.stroke || 'none', strokeWidth: s.sw || 1 });
        (s.top ? gTop : gData).append(r); return r;
      },
      vline(x, s = {}) {
        const l = api.line(x, s.y0 ?? y0, x, s.y1 ?? y1, Object.assign({ dash: '4 3' }, s));
        if (s.label) api.text(x, s.ly ?? y1, s.label, { anchor: s.anchor || 'middle', dy: s.dy ?? 12, color: s.lcolor, bold: s.bold, bg: true });
        return l;
      },
      text(x, y, str, s = {}) {
        const t = el('text', { x: sx(x) + (s.dx || 0), y: sy(y) + (s.dy || 0), 'text-anchor': s.anchor || 'middle', class: 'lbl' + (s.bold ? ' b' : '') + (s.bg ? ' halo' : '') },
          { fill: s.color || 'var(--text-primary)', fontSize: s.size ? s.size + 'px' : '' });
        t.textContent = str; gTop.append(t); return t;
      },
      dot(x, y, s = {}) {
        const c = el('circle', { cx: sx(x), cy: sy(y), r: s.r || 4.5 }, { fill: s.color || 'var(--s1)', stroke: 'var(--surface-1)', strokeWidth: 2, cursor: s.cursor || '' });
        gTop.append(c);
        if (s.tip) {
          c.addEventListener('mousemove', ev => showTip(s.tip, ev));
          c.addEventListener('mouseleave', hideTip);
        }
        return c;
      },
      /** crosshair + tooltip; fn(x) returns html or null */
      hover(fn) {
        const cross = el('line', { y1: m.t, y2: H - m.b, class: 'cross' }); cross.style.display = 'none'; gHover.append(cross);
        const hit = el('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: 'transparent' });
        gHover.insertBefore(hit, gHover.firstChild);
        const move = ev => {
          const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
          const p = pt.matrixTransform(svg.getScreenCTM().inverse());
          const xv = ix(p.x); const html = fn(xv);
          if (html == null) { cross.style.display = 'none'; hideTip(); return; }
          cross.setAttribute('x1', p.x); cross.setAttribute('x2', p.x); cross.style.display = '';
          showTip(html, ev);
        };
        hit.addEventListener('mousemove', move);
        hit.addEventListener('mouseleave', () => { cross.style.display = 'none'; hideTip(); });
      },
      clearData() { gData.innerHTML = ''; gTop.innerHTML = ''; },
      gTop, gData, gHover, el
    };
    return api;
  }

  window.Plot = { make, niceTicks, showTip, hideTip, el };
})();
