/* ===== EXTRA TOPICS FROM PAST PAPERS ===== */
(function () {
  const F = UI.frac, R = UI.sqrt, f = S.fmt;
  const G = 'Part F · Extra exam topics';

  /* ------------------------------------------------------------------ */
  /* E(X), V(X)                                                           */
  /* ------------------------------------------------------------------ */
  App.add({
    id: 'ev', group: G, icon: '⚙️', week: 'Wk 1', title: 'E(X) & V(X) from first principles',
    html: () => `
      <p class="lead"><b>E(X)</b> is the balance point of the distribution (the long-run average). <b>V(X)</b> measures how spread out it is around that point.</p>
      <div class="grid2"><div class="fb">E(X) = Σ x·P(x) &nbsp;&nbsp; E(X²) = Σ x²·P(x)</div><div class="fb">V(X) = E(X²) − [E(X)]²</div></div>
      <div class="card">
        <h3>What happens to E and V when you transform Y = aX + b?</h3>
        <p>X = the score on a fair die (blue). Slide a and b to build Y = aX + b (orange).</p>
        <div class="controls">${UI.slider('ea', 'a (stretch)', -3, 3, 0.5, 2)}${UI.slider('eb', 'b (shift)', -10, 10, 1, 3)}</div>
        <div id="evChart"></div>${UI.legend([['var(--s1)', 'X (die)'], ['var(--s2)', 'Y = aX + b']])}
        <div class="readout" id="evOut"></div>
        ${UI.idea(`Adding b <b>shifts</b> everything, so the mean moves but the spread does not: V(X + b) = V(X). Multiplying by a <b>stretches</b> it: the mean is multiplied by a and the variance by <b>a²</b>. With a = 2 the variance becomes 4 times bigger.`)}
      </div>
      <div class="card"><h3>Rules to remember</h3><table class="t">
        <tr><th>Expectation</th><th>Variance</th></tr>
        <tr><td>E(c) = c</td><td>V(c) = 0</td></tr><tr><td>E(aX + b) = aE(X) + b</td><td>V(aX + b) = a²V(X)</td></tr>
        <tr><td>E(X ± Y) = E(X) ± E(Y) (always)</td><td>V(X ± Y) = V(X) + V(Y) ± 2Cov(X,Y)</td></tr>
        <tr><td>Independent ⇒ E(XY) = E(X)E(Y)</td><td>Independent ⇒ V(X − Y) = V(X) + V(Y) (the variances ADD)</td></tr></table></div>
      ${UI.trap(`V(X − Y) is <b>not</b> V(X) − V(Y). Subtracting a random quantity adds uncertainty: V(X − Y) = V(X) + V(Y) for independent variables.`)}
      <h2>📝 Nov 2025 (23 batch) · Q2 b, c · 15 marks</h2>
      <div class="card"><h3>Visualise the urn: 4 black and 6 white, draw until the first white</h3>
        <div class="btnrow"><button class="btn primary" id="urnGo">Draw once</button><button class="btn" id="urn5k">Draw 5000 times</button></div>
        <div id="urnView"></div><div id="urnChart"></div></div>
      ${UI.steps('Nov 2025 Q2 b · 10 marks', 'An urn has 4 black and 6 white balls. X = number of black balls drawn, without replacement, before a white ball appears. Find E(X) and V(X).', [
        ['List the values', 'X can be 0, 1, 2, 3 or 4 (at most 4 blacks before a white must appear).'],
        ['P(X = 0)', 'First ball white: 6/10 = <b>0.6</b>'],
        ['P(X = 1)', `B then W: ${F(4, 10)} × ${F(6, 9)} = ${F(24, 90)} = <b>${f(24 / 90)}</b>`],
        ['P(X = 2)', `B B W: ${F(4, 10)} × ${F(3, 9)} × ${F(6, 8)} = ${F(72, 720)} = <b>0.1</b>`],
        ['P(X = 3), P(X = 4)', `B B B W: ${F('4·3·2·6', '10·9·8·7')} = <b>${f(144 / 5040)}</b>; &nbsp; B B B B W: ${F('4·3·2·1·6', '10·9·8·7·6')} = <b>${f(144 / 30240)}</b> &nbsp; (check: they sum to 1 ✔)`],
        ['E(X)', `Σx·P(x) = 0(0.6) + 1(${f(24 / 90)}) + 2(0.1) + 3(${f(144 / 5040)}) + 4(${f(144 / 30240)}) = <b>${f(4 / 7)} = 4/7</b>`],
        ['E(X²)', `Σx²·P(x) = ${f(24 / 90)} + 4(0.1) + 9(${f(144 / 5040)}) + 16(${f(144 / 30240)}) = <b>1</b>`],
        ['V(X)', `E(X²) − [E(X)]² = 1 − (4/7)² = 1 − 16/49 = <b>33/49 ≈ ${f(33 / 49)}</b>`],
      ])}
      ${UI.steps('Nov 2025 Q2 c · 5 marks', 'X₁, X₂ are independent and identically distributed, each taking 0, 1, 2 with probabilities p, q, 1 − p − q. Let Y = X₁ − X₂. Find E(Y) and V(Y).', [
        ['E(X)', 'E(X) = 0·p + 1·q + 2(1 − p − q) = <b>2 − 2p − q</b>'],
        ['E(X²)', 'E(X²) = 0·p + 1·q + 4(1 − p − q) = <b>4 − 4p − 3q</b>'],
        ['V(X)', 'V(X) = (4 − 4p − 3q) − (2 − 2p − q)²'],
        ['E(Y)', 'E(Y) = E(X₁) − E(X₂) = <b>0</b> (identical distributions)'],
        ['V(Y): independent → the variances add', 'V(Y) = V(X₁) + V(X₂) = <b>2[(4 − 4p − 3q) − (2 − 2p − q)²]</b>'],
        ['Check numerically', `<div class="controls">${UI.slider('yp', 'p', 0, 1, 0.05, 0.3)}${UI.slider('yq', 'q', 0, 1, 0.05, 0.3)}</div><div id="yChk"></div>`],
      ])}`,
    init(root) {
      UI.bind(root, ['ea', 'eb'], v => {
        const xs = [1, 2, 3, 4, 5, 6], ys = xs.map(x => v.ea * x + v.eb);
        const lo = Math.min(0, ...ys) - 1, hi = Math.max(7, ...ys) + 1;
        const p = Plot.make(root.querySelector('#evChart'), { x: [lo, hi], y: [0, 0.3], h: 220, xlab: 'value' });
        p.bars(xs.map(x => ({ x: x - 0.17, y: 1 / 6 })), { width: 0.34, color: 'var(--s1)', tip: b => `X = ${Math.round(b.x + 0.17)}: P = 1/6` });
        p.bars(ys.map(y => ({ x: y + 0.17, y: 1 / 6 })), { width: 0.34, color: 'var(--s2)', tip: b => `Y = ${f(b.x - 0.17, 2)}: P = 1/6` });
        p.vline(3.5, { color: 'var(--s1)', label: 'E(X) = 3.5', ly: 0.29 }); p.vline(v.ea * 3.5 + v.eb, { color: 'var(--s2)', label: `E(Y) = ${f(v.ea * 3.5 + v.eb, 2)}`, ly: 0.25 });
        root.querySelector('#evOut').innerHTML = `<div class="stat"><div class="k">E(X), V(X)</div><div class="v">3.5, ${f(35 / 12, 3)}</div></div>
          <div class="stat big"><div class="k">E(Y) = a·3.5 + b</div><div class="v">${f(v.ea * 3.5 + v.eb, 3)}</div></div>
          <div class="stat big"><div class="k">V(Y) = a²·V(X) = ${v.ea ** 2} × 2.917</div><div class="v">${f(v.ea ** 2 * 35 / 12, 3)}</div></div>`;
      });
      const probs = [0.6, 24 / 90, 0.1, 144 / 5040, 144 / 30240]; let tally = null, N = 0;
      const one = () => { const urn = ['B', 'B', 'B', 'B', 'W', 'W', 'W', 'W', 'W', 'W']; const seq = []; while (true) { const i = Math.floor(Math.random() * urn.length); const b = urn.splice(i, 1)[0]; seq.push(b); if (b === 'W') break; } return seq; };
      const chart = () => {
        const p = Plot.make(root.querySelector('#urnChart'), { x: [-0.7, 4.7], y: [0, 0.7], h: 200, xlab: 'X = number of black balls before the first white' });
        p.bars(probs.map((y, x) => ({ x, y })), { color: 'var(--s1)', tip: b => `P(X = ${b.x}) = <b>${f(b.y)}</b>${tally ? `<br>simulated <b>${f((tally[b.x] || 0) / N)}</b>` : ''}` });
        if (tally) probs.forEach((_, x) => p.dot(x, (tally[x] || 0) / N, { color: 'var(--s2)' }));
        p.vline(4 / 7, { label: 'E(X) = 4/7', ly: 0.68 });
      };
      root.querySelector('#urnGo').onclick = () => { const s = one(); root.querySelector('#urnView').innerHTML = `<div class="trials">${s.map(b => `<span style="background:${b === 'B' ? '#222' : '#ddd'};color:${b === 'B' ? '#fff' : '#222'};border:1px solid var(--border)">${b}</span>`).join('')}</div><p>X = <b>${s.length - 1}</b></p>`; tally = tally || {}; tally[s.length - 1] = (tally[s.length - 1] || 0) + 1; N++; chart(); };
      root.querySelector('#urn5k').onclick = () => { tally = tally || {}; for (let i = 0; i < 5000; i++) { const s = one(); tally[s.length - 1] = (tally[s.length - 1] || 0) + 1; N++; } root.querySelector('#urnView').innerHTML = `<p>${N} draws so far. The orange dots (simulation) match the bars (theory).</p>`; chart(); };
      chart();
      UI.bind(root, ['yp', 'yq'], v => {
        let p = v.yp, q = v.yq; if (p + q > 1) q = 1 - p;
        const r = 1 - p - q, EX = q + 2 * r, VX = q + 4 * r - EX * EX;
        root.querySelector('#yChk').innerHTML = `With p = ${p}, q = ${f(q, 2)}: E(X) = ${f(EX)}, V(X) = ${f(VX)} ⇒ <b>E(Y) = 0, V(Y) = ${f(2 * VX)}</b>`;
      });
    }
  });

  /* ------------------------------------------------------------------ */
  /* MEAN vs MEDIAN                                                       */
  /* ------------------------------------------------------------------ */
  App.add({
    id: 'median', group: G, icon: '⚖️', week: 'Wk 3', title: 'Mean vs median: which is more reliable?',
    html: () => `
      <p class="lead">Both the sample mean and the sample median estimate the centre of a normal population. The better estimator is the one with the <b>smaller variance</b> (it is more <b>efficient</b>).</p>
      <div class="card">
        <div class="controls">${UI.slider('mdn', 'n (sample size is 2n + 1)', 1, 50, 1, 5)}<div class="ctl" style="max-width:170px"><button class="btn primary" id="mdGo">Simulate 4000 samples</button></div></div>
        <div id="mdChart"></div>${UI.legend([['var(--s1)', 'sample means'], ['var(--s2)', 'sample medians']])}
        <div class="readout" id="mdOut"></div>
        ${UI.idea(`The orange histogram (medians) is always <b>wider</b> than the blue one (means). For normal data the ratio of the variances is π/2 ≈ 1.57. The median "wastes" information by using only the middle value.`)}
      </div>
      ${UI.steps('Nov 2024 (22 batch) · Q3 a · 5 marks', 'For large n, the median of samples of size 2n + 1 is approximately normal with mean μ̃ and variance 1/(8[f(μ̃)]²n). Show that for normal populations the mean is more reliable than the median.', [
        ['Variance of the sample mean (size 2n + 1)', `V(x̄) = ${F('σ²', '2n + 1')} ≈ ${F('σ²', '2n')} for large n`],
        ['Normal density at the median (= μ)', `f(μ̃) = ${F(1, 'σ√(2π)')} ⇒ [f(μ̃)]² = ${F(1, '2πσ²')}`],
        ['Variance of the median', `V(median) = ${F(1, '8n · 1/(2πσ²)')} = ${F('2πσ²', '8n')} = ${F('πσ²', '4n')}`],
        ['Compare (ratio)', `${F('V(median)', 'V(x̄)')} = ${F('πσ²/(4n)', 'σ²/(2n)')} = ${F('π', 2)} ≈ <b>1.571 &gt; 1</b>`],
        ['Conclusion', 'The median has about 57% more variance than the mean. So the mean is the more efficient (more reliable) estimator of the centre of a normal population.'],
      ])}`,
    init(root) {
      let n = 5;
      const sim = () => {
        const m = 2 * n + 1, means = [], meds = [];
        for (let k = 0; k < 4000; k++) { const s = Array.from({ length: m }, S.randn).sort((a, b) => a - b); means.push(S.mean(s)); meds.push(s[n]); }
        const lim = 4 * Math.sqrt(Math.PI / (2 * m)), nb = 40, w = 2 * lim / nb;
        const h = arr => { const c = Array(nb).fill(0); arr.forEach(x => { const i = Math.floor((x + lim) / w); if (i >= 0 && i < nb) c[i]++; }); return c.map(v => v / (arr.length * w)); };
        const hm = h(means), hd = h(meds), ym = Math.max(...hm, ...hd) * 1.1;
        const p = Plot.make(root.querySelector('#mdChart'), { x: [-lim, lim], y: [0, ym], h: 240, xlab: 'estimate of μ (true μ = 0)' });
        p.bars(hd.map((y, i) => ({ x: -lim + (i + 0.5) * w, y })), { width: w, color: 'var(--s2)', opacity: 0.55 });
        p.bars(hm.map((y, i) => ({ x: -lim + (i + 0.5) * w, y })), { width: w * 0.55, color: 'var(--s1)', opacity: 0.85 });
        const vm = S.variance(means), vd = S.variance(meds);
        root.querySelector('#mdOut').innerHTML = `<div class="stat"><div class="k">V(mean) (theory 1/${m})</div><div class="v">${f(vm, 4)}</div></div><div class="stat"><div class="k">V(median)</div><div class="v">${f(vd, 4)}</div></div><div class="stat big"><div class="k">ratio V(median)/V(mean) → π/2 = 1.571</div><div class="v">${f(vd / vm, 3)}</div></div>`;
      };
      UI.bind(root, ['mdn'], v => { n = v.mdn; sim(); });
      root.querySelector('#mdGo').onclick = sim;
    }
  });

  /* ------------------------------------------------------------------ */
  /* LATIN SQUARE                                                         */
  /* ------------------------------------------------------------------ */
  const LS = [
    [['D2', 38], ['D3', 39], ['D4', 45], ['D5', 41], ['D1', 40]],
    [['D4', 32], ['D5', 37], ['D1', 38], ['D2', 30], ['D3', 35]],
    [['D1', 35], ['D2', 36], ['D3', 37], ['D4', 32], ['D5', 33]],
    [['D5', 33], ['D1', 30], ['D2', 35], ['D3', 33], ['D4', 30]],
    [['D3', 36], ['D4', 38], ['D5', 39], ['D1', 35], ['D2', 41]],
  ];
  function latin() {
    const p = 5, all = LS.flat().map(c => c[1]), N = 25, G = S.sum(all), CF = G * G / N;
    const SST = S.sum(all.map(y => y * y)) - CF;
    const rowT = LS.map(r => S.sum(r.map(c => c[1]))), colT = [0, 1, 2, 3, 4].map(j => S.sum(LS.map(r => r[j][1])));
    const trT = {}; LS.flat().forEach(([d, y]) => trT[d] = (trT[d] || 0) + y);
    const SSR = S.sum(rowT.map(t => t * t)) / p - CF, SSC = S.sum(colT.map(t => t * t)) / p - CF, SSTr = S.sum(Object.values(trT).map(t => t * t)) / p - CF;
    const SSE = SST - SSR - SSC - SSTr, dfE = (p - 1) * (p - 2);
    const MS = { r: SSR / 4, c: SSC / 4, t: SSTr / 4, e: SSE / dfE };
    return { G, CF, SST, rowT, colT, trT, SSR, SSC, SSTr, SSE, dfE, MS, Ft: MS.t / MS.e, Fr: MS.r / MS.e, Fc: MS.c / MS.e, crit: S.fCrit(0.05, 4, dfE), sumsq: S.sum(all.map(y => y * y)) };
  }
  const TCOL = { D1: 'var(--s1)', D2: 'var(--s2)', D3: 'var(--s3)', D4: '#eda100', D5: '#e87ba4' };

  App.add({
    id: 'doe', group: G, icon: '🔳', week: 'Jan 2023', title: 'Design of experiments: Latin square',
    html: () => {
      const L = latin();
      return `
      <p class="lead">A <b>Latin square</b> tests p treatments while controlling <b>two</b> nuisance factors (rows and columns). Each treatment appears <b>exactly once in every row and every column</b>.</p>
      <div class="card">
        <h3>Jan 2023 Q4A: stress-relief activities (treatments D1–D5)</h3>
        <p>Rows = type of project, columns = time interval of the day. <b>Hover over a treatment</b> in the legend to check that it appears once per row and once per column.</p>
        <div id="lsGrid"></div>
        <div class="legend" id="lsLeg">${Object.keys(TCOL).map(d => `<span data-d="${d}" style="cursor:pointer"><i style="background:${TCOL[d]}"></i>${d}</span>`).join('')}</div>
        <b>Treatment totals</b><div id="lsBars"></div>
      </div>
      <div class="fb">y<sub>ij(k)</sub> = μ + ρ<sub>i</sub> + γ<sub>j</sub> + τ<sub>k</sub> + ε<sub>ij(k)</sub></div>
      <p><b>μ</b> = overall mean performance score; <b>ρ<sub>i</sub></b> = effect of the i-th project type (row); <b>γ<sub>j</sub></b> = effect of the j-th time interval (column); <b>τ<sub>k</sub></b> = effect of the k-th stress-relief activity (treatment); <b>ε<sub>ij(k)</sub></b> ~ N(0, σ²) independent random errors; i, j, k = 1, …, 5 and Σρ = Σγ = Στ = 0.</p>
      ${UI.steps('Jan 2023 (20 batch) · Q4 A · 18 marks', 'Using the 5 × 5 Latin square, (i)(a) how many treatments are there, and what are they? (b) How many replicates? (ii) Write the statistical model. (iii) Test at 5% that there is no difference between the activities.', [
        ['(i)(a) Treatments', '<b>5 treatments</b>: the five stress-releasing activities D1, D2, D3, D4, D5.'],
        ['(i)(b) Replicates', 'Each treatment appears once in each of the 5 rows, so there are <b>5 replicates</b> of every treatment (25 runs in total).'],
        ['(ii) Model', 'y<sub>ij(k)</sub> = μ + ρ<sub>i</sub> + γ<sub>j</sub> + τ<sub>k</sub> + ε<sub>ij(k)</sub> (parameters defined above).'],
        ['(iii) Hypotheses', 'H₀: τ₁ = τ₂ = … = τ₅ = 0 (no difference between activities) &nbsp; vs &nbsp; H₁: at least one τ<sub>k</sub> ≠ 0'],
        ['Correction factor', `Grand total G = ${L.G}; CF = G²/N = ${L.G}²/25 = <b>${f(L.CF, 2)}</b>`],
        ['Total SS', `SST = Σy² − CF = ${L.sumsq} − ${f(L.CF, 2)} = <b>${f(L.SST, 2)}</b>`],
        ['Row (project) SS', `Row totals: ${L.rowT.join(', ')} → SS<sub>rows</sub> = Σ(R²)/5 − CF = <b>${f(L.SSR, 2)}</b>`],
        ['Column (time) SS', `Column totals: ${L.colT.join(', ')} → SS<sub>cols</sub> = <b>${f(L.SSC, 2)}</b>`],
        ['Treatment (activity) SS', `Totals: ${Object.entries(L.trT).sort().map(([d, t]) => `${d} = ${t}`).join(', ')} → SS<sub>treat</sub> = <b>${f(L.SSTr, 2)}</b>`],
        ['Error SS', `SSE = SST − SS<sub>rows</sub> − SS<sub>cols</sub> − SS<sub>treat</sub> = <b>${f(L.SSE, 2)}</b>, df = (p − 1)(p − 2) = 12`],
        ['ANOVA table', `<div class="tablewrap"><table class="t"><tr><th>Source</th><th>SS</th><th>df</th><th>MS</th><th>F</th></tr>
          <tr><td class="l">Project (rows)</td><td>${f(L.SSR, 2)}</td><td>4</td><td>${f(L.MS.r, 3)}</td><td>${f(L.Fr, 3)}</td></tr>
          <tr><td class="l">Time (cols)</td><td>${f(L.SSC, 2)}</td><td>4</td><td>${f(L.MS.c, 3)}</td><td>${f(L.Fc, 3)}</td></tr>
          <tr><td class="l"><b>Activity (treatments)</b></td><td>${f(L.SSTr, 2)}</td><td>4</td><td>${f(L.MS.t, 3)}</td><td><b>${f(L.Ft, 3)}</b></td></tr>
          <tr><td class="l">Error</td><td>${f(L.SSE, 2)}</td><td>12</td><td>${f(L.MS.e, 3)}</td><td></td></tr>
          <tr><td class="l">Total</td><td>${f(L.SST, 2)}</td><td>24</td><td></td><td></td></tr></table></div>`],
        ['Decision', `F = ${f(L.Ft, 3)} vs F<sub>0.05</sub>(4, 12) = ${f(L.crit, 3)} → ${L.Ft > L.crit ? '<span class="reject">reject H₀</span>: the activities differ significantly in their effect on performance.' : '<span class="accept">do not reject H₀</span>: there is no significant difference in performance between the five stress-relief activities at the 5% level.'} (p = ${f(1 - S.fCdf(L.Ft, 4, 12))})`],
      ])}
      <div id="lsChart"></div>`;
    },
    init(root) {
      const L = latin();
      const grid = root.querySelector('#lsGrid');
      grid.innerHTML = `<div class="tablewrap"><table class="t"><tr><th>Project \\ Time</th>${[1, 2, 3, 4, 5].map(j => `<th>${j}</th>`).join('')}<th>Row total</th></tr>${LS.map((r, i) => `<tr><th>${i + 1}</th>${r.map(([d, y]) => `<td data-d="${d}" style="background:color-mix(in srgb, ${TCOL[d]} 35%, var(--surface-1));min-width:70px;transition:opacity .2s"><b>${d}</b><br>${y}</td>`).join('')}<td><b>${L.rowT[i]}</b></td></tr>`).join('')}<tr><th>Col total</th>${L.colT.map(t => `<td><b>${t}</b></td>`).join('')}<td><b>${L.G}</b></td></tr></table></div>`;
      root.querySelectorAll('#lsLeg [data-d]').forEach(s => {
        s.addEventListener('mouseenter', () => grid.querySelectorAll('td[data-d]').forEach(td => td.style.opacity = td.dataset.d === s.dataset.d ? 1 : 0.15));
        s.addEventListener('mouseleave', () => grid.querySelectorAll('td[data-d]').forEach(td => td.style.opacity = 1));
      });
      const ds = Object.keys(TCOL);
      const p = Plot.make(root.querySelector('#lsBars'), { x: [-0.6, 4.6], y: [0, Math.max(...Object.values(L.trT)) * 1.15], h: 200, xticks: [0, 1, 2, 3, 4], xfmt: i => ds[i], ylab: 'total score' });
      p.bars(ds.map((d, i) => ({ x: i, y: L.trT[d], color: TCOL[d] })), { width: 0.6, tip: b => `${ds[b.x]} total = <b>${b.y}</b> (mean ${f(b.y / 5, 2)})` });
      UI.testPlot(root.querySelector('#lsChart'), { dist: 'F', df: 4, df2: 12, tail: 'right', alpha: 0.05, stat: L.Ft, h: 200 });
    }
  });

  /* ------------------------------------------------------------------ */
  /* SAMPLING TECHNIQUES                                                  */
  /* ------------------------------------------------------------------ */
  const ACT = ['Chess', 'Athletics', 'Arts', 'Music', 'Debating', 'Drama'], BOYS = [24, 80, 43, 42, 25, 82], GIRLS = [16, 85, 50, 36, 28, 54];
  function allocate(cells, n) {
    const N = S.sum(cells), raw = cells.map(c => n * c / N), fl = raw.map(Math.floor);
    let left = n - S.sum(fl); const order = raw.map((r, i) => [r - fl[i], i]).sort((a, b) => b[0] - a[0]);
    for (let k = 0; k < left; k++) fl[order[k][1]]++;
    return { raw, alloc: fl };
  }
  App.add({
    id: 'sampling', group: G, icon: '🧺', week: 'Nov 2023', title: 'Sampling techniques',
    html: () => {
      const all = [...BOYS, ...GIRLS], al = allocate(all, 60), Nb = S.sum(BOYS), Ng = S.sum(GIRLS);
      return `
      <p class="lead">How you choose the sample decides whether it represents the population. Press the buttons to see which individuals each method picks.</p>
      <div class="card">
        <p>Population: 120 students in <b>6 classrooms</b> (the boxes are clusters). Each student is a <span class="hl1">● boy</span> or a <span class="hl2">■ girl</span> (the strata).</p>
        <div class="btnrow"><button class="btn" data-m="srs">Simple random</button><button class="btn" data-m="sys">Systematic</button><button class="btn" data-m="str">Stratified</button><button class="btn" data-m="clu">Cluster</button></div>
        <div id="spView"></div><div id="spTxt" class="result-card">Pick a method…</div>
      </div>
      <div class="card"><table class="t"><tr><th>Method</th><th>How</th><th>Use when</th></tr>
        <tr><td class="l"><b>Simple random (SRS)</b></td><td class="l">Every member has an equal chance (lottery / random numbers)</td><td class="l">The population is fairly uniform and a full list is available</td></tr>
        <tr><td class="l"><b>Systematic</b></td><td class="l">Random start, then every k-th member (k = N/n)</td><td class="l">The list has no periodic pattern; quick to do</td></tr>
        <tr><td class="l"><b>Stratified</b></td><td class="l">Split into strata (similar inside, different between) and take an SRS from each, in proportion</td><td class="l">The population has distinct subgroups that must all be represented → more precise</td></tr>
        <tr><td class="l"><b>Cluster</b></td><td class="l">Randomly pick whole groups (clusters) and take everyone in them</td><td class="l">The population is spread out and each cluster is a "mini-population"; cheap</td></tr></table></div>
      ${UI.idea(`<b>Strata vs clusters:</b> strata are <b>different from each other</b> (boys vs girls), so you sample from <b>every</b> stratum. Clusters are <b>alike</b> (each classroom is a mixed mini-population), so you only need a <b>few whole</b> clusters.`)}
      <h2>📝 Nov 2023 (21 batch) · Q4 b · 13 marks</h2>
      <div class="card"><b>Table 4.2</b><div class="tablewrap"><table class="t"><tr><th></th>${ACT.map(a => `<th>${a}</th>`).join('')}<th>Total</th></tr><tr><th>Boys</th>${BOYS.map(b => `<td>${b}</td>`).join('')}<td>${Nb}</td></tr><tr><th>Girls</th>${GIRLS.map(b => `<td>${b}</td>`).join('')}<td>${Ng}</td></tr><tr><th>Total</th>${BOYS.map((b, i) => `<td>${b + GIRLS[i]}</td>`).join('')}<td>${Nb + Ng}</td></tr></table></div></div>
      ${UI.steps('Nov 2023 Q4 b', '(i) Which is most suitable: SRS, stratified or cluster? Why? (ii) Explain how to select a random sample of 60. (iii) How many boys and girls with stratified sampling? (iv) Tabulate the numbers selected.', [
        ['(i) Stratified sampling', 'The students fall into clear, non-overlapping groups (gender × activity) whose homework time is likely to differ. Stratifying makes sure every group is represented in proportion, and gives more precise estimates than SRS. Cluster sampling suits groups that are similar to each other, which is not the case here.'],
        ['(ii) Procedure', 'Get a list (sampling frame) of the students in each stratum. Work out each stratum\'s sample size in proportion to its size, n<sub>h</sub> = 60 × N<sub>h</sub>/N. Number the students in each stratum and select n<sub>h</sub> of them by simple random sampling (random number table or lottery, without replacement). Combine to get the sample of 60.'],
        ['(iii) Boys and girls', `N = ${Nb + Ng}. Boys: 60 × ${Nb}/${Nb + Ng} = ${f(60 * Nb / (Nb + Ng), 2)} ≈ <b>31</b>; Girls: 60 × ${Ng}/${Nb + Ng} = ${f(60 * Ng / (Nb + Ng), 2)} ≈ <b>29</b>`],
        ['(iv) Allocation table (proportional, rounded so it totals 60)', `<div class="tablewrap"><table class="t"><tr><th></th>${ACT.map(a => `<th>${a}</th>`).join('')}<th>Total</th></tr>
          <tr><th>Boys</th>${BOYS.map((_, i) => `<td><b>${al.alloc[i]}</b><br><small>${f(al.raw[i], 2)}</small></td>`).join('')}<td><b>${S.sum(al.alloc.slice(0, 6))}</b></td></tr>
          <tr><th>Girls</th>${GIRLS.map((_, i) => `<td><b>${al.alloc[i + 6]}</b><br><small>${f(al.raw[i + 6], 2)}</small></td>`).join('')}<td><b>${S.sum(al.alloc.slice(6))}</b></td></tr>
          <tr><th>Total</th>${BOYS.map((_, i) => `<td>${al.alloc[i] + al.alloc[i + 6]}</td>`).join('')}<td><b>60</b></td></tr></table></div><small>Small numbers = exact 60 × N<sub>h</sub>/565. The largest remainders were rounded up so the total is exactly 60.</small>`],
      ])}`;
    },
    init(root) {
      // population: 6 clusters × 20, gender random but fixed
      let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
      const pop = Array.from({ length: 120 }, (_, i) => ({ i, c: Math.floor(i / 20), g: rnd() < 0.55 ? 'B' : 'G' }));
      const draw = (sel, txt) => {
        const W = 660, H = 230, svg = Plot.el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'viz' });
        for (let c = 0; c < 6; c++) {
          const bx = 8 + c * 108, by = 8;
          svg.append(Plot.el('rect', { x: bx, y: by, width: 100, height: 210, rx: 10 }, { fill: 'var(--surface-2)', stroke: sel && sel.clusters && sel.clusters.includes(c) ? 'var(--s4)' : 'var(--border)', strokeWidth: sel && sel.clusters && sel.clusters.includes(c) ? 3 : 1 }));
          const t = Plot.el('text', { x: bx + 50, y: by + 205, 'text-anchor': 'middle', class: 'tick' }); t.textContent = `class ${c + 1}`; svg.append(t);
        }
        pop.forEach(p => {
          const k = p.i % 20, cx = 8 + p.c * 108 + 20 + (k % 4) * 20, cy = 30 + Math.floor(k / 4) * 34;
          const on = !sel || sel.set.has(p.i);
          const col = p.g === 'B' ? 'var(--s1)' : 'var(--s2)';
          const sh = p.g === 'B' ? Plot.el('circle', { cx, cy, r: 7 }) : Plot.el('rect', { x: cx - 6.5, y: cy - 6.5, width: 13, height: 13, rx: 2 });
          Object.assign(sh.style, { fill: col, opacity: on ? 1 : 0.18, stroke: sel && on ? 'var(--text-primary)' : 'none', strokeWidth: 2 });
          svg.append(sh);
        });
        const v = root.querySelector('#spView'); v.innerHTML = ''; v.append(svg);
        if (txt) root.querySelector('#spTxt').innerHTML = txt;
      };
      draw(null);
      const pick = (arr, k) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, k); };
      root.querySelectorAll('[data-m]').forEach(b => b.onclick = () => {
        const m = b.dataset.m; let set, txt, clusters;
        if (m === 'srs') { set = new Set(pick(pop.map(p => p.i), 12)); txt = '<b>Simple random sample (n = 12):</b> any 12 students, all equally likely. By chance it may contain too many boys or miss a classroom completely.'; }
        if (m === 'sys') { const start = Math.floor(Math.random() * 10); set = new Set(pop.filter(p => p.i % 10 === start).map(p => p.i)); txt = `<b>Systematic (k = 120/12 = 10):</b> random start = ${start + 1}, then every 10th student on the list.`; }
        if (m === 'str') { const B = pop.filter(p => p.g === 'B').map(p => p.i), Gl = pop.filter(p => p.g === 'G').map(p => p.i); const nb = Math.round(12 * B.length / 120); set = new Set([...pick(B, nb), ...pick(Gl, 12 - nb)]); txt = `<b>Stratified, proportional:</b> boys ${B.length}/120 → ${nb} boys; girls ${Gl.length}/120 → ${12 - nb} girls. Each gender is represented in exactly the right proportion.`; }
        if (m === 'clu') { clusters = pick([0, 1, 2, 3, 4, 5], 1); set = new Set(pop.filter(p => clusters.includes(p.c)).map(p => p.i)); txt = `<b>Cluster:</b> class ${clusters[0] + 1} was chosen at random and <i>everyone</i> in it is sampled. It is cheap (one room), but it only works well if each class is a mini-copy of the school.`; }
        draw({ set, clusters }, txt);
      });
    }
  });
})();
