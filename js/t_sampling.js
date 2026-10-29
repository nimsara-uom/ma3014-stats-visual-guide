/* ===== WEEKS 3–5 : SAMPLING DISTRIBUTIONS, t/χ²/F, CONFIDENCE INTERVALS ===== */
(function () {
  const F = UI.frac, R = UI.sqrt, f = S.fmt;
  const G = 'Part B · Sampling & estimation';

  /* ------------------------------------------------------------------ */
  /* CLT                                                                  */
  /* ------------------------------------------------------------------ */
  const POPS = {
    unif: { name: 'Uniform (flat)', mu: 5, sd: 10 / Math.sqrt(12), r: () => Math.random() * 10, pdf: x => (x >= 0 && x <= 10) ? 0.1 : 0, x: [0, 10] },
    skew: { name: 'Skewed (exponential)', mu: 5, sd: 5, r: () => S.rexp(0.2), pdf: x => S.expPdf(x, 0.2), x: [0, 25] },
    bi: { name: 'Two humps (bimodal)', mu: 5, sd: Math.sqrt(7.25), r: () => (Math.random() < 0.5 ? 2.5 : 7.5) + S.randn(), pdf: x => 0.5 * S.normPdf(x, 2.5, 1) + 0.5 * S.normPdf(x, 7.5, 1), x: [-1, 11] },
    bern: { name: 'Yes/No (p = 0.3)', mu: 0.3, sd: Math.sqrt(0.21), r: () => Math.random() < 0.3 ? 1 : 0, pdf: null, x: [-0.2, 1.2] },
  };

  App.add({
    id: 'clt', group: G, icon: '🎯', week: 'Wk 3', title: 'Sampling distributions & CLT',
    html: () => `
      <p class="lead">Take a sample, compute its mean x̄, then do it again and again. The x̄ values have their own distribution, called the <b>sampling distribution of the mean</b>. The <b>Central Limit Theorem</b> says it is approximately Normal for large n, <i>whatever the shape of the population</i>.</p>
      <div class="fb">x̄ ~ N(μ, ${F('σ²', 'n')}) &nbsp;&nbsp;⇒&nbsp;&nbsp; Z = ${F('x̄ − μ', 'σ/√n')} &nbsp;&nbsp;&nbsp;&nbsp; p̂ ~ N(P, ${F('PQ', 'n')})</div>
      <div class="card">
        <h3>The CLT machine</h3>
        <div class="controls">${UI.seg('pop', Object.entries(POPS).map(([k, p]) => [k, p.name]), 'skew')}</div>
        <div class="grid2"><div><b>① The population</b> (not Normal!)<div id="popChart"></div></div><div><b>② One sample of size n</b> (dots) and its mean (▲)<div id="sampChart"></div></div></div>
        <div class="controls">${UI.slider('cn', 'sample size n', 1, 100, 1, 2)}
          <div class="btnrow"><button class="btn" id="d1">Draw 1 sample</button><button class="btn" id="d100">+100 samples</button><button class="btn primary" id="d1000">+2000 samples</button><button class="btn" id="dclr">Reset</button></div></div>
        <b>③ Histogram of all the sample means x̄</b>
        <div id="meanChart"></div>
        ${UI.legend([['var(--s1)', 'sample means you drew'], ['var(--s2)', 'CLT prediction N(μ, σ²/n)', true]])}
        <div class="readout" id="cltOut"></div>
        ${UI.idea(`Try the <b>skewed</b> population with n = 2: the histogram is still skewed. Slide n up to 30: it becomes a <b>bell</b>, and it gets <b>narrower</b>. The width is the <b>standard error</b> σ/√n. To halve it you need <b>4×</b> the sample size.`)}
      </div>
      <div class="card"><h3>When is n "large enough"? (tutorial rules)</h3>
        <table class="t"><tr><th class="l">Population / sampling distribution shape</th><th>n needed</th></tr>
        <tr><td class="l">Population is Normal</td><td>any n</td></tr>
        <tr><td class="l">Symmetric, unimodal, no outliers</td><td>n ≤ 15 is fine</td></tr>
        <tr><td class="l">Moderately skewed, unimodal, no outliers</td><td>16 ≤ n ≤ 40</td></tr>
        <tr><td class="l">Anything without outliers</td><td>n &gt; 40</td></tr>
        <tr><td class="l">Rule of thumb</td><td>n ≥ 30</td></tr></table>
        <p><b>Finite population correction:</b> when sampling <b>without replacement</b> and n is more than about 5–10% of N, use SE = ${F('σ', '√n')}${R(F('N − n', 'N − 1'))}. If N ≫ n, the factor ≈ 1.</p>
      </div>
      ${UI.trap(`<ul><li>V(x̄) = σ²/n, <b>not</b> σ². The SD of x̄ (σ/√n) is called the <b>standard error</b>.</li><li>N(20, 45) means variance 45, so SE = √(45/25) = 1.342 when n = 25.</li><li>The CLT is about the distribution of the <b>sample mean</b>, not the raw data.</li></ul>`)}

      <h2>📝 Past paper questions</h2>
      ${UI.steps('Nov 2025 (23 batch) · Q1 b, c, d · 13 marks', `(b) Define the distribution of the sample mean using the CLT and state all conditions. (c) A sample of 25 is taken from a non-normal population. When can the CLT be used? (d) The sampling distribution is moderately skewed; μ = 20, σ² = 45. Find P(17 < x̄ < 23).`, [
        ['(b) Statement', `If X₁, …, X<sub>n</sub> is a <u>random sample</u> (independent, identically distributed) from any population with mean μ and finite variance σ², then for <u>large n</u> (n ≥ 30) x̄ ~ N(μ, σ²/n) approximately. If the population is Normal, this holds exactly for any n.`],
        ['(c) n = 25 is between 16 and 40', `The CLT can be used if the population/sampling distribution is only <u>moderately skewed</u>, <u>unimodal</u>, and has <u>no outliers</u>, and the sample is random.`],
        ['(d) Standard error', `SE = √(45/25) = <b>${f(Math.sqrt(45 / 25))}</b>. So x̄ ~ N(20, 1.8)`],
        ['Standardise', `P(17 < x̄ < 23) = P(${F('17 − 20', '1.342')} < Z < ${F('23 − 20', '1.342')}) = P(−2.236 < Z < 2.236)`],
        ['Answer', `= 2Φ(2.236) − 1 = <b>${f(2 * S.normCdf(3 / Math.sqrt(1.8)) - 1)}</b>`],
      ])}
      ${UI.steps('Jun 2022 (19 batch) · Q3 a · 5 marks', `p̂₁ and p̂₂ are distributed as N(P₁, P₁Q₁/n₁) and N(P₂, P₂Q₂/n₂). Derive the sampling distribution of p̂₁ − p̂₂ for large samples.`, [
        ['Mean of a difference', `E(p̂₁ − p̂₂) = E(p̂₁) − E(p̂₂) = P₁ − P₂`],
        ['Variance of a difference of INDEPENDENT variables: the variances ADD', `V(p̂₁ − p̂₂) = V(p̂₁) + V(p̂₂) − 2Cov = ${F('P₁Q₁', 'n₁')} + ${F('P₂Q₂', 'n₂')} (Cov = 0 because the samples are independent)`],
        ['A linear combination of normals is normal', `p̂₁ − p̂₂ ~ N( P₁ − P₂ , ${F('P₁Q₁', 'n₁')} + ${F('P₂Q₂', 'n₂')} )`],
      ])}
      ${UI.steps('Jan 2023 (20 batch) · Q1 A(i) · 6 marks', `P₁ = 0.40 of men and P₂ = 0.25 of women favour a tax. n₁ = 500 men and n₂ = 400 women are interviewed. Specify the approximate sampling distributions of the sample proportions.`, [
        ['Men', `p̂₁ ~ N(0.40, ${F('0.40 × 0.60', 500)}) = N(0.40, ${f(0.4 * 0.6 / 500, 6)})`],
        ['Women', `p̂₂ ~ N(0.25, ${F('0.25 × 0.75', 400)}) = N(0.25, ${f(0.25 * 0.75 / 400, 6)})`],
        ['Why it is valid', `n is large and nP, nQ ≥ 5 in both groups, so the CLT applies to the sample proportion (a mean of 0/1 Bernoulli values).`],
      ])}
      ${UI.steps('Tutorial · Biased coin', `A coin has P(heads) = 0.4. In 1000 tosses, find P(number of heads exceeds 410).`, [
        ['Sampling distribution of the count', `X ~ Bin(1000, 0.4) ≈ N(400, 240), σ = ${f(Math.sqrt(240))}`],
        ['Continuity correction', `P(X > 410) ≈ P(Y > 410.5) = P(Z > ${f(10.5 / Math.sqrt(240), 3)}) = <b>${f(1 - S.normCdf(10.5 / Math.sqrt(240)))}</b>`],
      ])}
      ${UI.steps('Tutorial · Rookie batter', `A batter is expected to have P = 0.3. In 300 at-bats he gets 0.267. Bad luck or not?`, [
        ['Sampling distribution of p̂', `p̂ ~ N(0.3, 0.3×0.7/300), SE = ${f(Math.sqrt(0.21 / 300))}`],
        ['How unusual is 0.267?', `z = (0.267 − 0.3)/${f(Math.sqrt(0.21 / 300))} = ${f(-0.033 / Math.sqrt(0.21 / 300), 3)}. P(p̂ ≤ 0.267) = <b>${f(S.normCdf(-0.033 / Math.sqrt(0.21 / 300)))}</b>`],
        ['Conclusion', `About a 10% chance, so this is not very unusual. It could just be bad luck. There is no strong evidence that he should be sent back.`],
      ])}`,
    init(root) {
      let popKey = 'skew', n = 2, means = [], last = null;
      const pop = () => POPS[popKey];
      const drawPop = () => {
        const P = pop();
        if (P.pdf) {
          let ym = 0; for (let i = 0; i <= 200; i++) ym = Math.max(ym, P.pdf(P.x[0] + (P.x[1] - P.x[0]) * i / 200));
          const p = Plot.make(root.querySelector('#popChart'), { x: P.x, y: [0, ym * 1.2], h: 160, noY: true, margin: { l: 10 } });
          p.area(P.pdf, P.x[0], P.x[1], { color: 'var(--s3)', opacity: 0.3 }); p.curve(P.pdf, { color: 'var(--s3)' });
          p.vline(P.mu, { label: `μ = ${f(P.mu, 2)}`, ly: ym * 1.2 });
        } else {
          const p = Plot.make(root.querySelector('#popChart'), { x: P.x, y: [0, 0.8], h: 160, noY: true, margin: { l: 10 }, xticks: [0, 1], xfmt: t => t ? '1 = yes' : '0 = no' });
          p.bars([{ x: 0, y: 0.7, color: 'var(--s3)' }, { x: 1, y: 0.3, color: 'var(--s3)' }], { width: 0.4 });
        }
      };
      const drawSample = () => {
        const P = pop();
        const p = Plot.make(root.querySelector('#sampChart'), { x: P.x, y: [0, 1], h: 160, noY: true, margin: { l: 10 } });
        if (last) {
          last.forEach((v, i) => p.dot(v + (P.pdf ? 0 : (Math.random() - 0.5) * 0.3), 0.25 + ((i * 37) % 50) / 100, { r: 4, color: 'var(--s3)' }));
          const m = S.mean(last);
          p.text(m, 0.08, '▲', { color: 'var(--s2)', size: 18 }); p.text(m, 0.97, `x̄ = ${f(m, 3)}`, { color: 'var(--s2)', bold: true, bg: true });
        } else p.text((P.x[0] + P.x[1]) / 2, 0.5, 'press "Draw 1 sample"', { color: 'var(--text-muted)' });
      };
      const drawMeans = () => {
        const P = pop(), se = P.sd / Math.sqrt(n);
        const lo = popKey === 'bern' ? -0.05 : Math.max(P.x[0], P.mu - 4.5 * se), hi = popKey === 'bern' ? 1.05 : Math.min(P.x[1], P.mu + 4.5 * se);
        let bw = (hi - lo) / 40; if (popKey === 'bern') bw = Math.max(bw, 1 / n);
        const nb = Math.ceil((hi - lo) / bw), hist = Array(nb).fill(0);
        means.forEach(m => { const i = Math.floor((m - lo) / bw); if (i >= 0 && i < nb) hist[i]++; });
        const dens = hist.map(c => means.length ? c / (means.length * bw) : 0);
        const ym = Math.max(...dens, S.normPdf(P.mu, P.mu, se)) * 1.15;
        const p = Plot.make(root.querySelector('#meanChart'), { x: [lo, hi], y: [0, ym], h: 240, xlab: 'x̄', ylab: 'density' });
        p.bars(dens.map((d, i) => ({ x: lo + (i + 0.5) * bw, y: d })), { width: bw, color: 'var(--s1)', tip: b => `x̄ ≈ ${f(b.x, 3)}<br>count: <b>${Math.round(b.y * means.length * bw)}</b>` });
        p.curve(x => S.normPdf(x, P.mu, se), { color: 'var(--s2)', width: 2.5, top: true });
        const mm = means.length ? S.mean(means) : NaN, sdm = means.length > 1 ? S.sd(means) : NaN;
        root.querySelector('#cltOut').innerHTML = `<div class="stat"><div class="k">samples drawn</div><div class="v">${means.length}</div></div>
          <div class="stat"><div class="k">mean of x̄'s (→ μ = ${f(P.mu, 3)})</div><div class="v">${f(mm, 3)}</div></div>
          <div class="stat big"><div class="k">SD of x̄'s (→ σ/√n = ${f(se, 3)})</div><div class="v">${f(sdm, 3)}</div></div>`;
      };
      const draw = k => { const P = pop(); for (let j = 0; j < k; j++) { const s = Array.from({ length: n }, P.r); means.push(S.mean(s)); last = s; } drawSample(); drawMeans(); };
      const reset = () => { means = []; last = null; drawPop(); drawSample(); drawMeans(); };
      UI.bindSeg(root, 'pop', k => { popKey = k; reset(); });
      UI.bind(root, ['cn'], v => { n = v.cn; reset(); });
      root.querySelector('#d1').onclick = () => draw(1); root.querySelector('#d100').onclick = () => draw(100);
      root.querySelector('#d1000').onclick = () => draw(2000); root.querySelector('#dclr').onclick = reset;
    }
  });

  /* ------------------------------------------------------------------ */
  /* t, chi-square, F                                                     */
  /* ------------------------------------------------------------------ */
  App.add({
    id: 'tdist', group: G, icon: '📐', week: 'Wk 3–4', title: 't, χ² and F distributions',
    html: () => `
      <p class="lead">These three are the "measuring sticks" of inference. Each one answers a different question about a sample from a <b>Normal</b> population.</p>
      <div class="grid3">
        <div class="card"><b class="hl1">t</b>: how far is x̄ from μ when σ is <b>unknown</b>?<div class="f" style="margin-top:6px">t = ${F('x̄ − μ', 's/√n')} ~ t<sub>n−1</sub></div></div>
        <div class="card"><b class="hl3">χ²</b>: how big is s² compared with σ²?<div class="f" style="margin-top:6px">χ² = ${F('(n−1)s²', 'σ²')} ~ χ²<sub>n−1</sub></div></div>
        <div class="card"><b class="hl4">F</b>: how do two sample variances compare?<div class="f" style="margin-top:6px">F = ${F('s₁²/σ₁²', 's₂²/σ₂²')} ~ F(n₁−1, n₂−1)</div></div>
      </div>
      ${UI.tabs('td', [
        ['t distribution', `<div class="card"><div class="controls">${UI.slider('tv', 'degrees of freedom v', 1, 60, 1, 3)}</div><div id="tChart"></div>
          ${UI.legend([['var(--s1)', 't with v df', true], ['var(--text-muted)', 'standard normal Z', true]])}
          <ul><li>Mean 0, symmetric, bell-shaped, but with <b>fatter tails</b> than Z because s is itself random.</li><li>Variance = v/(v − 2) &gt; 1 (for v &gt; 2). As v → ∞, t → Z.</li><li>df = n − 1 (one df is "used up" estimating the mean).</li><li>Do <b>not</b> use it for small samples from clearly non-normal populations.</li></ul></div>`],
        ['χ² distribution', `<div class="card"><div class="controls">${UI.slider('cv', 'degrees of freedom v', 1, 40, 1, 4)}</div><div id="cChart"></div>
          <ul><li>Only positive values, <b>right-skewed</b>, and it becomes more symmetric as v grows.</li><li>Mean = v, variance = 2v (it is Gamma with α = v/2, β = 2).</li><li>For v ≥ 2 the peak (mode) is at v − 2.</li></ul></div>`],
        ['F distribution', `<div class="card"><div class="controls">${UI.slider('fv1', 'v₁ (numerator df)', 1, 40, 1, 10)}${UI.slider('fv2', 'v₂ (denominator df)', 1, 40, 1, 6)}</div><div id="fChart"></div>
          <ul><li>Ratio of two independent (χ²/df) values, so it is always positive and right-skewed.</li><li>Mean = v₂/(v₂ − 2) for v₂ &gt; 2.</li><li><b>Reciprocal rule:</b> F<sub>1−α</sub>(v₁, v₂) = 1 / F<sub>α</sub>(v₂, v₁). Use it to get lower-tail values from the table.</li></ul></div>`],
      ])}
      <div class="card">
        <h3>📖 How to read the statistical tables</h3>
        <p>Your tables give <b>upper-tail</b> critical values: the number with area <b>α to its RIGHT</b>. Choose a distribution and α and see where the value comes from.</p>
        <div class="controls">${UI.seg('lk', [['z', 'Z'], ['t', 't'], ['chi', 'χ²'], ['F', 'F']], 't')}${UI.slider('la', 'α (upper-tail area)', 0.005, 0.5, 0.005, 0.05)}${UI.slider('ld1', 'df / v₁', 1, 40, 1, 12)}${UI.slider('ld2', 'v₂ (F only)', 1, 40, 1, 15)}</div>
        <div id="lkChart"></div><div class="fb" id="lkOut"></div>
      </div>
      ${UI.trap(`<ul><li>χ² tables: <b>χ²<sub>0.05, 9</sub></b> means area 0.05 to the <b>right</b>. For a lower-tail value, use χ²<sub>0.95, 9</sub>.</li>
        <li>Notation varies. Some books write t<sub>0.95</sub> for the value with 95% to the <b>left</b>. Always draw the curve and shade the area before you look in the table.</li>
        <li>F: the <b>numerator</b> df come first. Mixing up v₁ and v₂ gives a wrong answer.</li></ul>`)}
      <h2>📝 Worked examples (tutorial)</h2>
      ${UI.steps('Tutorial · t', `A firm claims bulbs last 300 days on average. 15 bulbs average 290 days with s = 50. If the claim is true, find P(x̄ ≤ 290).`, [
        ['σ unknown and n is small → t with 14 df', `t = ${F('290 − 300', '50/√15')} = <b>${f(-10 / (50 / Math.sqrt(15)), 4)}</b>`],
        ['Area to the left', `P(T<sub>14</sub> ≤ −0.7746) = <b>${f(S.tCdf(-10 / (50 / Math.sqrt(15)), 14))}</b>`],
      ])}
      ${UI.steps('Tutorial · χ²', `Battery life has σ = 5 min. A sample of 10 batteries has s = 6 min. (a) Find the χ² statistic. (b) Find P(s > 6) for samples of size 10.`, [
        ['(a)', `χ² = ${F('(n−1)s²', 'σ²')} = ${F('9 × 36', 25)} = <b>12.96</b>, df = 9`],
        ['(b) Upper-tail area', `P(χ²₉ > 12.96) = <b>${f(1 - S.chiCdf(12.96, 9))}</b>`],
      ])}
      ${UI.steps('Tutorial · F', `Cows: n₁ = 11, σ₁ = 5, s₁ = 4.5. Bulls: n₂ = 7, σ₂ = 3.5, s₂ = 4. Compute F and its cumulative probability.`, [
        ['F statistic', `F = ${F('s₁²/σ₁²', 's₂²/σ₂²')} = ${F('20.25/25', '16/12.25')} = ${F('0.81', '1.3061')} = <b>${f(0.81 / (16 / 12.25))}</b>, with (10, 6) df`],
        ['Cumulative probability', `P(F ≤ ${f(0.81 / (16 / 12.25))}) = <b>${f(S.fCdf(0.81 / (16 / 12.25), 10, 6))}</b>. About ${f(S.fCdf(0.81 / (16 / 12.25), 10, 6) * 100, 0)}% of samples would give a smaller ratio.`],
      ])}
      ${UI.steps('Mid-sem MCQ · F reciprocal', `F = 2.48 has 95% cumulative probability with v₁ = 12, v₂ = 15. What does 1/2.48 represent?`, [
        ['Reciprocal rule', `If F ~ F(12, 15) then 1/F ~ F(15, 12). P(F ≤ 2.48) = 0.95 ⇔ P(1/F ≥ 1/2.48) = 0.95 ⇔ P(1/F ≤ 0.403) = 0.05`],
        ['Answer', `1/2.48 is the value with <b>5% cumulative probability when v₁ = 15 and v₂ = 12</b> (degrees of freedom swapped). Check: the upper 5% point of F(12, 15) is ${f(S.fCrit(0.05, 12, 15), 3)}, and the lower 5% point of F(15, 12) is ${f(S.fInv(0.05, 15, 12), 3)} = 1/${f(S.fCrit(0.05, 12, 15), 3)}.`],
      ])}`,
    init(root) {
      UI.bind(root, ['tv'], v => {
        const p = Plot.make(root.querySelector('#tChart'), { x: [-5, 5], y: [0, 0.45], h: 220, noY: true, margin: { l: 14 } });
        p.curve(x => S.normPdf(x), { color: 'var(--text-muted)', dash: '5 4' }); p.curve(x => S.tPdf(x, v.tv), { width: 2.5 });
        p.hover(x => `x = <b>${f(x, 2)}</b><br>t density <b>${f(S.tPdf(x, v.tv))}</b><br>Z density <b>${f(S.normPdf(x))}</b><br>P(T > |x|): t <b>${f(1 - S.tCdf(Math.abs(x), v.tv))}</b> vs Z <b>${f(1 - S.normCdf(Math.abs(x)))}</b>`);
      });
      UI.bind(root, ['cv'], v => {
        const k = v.cv, X = Math.max(12, k + 5 * Math.sqrt(2 * k));
        let ym = 0; for (let i = 1; i <= 200; i++) ym = Math.max(ym, Math.min(0.6, S.chiPdf(X * i / 200, k)));
        const p = Plot.make(root.querySelector('#cChart'), { x: [0, X], y: [0, ym * 1.15], h: 220, xlab: 'χ²' });
        p.curve(x => S.chiPdf(x, k), { color: 'var(--s3)', width: 2.5 }); p.vline(k, { label: `mean = ${k}`, ly: ym * 1.12 });
        p.hover(x => `χ² = <b>${f(x, 2)}</b><br>area to the right <b>${f(1 - S.chiCdf(x, k))}</b>`);
      });
      UI.bind(root, ['fv1', 'fv2'], v => {
        const X = 5; let ym = 0; for (let i = 1; i <= 200; i++) ym = Math.max(ym, Math.min(1.5, S.fPdf(X * i / 200, v.fv1, v.fv2)));
        const p = Plot.make(root.querySelector('#fChart'), { x: [0, X], y: [0, ym * 1.15], h: 220, xlab: 'F' });
        p.curve(x => S.fPdf(x, v.fv1, v.fv2), { color: 'var(--s4)', width: 2.5 });
        p.hover(x => `F = <b>${f(x, 2)}</b><br>area to the right <b>${f(1 - S.fCdf(x, v.fv1, v.fv2))}</b>`);
      });
      let d = 't', vv = {};
      const look = () => {
        const a = vv.la, k1 = vv.ld1, k2 = vv.ld2;
        const res = UI.testPlot(root.querySelector('#lkChart'), { dist: d, df: k1, df2: k2, tail: 'right', alpha: a, h: 220 });
        const c = res.crit[0];
        const name = d === 'z' ? `Z<sub>${a}</sub>` : d === 't' ? `t<sub>${a}, ${k1}</sub>` : d === 'chi' ? `χ²<sub>${a}, ${k1}</sub>` : `F<sub>${a}</sub>(${k1}, ${k2})`;
        root.querySelector('#lkOut').innerHTML = `${name} = <b>${f(c, 4)}</b> &nbsp;→ the red area to the right of it is ${a}` + (d === 'F' ? `<br><small>Lower tail: F<sub>${1 - a}</sub>(${k1}, ${k2}) = 1/F<sub>${a}</sub>(${k2}, ${k1}) = 1/${f(S.fCrit(a, k2, k1), 4)} = ${f(1 / S.fCrit(a, k2, k1), 4)}</small>` : '') +
          (d === 'chi' ? `<br><small>Lower-tail value χ²<sub>${f(1 - a, 3)}, ${k1}</sub> = ${f(S.chiCrit(1 - a, k1), 4)}</small>` : '');
      };
      UI.bindSeg(root, 'lk', x => { d = x; look(); });
      UI.bind(root, ['la', 'ld1', 'ld2'], x => { vv = x; look(); });
    }
  });

  /* ------------------------------------------------------------------ */
  /* CONFIDENCE INTERVALS                                                 */
  /* ------------------------------------------------------------------ */
  const CIS = {
    mz: { name: 'Mean (σ known or n large)', inputs: [['xbar', 'x̄', 74], ['sig', 'σ (or s if n ≥ 30)', 30], ['n', 'n', 200]], calc: (v, a) => { const z = S.normInv(1 - a / 2), se = v.sig / Math.sqrt(v.n); return { est: v.xbar, lo: v.xbar - z * se, hi: v.xbar + z * se, crit: `Z<sub>${a / 2}</sub> = ${f(z, 3)}`, se, work: `${v.xbar} ± ${f(z, 3)} × ${F(v.sig, `√${v.n}`)}` }; } },
    mt: { name: 'Mean (σ unknown, small n)', inputs: [['xbar', 'x̄', 290], ['s', 's', 50], ['n', 'n', 15]], calc: (v, a) => { const t = S.tCrit(a / 2, v.n - 1), se = v.s / Math.sqrt(v.n); return { est: v.xbar, lo: v.xbar - t * se, hi: v.xbar + t * se, crit: `t<sub>${a / 2}, ${v.n - 1}</sub> = ${f(t, 3)}`, se, work: `${v.xbar} ± ${f(t, 3)} × ${F(v.s, `√${v.n}`)}` }; } },
    p: { name: 'Proportion', inputs: [['x', 'successes x', 91], ['n', 'n', 582]], calc: (v, a) => { const p = v.x / v.n, z = S.normInv(1 - a / 2), se = Math.sqrt(p * (1 - p) / v.n); return { est: p, lo: p - z * se, hi: p + z * se, crit: `Z<sub>${a / 2}</sub> = ${f(z, 3)}`, se, work: `p̂ = ${v.x}/${v.n} = ${f(p)}; &nbsp; ${f(p)} ± ${f(z, 3)} × ${R(F(`${f(p)} × ${f(1 - p)}`, v.n))}` }; } },
    v: { name: 'Variance σ²', inputs: [['s2', 's²', 140.42], ['n', 'n', 20]], calc: (v, a) => { const df = v.n - 1, cu = S.chiCrit(a / 2, df), cl = S.chiCrit(1 - a / 2, df); return { est: v.s2, lo: df * v.s2 / cu, hi: df * v.s2 / cl, crit: `χ²<sub>${a / 2}, ${df}</sub> = ${f(cu, 3)}, &nbsp; χ²<sub>${1 - a / 2}, ${df}</sub> = ${f(cl, 3)}`, work: `[ ${F(`${df} × ${v.s2}`, f(cu, 3))} , ${F(`${df} × ${v.s2}`, f(cl, 3))} ]`, chi: [cl, cu, df] }; } },
    dm: { name: 'Difference of means', inputs: [['x1', 'x̄₁', 7], ['s1', 'σ₁ (or s₁)', 0.712], ['n1', 'n₁', 40], ['x2', 'x̄₂', 6.23], ['s2', 'σ₂ (or s₂)', 0.468], ['n2', 'n₂', 40]], calc: (v, a) => { const z = S.normInv(1 - a / 2), se = Math.sqrt(v.s1 ** 2 / v.n1 + v.s2 ** 2 / v.n2), d = v.x1 - v.x2; return { est: d, lo: d - z * se, hi: d + z * se, crit: `Z<sub>${a / 2}</sub> = ${f(z, 3)}`, se, work: `(${v.x1} − ${v.x2}) ± ${f(z, 3)} × ${R(`${F(`${v.s1}²`, v.n1)} + ${F(`${v.s2}²`, v.n2)}`)}` }; } },
    dp: { name: 'Difference of proportions', inputs: [['p1', 'p̂₁', 0.4], ['n1', 'n₁', 500], ['p2', 'p̂₂', 0.25], ['n2', 'n₂', 400]], calc: (v, a) => { const z = S.normInv(1 - a / 2), se = Math.sqrt(v.p1 * (1 - v.p1) / v.n1 + v.p2 * (1 - v.p2) / v.n2), d = v.p1 - v.p2; return { est: d, lo: d - z * se, hi: d + z * se, crit: `Z<sub>${a / 2}</sub> = ${f(z, 3)}`, se, work: `(${v.p1} − ${v.p2}) ± ${f(z, 3)} × ${R(`${F(`${v.p1}(${f(1 - v.p1)})`, v.n1)} + ${F(`${v.p2}(${f(1 - v.p2)})`, v.n2)}`)}` }; } },
  };

  App.add({
    id: 'ci', group: G, icon: '📏', week: 'Wk 5', title: 'Confidence intervals',
    html: () => `
      <p class="lead">A confidence interval is a <b>net</b> we throw at the unknown parameter. "95% confidence" means that <b>95% of the nets</b> we could throw (from different samples) would catch the true value.</p>
      <div class="fb">CI = statistic ± (critical value) × (standard error)</div>
      <div class="card">
        <h3>Throw 50 nets</h3>
        <p>Each line is a 95% CI from a <b>different</b> random sample (true μ = 50, σ = 10). Blue lines catch μ. Red lines marked ✖ miss it.</p>
        <div class="controls">${UI.slider('cic', 'confidence level %', 50, 99.9, 0.1, 95)}${UI.slider('cin', 'sample size n', 2, 200, 1, 25)}<div class="ctl" style="max-width:170px"><button class="btn primary" id="ciNew">New 50 samples</button></div></div>
        <div id="ciSim"></div><div class="readout" id="ciSimOut"></div>
        ${UI.idea(`<ul><li><b>Higher confidence → wider interval</b> (a bigger net catches more often but is less precise).</li><li><b>Bigger n → narrower interval</b>, because SE = σ/√n shrinks.</li><li>The interpretation is about the <b>method</b>: "We are 95% confident the interval contains μ". Do NOT write "there is a 95% probability μ is in this interval". μ is fixed; the interval is what is random.</li></ul>`)}
      </div>
      <div class="card">
        <h3>CI calculator (pre-filled with past paper data)</h3>
        <div class="controls">${UI.seg('cit', Object.entries(CIS).map(([k, c]) => [k, c.name]), 'p')}</div>
        <div class="controls" id="ciIn"></div>
        <div class="controls">${UI.slider('cia', 'confidence level %', 80, 99.5, 0.5, 90)}</div>
        <div id="ciViz"></div><div class="readout" id="ciRes"></div><div class="fb" id="ciWork"></div>
      </div>
      <div class="card"><h3>Which critical value?</h3>
      <table class="t"><tr><th>Parameter</th><th>Condition</th><th>Critical value</th><th>SE</th></tr>
      <tr><td>μ</td><td>σ known, or n ≥ 30</td><td>Z<sub>α/2</sub></td><td>σ/√n</td></tr>
      <tr><td>μ</td><td>σ unknown, n small, Normal pop.</td><td>t<sub>α/2, n−1</sub></td><td>s/√n</td></tr>
      <tr><td>P</td><td>n large</td><td>Z<sub>α/2</sub></td><td>√(p̂q̂/n)</td></tr>
      <tr><td>σ²</td><td>Normal population</td><td>χ²<sub>α/2</sub> and χ²<sub>1−α/2</sub></td><td>(not symmetric)</td></tr>
      <tr><td>μ₁ − μ₂</td><td>independent samples</td><td>Z or t</td><td>√(σ₁²/n₁ + σ₂²/n₂)</td></tr>
      <tr><td>P₁ − P₂</td><td>large samples</td><td>Z<sub>α/2</sub></td><td>√(p̂₁q̂₁/n₁ + p̂₂q̂₂/n₂)</td></tr></table>
      <p>Common Z values: 90% → <b>1.645</b>, 95% → <b>1.96</b>, 99% → <b>2.576</b>.</p></div>
      ${UI.trap(`<ul><li><b>Variance CI is upside-down:</b> the LOWER limit uses the BIGGER χ² value (χ²<sub>α/2</sub>), and the UPPER limit uses the smaller one.</li>
      <li><b>Known μ (Nov 2025 Q3c):</b> if s² = (1/n)Σ(X − μ)² uses the true μ, then nS²/σ² ~ χ²<sub>n</sub>. The df is <b>n</b>, not n − 1, because no df is used up estimating the mean.</li></ul>`)}

      <h2>📝 Past paper questions</h2>
      ${UI.steps('Nov 2023 (21 batch) · Q2 a · 7 marks', `582 accidents were checked; teenagers were driving in 91 of them. Construct and interpret a 90% CI for the proportion of accidents involving teenage drivers.`, [
        ['Point estimate', `p̂ = 91/582 = <b>${f(91 / 582)}</b>`],
        ['Standard error', `SE = √(p̂q̂/n) = √(${f(91 / 582)} × ${f(1 - 91 / 582)} / 582) = <b>${f(Math.sqrt((91 / 582) * (1 - 91 / 582) / 582))}</b>`],
        ['90% ⇒ Z₀.₀₅ = 1.645', `${f(91 / 582)} ± 1.645 × ${f(Math.sqrt((91 / 582) * (1 - 91 / 582) / 582))} = ${f(91 / 582)} ± ${f(1.645 * Math.sqrt((91 / 582) * (1 - 91 / 582) / 582))}`],
        ['Interval', `(<b>${f(91 / 582 - 1.645 * Math.sqrt((91 / 582) * (1 - 91 / 582) / 582))}</b>, <b>${f(91 / 582 + 1.645 * Math.sqrt((91 / 582) * (1 - 91 / 582) / 582))}</b>)`],
        ['Interpretation', `We are 90% confident that between about 13.2% and 18.1% of all auto accidents involve teenage drivers.`],
      ])}
      ${UI.steps('Nov 2023 (21) Q2b and Jan 2023 (20) Q2 B(i) · 7 marks', `Y is Normal. A sample of 20 gives ȳ = 13.1 and s² = 140.42. Compute the 90% CI for σ².`, [
        ['Pivot', `${F('(n−1)s²', 'σ²')} ~ χ²<sub>19</sub>`],
        ['Two critical values (α = 0.10)', `χ²<sub>0.05, 19</sub> = ${f(S.chiCrit(0.05, 19), 3)} &nbsp;&nbsp; χ²<sub>0.95, 19</sub> = ${f(S.chiCrit(0.95, 19), 3)}`],
        ['Flip the inequality', `${F('19 × 140.42', '30.144')} ≤ σ² ≤ ${F('19 × 140.42', '10.117')}`],
        ['Answer', `<b>${f(19 * 140.42 / S.chiCrit(0.05, 19), 2)} ≤ σ² ≤ ${f(19 * 140.42 / S.chiCrit(0.95, 19), 2)}</b> &nbsp;(not centred on 140.42!)`],
      ])}
      ${UI.steps('Nov 2025 (23 batch) · Q3 c · 7 marks', `X is Normal with KNOWN mean μ = 13.1. A sample of 20 gives s² = (1/20)Σ(Xᵢ − μ)² = 3.84. Compute the 95% CI for σ².`, [
        ['Key difference: μ is known', `Σ(Xᵢ − μ)²/σ² = ${F('20 × 3.84', 'σ²')} ~ χ²<sub>20</sub> (df = n = 20, because each (Xᵢ−μ)/σ is an exact Z)`],
        ['Critical values', `χ²<sub>0.025, 20</sub> = ${f(S.chiCrit(0.025, 20), 3)}, &nbsp; χ²<sub>0.975, 20</sub> = ${f(S.chiCrit(0.975, 20), 3)}`],
        ['Interval', `[${F('76.8', '34.170')}, ${F('76.8', '9.591')}] = <b>[${f(76.8 / S.chiCrit(0.025, 20), 3)}, ${f(76.8 / S.chiCrit(0.975, 20), 3)}]</b>`],
      ])}
      ${UI.steps('Jan 2023 (20 batch) · Q1 A(ii, iii) · 9 marks', `Using P₁ = 0.40 (n₁ = 500) and P₂ = 0.25 (n₂ = 400), find the 95% CI for P₁ − P₂ and interpret it.`, [
        ['Standard error', `SE = √(0.4×0.6/500 + 0.25×0.75/400) = √(${f(0.00048, 6)} + ${f(0.00046875, 6)}) = <b>${f(Math.sqrt(0.00048 + 0.00046875))}</b>`],
        ['Interval', `0.15 ± 1.96 × ${f(Math.sqrt(0.00048 + 0.00046875))} = <b>(${f(0.15 - 1.96 * Math.sqrt(0.00094875))}, ${f(0.15 + 1.96 * Math.sqrt(0.00094875))})</b>`],
        ['Interpretation', `We are 95% confident that the proportion of men in favour is between 9.0 and 21.0 percentage points higher than for women. 0 is not inside the interval, so men really are more in favour.`],
      ])}
      ${UI.steps('Nov 2025 (23 batch) · Q1 e · 5 marks', `Y ~ Bin(40, 0.34) and the normal approximation is used. What proportion of successes would you expect in the population with 95% confidence?`, [
        ['Sample proportion', `p̂ = 0.34, SE = √(0.34 × 0.66 / 40) = ${f(Math.sqrt(0.34 * 0.66 / 40))}`],
        ['95% CI', `0.34 ± 1.96 × ${f(Math.sqrt(0.34 * 0.66 / 40))} = <b>(${f(0.34 - 1.96 * Math.sqrt(0.34 * 0.66 / 40), 3)}, ${f(0.34 + 1.96 * Math.sqrt(0.34 * 0.66 / 40), 3)})</b>. Between about 19% and 49%.`],
      ])}
      ${UI.steps('Tutorial · breakdown voltage', `n = 17, s² = 137324.3. Find the 95% CI for σ².`, [
        ['Critical values (df = 16)', `χ²<sub>0.025,16</sub> = ${f(S.chiCrit(0.025, 16), 3)}, χ²<sub>0.975,16</sub> = ${f(S.chiCrit(0.975, 16), 3)}`],
        ['Interval', `[16 × 137324.3 / 28.845, 16 × 137324.3 / 6.908] = <b>[${f(16 * 137324.3 / S.chiCrit(0.025, 16), 0)}, ${f(16 * 137324.3 / S.chiCrit(0.975, 16), 0)}]</b>`],
      ])}`,
    init(root) {
      let v = {};
      const sim = () => {
        const conf = v.cic / 100, n = v.cin, z = S.normInv(1 - (1 - conf) / 2), se = 10 / Math.sqrt(n);
        const ints = Array.from({ length: 50 }, () => { let s = 0; for (let i = 0; i < n; i++) s += 50 + 10 * S.randn(); const m = s / n; return [m - z * se, m + z * se, m]; });
        const half = z * se + 3 * se;
        const p = Plot.make(root.querySelector('#ciSim'), { x: [50 - half, 50 + half], y: [0, 51], h: 380, noY: true, margin: { l: 14 }, xlab: 'value' });
        p.vline(50, { color: 'var(--text-primary)', dash: '', width: 2, label: 'true μ = 50', ly: 51, dy: -4 });
        let hit = 0;
        ints.forEach((iv, i) => {
          const ok = iv[0] <= 50 && iv[1] >= 50; if (ok) hit++;
          const y = i + 1;
          const l = p.line(iv[0], y, iv[1], y, { color: ok ? 'var(--s1)' : 'var(--critical)', width: ok ? 2 : 2.5 });
          p.dot(iv[2], y, { r: 2.5, color: ok ? 'var(--s1)' : 'var(--critical)', tip: `sample ${i + 1}: x̄ = <b>${f(iv[2], 2)}</b><br>CI (${f(iv[0], 2)}, ${f(iv[1], 2)})<br>${ok ? '✔ contains μ' : '✖ misses μ'}` });
          if (!ok) p.text(iv[1] > 50 ? iv[1] : iv[0], y, '✖', { dx: iv[1] > 50 ? 8 : -8, dy: 4, color: 'var(--critical)', bold: true, size: 11 });
        });
        root.querySelector('#ciSimOut').innerHTML = `<div class="stat big"><div class="k">intervals containing μ</div><div class="v">${hit} / 50 (${hit * 2}%)</div></div><div class="stat"><div class="k">width of each net</div><div class="v">${f(2 * z * se, 2)}</div></div><div class="stat"><div class="k">critical z</div><div class="v">${f(z, 3)}</div></div>`;
      };
      UI.bind(root, ['cic', 'cin'], x => { v = x; sim(); });
      root.querySelector('#ciNew').onclick = sim;

      let type = 'p';
      const calc = () => {
        const c = CIS[type], a = +(1 - root.querySelector('#cia').value / 100).toFixed(4);
        root.querySelector('#cia_o').textContent = root.querySelector('#cia').value;
        const vals = {}; c.inputs.forEach(i => vals[i[0]] = +root.querySelector('#ci_' + i[0]).value);
        const r = c.calc(vals, a);
        root.querySelector('#ciRes').innerHTML = `<div class="stat"><div class="k">point estimate</div><div class="v">${f(r.est)}</div></div>
          <div class="stat"><div class="k">critical value(s)</div><div class="v" style="font-size:1rem">${r.crit}</div></div>
          ${r.se ? `<div class="stat"><div class="k">SE</div><div class="v">${f(r.se)}</div></div>` : ''}
          <div class="stat big"><div class="k">${100 - a * 100}% CI</div><div class="v">(${f(r.lo)}, ${f(r.hi)})</div></div>`;
        root.querySelector('#ciWork').innerHTML = r.work + ` = <b>(${f(r.lo)}, ${f(r.hi)})</b>`;
        const el = root.querySelector('#ciViz');
        const span = r.hi - r.lo, L = Math.min(r.lo, r.est) - span * 0.4, H = Math.max(r.hi, r.est) + span * 0.4;
        const p = Plot.make(el, { x: [L, H], y: [0, 1], h: 110, noY: true, margin: { l: 14, t: 10 } });
        p.rect(r.lo, 0.25, r.hi, 0.6, { color: 'var(--s1)', opacity: 0.18 });
        p.line(r.lo, 0.42, r.hi, 0.42, { color: 'var(--s1)', width: 3 });
        p.line(r.lo, 0.25, r.lo, 0.6, { color: 'var(--s1)', width: 3 }); p.line(r.hi, 0.25, r.hi, 0.6, { color: 'var(--s1)', width: 3 });
        p.dot(r.est, 0.42, { r: 6, color: 'var(--s2)' });
        p.text(r.est, 0.75, `estimate ${f(r.est, 4)}`, { color: 'var(--s2)', bold: true, bg: true });
        p.text(r.lo, 0.08, f(r.lo, 4), { bold: true, bg: true }); p.text(r.hi, 0.08, f(r.hi, 4), { bold: true, bg: true });
        if (r.chi) el.insertAdjacentHTML('beforeend', `<p class="muted">Notice that the estimate is <b>not</b> in the middle. The χ² distribution is skewed, so the variance CI is asymmetric.</p>`);
      };
      const build = () => {
        const c = CIS[type];
        root.querySelector('#ciIn').innerHTML = c.inputs.map(i => UI.num('ci_' + i[0], i[1], i[2])).join('');
        c.inputs.forEach(i => root.querySelector('#ci_' + i[0]).addEventListener('input', calc));
        calc();
      };
      root.querySelector('#cia').addEventListener('input', calc);
      UI.bindSeg(root, 'cit', k => { type = k; build(); });
      build();
    }
  });
})();
