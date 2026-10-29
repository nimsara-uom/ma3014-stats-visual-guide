/* ===== WEEK 6 : HYPOTHESIS TESTING ===== */
(function () {
  const F = UI.frac, R = UI.sqrt, f = S.fmt;
  const G = 'Part C · Hypothesis testing';
  const list = s => String(s).split(/[\s,;]+/).filter(Boolean).map(Number).filter(x => !isNaN(x));

  /* ------------------------------------------------------------------ */
  /* test engine                                                          */
  /* ------------------------------------------------------------------ */
  const TESTS = {
    z1: {
      name: 'One mean · Z', p: 'μ', inputs: [['xbar', 'x̄'], ['mu0', 'μ₀ (claimed mean)'], ['sig', 'σ (or s if n ≥ 30)'], ['n', 'n']],
      run: v => { const se = v.sig / Math.sqrt(v.n), z = (v.xbar - v.mu0) / se; return { dist: 'z', stat: z, h0: v.mu0, work: `Z = ${F('x̄ − μ₀', 'σ/√n')} = ${F(`${v.xbar} − ${v.mu0}`, `${v.sig}/√${v.n}`)} = ${F(f(v.xbar - v.mu0), f(se))} = <b>${f(z)}</b>` }; }
    },
    t1: {
      name: 'One mean · t', p: 'μ', inputs: [['xbar', 'x̄'], ['mu0', 'μ₀'], ['s', 's'], ['n', 'n']],
      run: v => { const se = v.s / Math.sqrt(v.n), t = (v.xbar - v.mu0) / se; return { dist: 't', df: v.n - 1, stat: t, h0: v.mu0, work: `t = ${F('x̄ − μ₀', 's/√n')} = ${F(`${v.xbar} − ${v.mu0}`, `${v.s}/√${v.n}`)} = <b>${f(t)}</b>, &nbsp; df = n − 1 = ${v.n - 1}` }; }
    },
    z2: {
      name: 'Two means · Z', p: 'μ₁ − μ₂', inputs: [['x1', 'x̄₁'], ['s1', 'σ₁'], ['n1', 'n₁'], ['x2', 'x̄₂'], ['s2', 'σ₂'], ['n2', 'n₂'], ['d0', 'D₀ (usually 0)']],
      run: v => { const se = Math.sqrt(v.s1 ** 2 / v.n1 + v.s2 ** 2 / v.n2), z = (v.x1 - v.x2 - v.d0) / se; return { dist: 'z', stat: z, h0: v.d0, work: `Z = ${F('(x̄₁ − x̄₂) − D₀', '√(σ₁²/n₁ + σ₂²/n₂)')} = ${F(`(${v.x1} − ${v.x2}) − ${v.d0}`, f(se))} = <b>${f(z)}</b>` }; }
    },
    tp: {
      name: 'Two means · pooled t', p: 'μ₁ − μ₂', inputs: [['a', 'Sample 1 data', 'list'], ['b', 'Sample 2 data', 'list']],
      run: v => {
        const a = list(v.a), b = list(v.b), n1 = a.length, n2 = b.length, m1 = S.mean(a), m2 = S.mean(b), v1 = S.variance(a), v2 = S.variance(b);
        const sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2), se = Math.sqrt(sp2 * (1 / n1 + 1 / n2)), t = (m1 - m2) / se;
        return { dist: 't', df: n1 + n2 - 2, stat: t, h0: 0, summary: { n1, n2, m1, m2, v1, v2, sp2 },
          work: `x̄₁ = ${f(m1)}, s₁² = ${f(v1)}, n₁ = ${n1}; &nbsp; x̄₂ = ${f(m2)}, s₂² = ${f(v2)}, n₂ = ${n2}<br>s<sub>p</sub>² = ${F(`(${n1}−1)(${f(v1)}) + (${n2}−1)(${f(v2)})`, `${n1} + ${n2} − 2`)} = <b>${f(sp2)}</b><br>t = ${F('x̄₁ − x̄₂', 's<sub>p</sub>√(1/n₁ + 1/n₂)')} = ${F(f(m1 - m2), `${f(Math.sqrt(sp2))} × √(1/${n1} + 1/${n2})`)} = <b>${f(t)}</b>, df = ${n1 + n2 - 2}` };
      }
    },
    tw: {
      name: 'Two means · unequal variances', p: 'μ₁ − μ₂', inputs: [['x1', 'x̄₁'], ['s1', 's₁'], ['n1', 'n₁'], ['x2', 'x̄₂'], ['s2', 's₂'], ['n2', 'n₂']],
      run: v => { const se = Math.sqrt(v.s1 ** 2 / v.n1 + v.s2 ** 2 / v.n2), t = (v.x1 - v.x2) / se, df = Math.min(v.n1, v.n2) - 1; return { dist: 't', df, stat: t, h0: 0, work: `t = ${F('x̄₁ − x̄₂', '√(s₁²/n₁ + s₂²/n₂)')} = ${F(f(v.x1 - v.x2), f(se))} = <b>${f(t)}</b>, &nbsp; df = min(n₁ − 1, n₂ − 1) = ${df} <small>(the lecturer's rule)</small>` }; }
    },
    pd: {
      name: 'Paired t', p: 'μ<sub>d</sub>', inputs: [['a', 'First measurement (e.g. before / without)', 'list'], ['b', 'Second measurement (e.g. after / with)', 'list'], ['d0', 'hypothesised mean difference μ<sub>d0</sub>']],
      run: v => {
        const a = list(v.a), b = list(v.b), n = Math.min(a.length, b.length), d = b.slice(0, n).map((x, i) => +(x - a[i]).toFixed(6));
        const md = S.mean(d), sd = S.sd(d), t = (md - v.d0) / (sd / Math.sqrt(n));
        return { dist: 't', df: n - 1, stat: t, h0: v.d0, d, md, sd, n,
          work: `d = second − first = [${d.map(x => f(x, 3)).join(', ')}]<br>d̄ = ${f(md)}, s<sub>d</sub> = ${f(sd)}, n = ${n}<br>t = ${F('d̄ − μ<sub>d0</sub>', 's<sub>d</sub>/√n')} = ${F(`${f(md)} − ${v.d0}`, `${f(sd)}/√${n}`)} = <b>${f(t)}</b>, df = ${n - 1}` };
      }
    },
    p1: {
      name: 'One proportion', p: 'P', inputs: [['x', 'successes x'], ['n', 'n'], ['p0', 'P₀ (claimed)']],
      run: v => { const ph = v.x / v.n, se = Math.sqrt(v.p0 * (1 - v.p0) / v.n), z = (ph - v.p0) / se; return { dist: 'z', stat: z, h0: v.p0, work: `p̂ = ${v.x}/${v.n} = ${f(ph)}<br>Z = ${F('p̂ − P₀', '√(P₀Q₀/n)')} = ${F(`${f(ph)} − ${v.p0}`, `√(${v.p0} × ${f(1 - v.p0)}/${v.n})`)} = <b>${f(z)}</b>` }; }
    },
    p2: {
      name: 'Two proportions', p: 'P₁ − P₂', inputs: [['p1', 'p̂₁'], ['n1', 'n₁'], ['p2', 'p̂₂'], ['n2', 'n₂'], ['d0', 'D₀ (claimed gap, usually 0)']],
      run: v => {
        let se, how;
        if (v.d0 === 0) { const pp = (v.p1 * v.n1 + v.p2 * v.n2) / (v.n1 + v.n2); se = Math.sqrt(pp * (1 - pp) * (1 / v.n1 + 1 / v.n2)); how = `pooled p̂ = ${F('n₁p̂₁ + n₂p̂₂', 'n₁ + n₂')} = ${f(pp)} (pool because H₀ says P₁ = P₂)<br>SE = √(p̂q̂(1/n₁ + 1/n₂)) = ${f(se)}`; }
        else { se = Math.sqrt(v.p1 * (1 - v.p1) / v.n1 + v.p2 * (1 - v.p2) / v.n2); how = `SE = √(p̂₁q̂₁/n₁ + p̂₂q̂₂/n₂) = ${f(se)} (no pooling because H₀ gap ≠ 0)`; }
        const z = (v.p1 - v.p2 - v.d0) / se;
        return { dist: 'z', stat: z, h0: v.d0, work: `${how}<br>Z = ${F('(p̂₁ − p̂₂) − D₀', 'SE')} = ${F(`(${v.p1} − ${v.p2}) − ${v.d0}`, f(se))} = <b>${f(z)}</b>` };
      }
    },
  };
  const hyp = (t, tail, h0) => {
    const p = TESTS[t].p;
    return tail === 'two' ? [`H₀: ${p} = ${h0}`, `H₁: ${p} ≠ ${h0}`] : tail === 'left' ? [`H₀: ${p} ≥ ${h0}`, `H₁: ${p} &lt; ${h0}`] : [`H₀: ${p} ≤ ${h0}`, `H₁: ${p} &gt; ${h0}`];
  };
  const run = (t, v) => TESTS[t].run(v);
  const decide = (r, tail, alpha) => {
    const D = UI.dist(r.dist, r.df);
    const crit = tail === 'two' ? [D.inv(alpha / 2), D.inv(1 - alpha / 2)] : tail === 'left' ? [D.inv(alpha)] : [D.inv(1 - alpha)];
    const c = D.cdf(r.stat), p = tail === 'two' ? 2 * Math.min(c, 1 - c) : tail === 'left' ? c : 1 - c;
    return { crit, p, reject: p < alpha };
  };

  const PRESETS = [
    { l: 'Nov 2025 Q2d · bulbs (exponential)', t: 'z1', tail: 'left', a: 0.01, v: { xbar: 265, mu0: 300, sig: 300, n: 50 }, note: 'Time to failure → assume Exponential, so σ = mean = 300 under H₀. n = 50 is large, so the CLT gives a Z test.' },
    { l: 'Extras · billing system', t: 'z1', tail: 'right', a: 0.05, v: { xbar: 74, mu0: 70, sig: 30, n: 200 }, note: 'Cost-effective only if the mean is > $70, so H₁: μ > 70.' },
    { l: 'Tutorial · insurance claims', t: 'z1', tail: 'right', a: 0.05, v: { xbar: 1950, mu0: 1800, sig: 500, n: 40 }, note: '"Concerned the true mean is HIGHER" → right tail.' },
    { l: 'Tutorial · school IQ', t: 't1', tail: 'left', a: 0.01, v: { xbar: 108, mu0: 110, s: 10, n: 20 }, note: 'The principal claims "at least 110", so H₀: μ ≥ 110 and H₁: μ < 110.' },
    { l: 'Tutorial · lawn mower', t: 'z1', tail: 'two', a: 0.05, v: { xbar: 295, mu0: 300, sig: 20, n: 50 }, note: '"Not 300" → two-tailed. n = 50 is large, so use Z with s.' },
    { l: 'Nov 2023 Q2c · yoghurt starters', t: 'tp', tail: 'two', a: 0.05, v: { a: '6.8 6.3 7.4 6.1 8.2 7.3 6.9', b: '6.1 6.4 5.7 5.5 6.9 6.3 6.7' }, note: '"Same variance" is given → pooled t.' },
    { l: 'Nov 2024 Q3b · bumper guards', t: 'tp', tail: 'two', a: 0.01, v: { a: '127 168 143 165 122 139', b: '154 135 132 171 153 149' }, note: 'Small independent samples, assume normal with equal variances → pooled t.' },
    { l: 'Jun 2022 Q3c · petrol additive', t: 'pd', tail: 'right', a: 0.05, v: { a: '300 340 385 290 260 400 285 315', b: '320 335 400 260 300 410 275 340', d0: 0 }, note: 'The same car is tested twice → PAIRED. d = with − without; "increases" → H₁: μ_d > 0.' },
    { l: 'Nov 2023 Q2d · satellite vs ground', t: 'pd', tail: 'right', a: 0.05, v: { a: '4.6 17.3 12.2 3.6 6.2 14.8 11.4 14.9 9.3 10.4 7.2', b: '4.7 19.5 12.5 4.2 6.0 15.4 14.9 17.8 9.7 10.5 7.4', d0: 0 }, note: 'The same site is measured both ways → paired. d = y − x; "higher" → right tail.' },
    { l: 'Nov 2024 Q3c · safety program', t: 'pd', tail: 'left', a: 0.05, v: { a: '45 73 46 124 33 57 83 34 26 17', b: '36 60 44 119 35 51 77 29 24 11', d0: 0 }, note: 'The same plant before/after → paired. d = after − before; "effective" means losses fall → H₁: μ_d < 0.' },
    { l: 'Tutorial · diet (loss ≥ 20 kg)', t: 'pd', tail: 'right', a: 0.05, v: { a: '83.3 85.9 75.8 82.9 82.3 77.7 62.7 69.0 63.9', b: '117.3 111.4 98.6 104.3 105.4 100.4 81.7 89.5 78.2', d0: 20 }, note: '"After" is entered first and "before" second, so d = before − after = weight LOSS. As in the lecturer\'s notes, the claim "loss of at least 20 kg" goes in H₁: μ_d > 20 (H₀: μ_d = 20), so it is right-tailed with μ_d0 = 20.' },
    { l: 'Jun 2022 Q3b · sewing machines', t: 'p2', tail: 'two', a: 0.05, v: { p1: 0.1, n1: 80, p2: 0.15, n2: 120, d0: 0 }, note: 'p̂₁ = 8/80, p̂₂ = 18/120. "Significantly different" → two-tailed.' },
    { l: 'Jan 2023 Q1B · tax gap ≥ 0.15', t: 'p2', tail: 'left', a: 0.05, v: { p1: 0.45, n1: 250, p2: 0.35, n2: 250, d0: 0.15 }, note: 'Claim: the gap is at least 0.15 → H₀: P₁ − P₂ ≥ 0.15, H₁: P₁ − P₂ < 0.15.' },
    { l: 'Tutorial · home ownership', t: 'p1', tail: 'two', a: 0.05, v: { x: 61, n: 84, p0: 0.7 }, note: 'Test the claim P = 0.7 → two-tailed.' },
  ];

  /* ------------------------------------------------------------------ */
  /* PAGE: logic of testing                                               */
  /* ------------------------------------------------------------------ */
  App.add({
    id: 'testing', group: G, icon: '⚖️', week: 'Wk 6', title: 'Logic of hypothesis testing',
    html: () => `
      <p class="lead">A hypothesis test is a <b>court case</b>. H₀ (the null) is "innocent". We only reject it if the evidence (the sample) would be <b>very unlikely</b> if H₀ were true.</p>
      <div class="grid2">
        <div class="card"><h3>Court ⇄ statistics</h3><table class="t" style="width:100%"><tr><th>Court</th><th>Test</th></tr>
          <tr><td>Innocent until proven guilty</td><td>Assume H₀ is true</td></tr><tr><td>Evidence</td><td>Test statistic from the sample</td></tr>
          <tr><td>"Beyond reasonable doubt"</td><td>significance level α</td></tr><tr><td>Guilty verdict</td><td>Reject H₀</td></tr>
          <tr><td>Not guilty (≠ innocent!)</td><td>"Do not reject H₀" (never "accept")</td></tr></table></div>
        <div class="card"><h3>Two kinds of mistakes</h3><table class="t" style="width:100%"><tr><th></th><th>H₀ true</th><th>H₀ false</th></tr>
          <tr><th>Reject H₀</th><td class="reject">✖ Type I error<br>prob = α</td><td class="accept">✔ correct<br>Power = 1 − β</td></tr>
          <tr><th>Don't reject</th><td class="accept">✔ correct<br>1 − α</td><td class="reject">✖ Type II error<br>prob = β</td></tr></table>
          <small>Type I = convicting an innocent person. Type II = letting a guilty person go.</small></div>
      </div>
      <div class="card">
        <h3>See α, β and power move</h3>
        <p>Blue curve: the sampling distribution of x̄ if <b>H₀: μ = 100</b> is true. Orange curve: if the truth is actually μ₁. We reject H₀ when x̄ falls beyond the critical line (right-tailed test, σ = 15).</p>
        <div class="controls">${UI.slider('pa', 'α (significance level)', 0.005, 0.2, 0.005, 0.05)}${UI.slider('pm', 'true mean μ₁', 100, 115, 0.5, 106)}${UI.slider('pn', 'sample size n', 4, 100, 1, 25)}</div>
        <div id="powChart"></div>
        ${UI.legend([['var(--s1)', 'distribution if H₀ true', true], ['var(--s2)', 'distribution if H₁ true (μ = μ₁)', true], ['var(--critical)', 'α = Type I error area'], ['var(--s2)', 'β = Type II error area']])}
        <div class="readout" id="powOut"></div>
        ${UI.idea(`<ul><li>Make α smaller → the critical line moves right → <b>β gets bigger</b>. You cannot shrink both errors at once with a fixed n.</li><li>Increase <b>n</b> → both curves get narrower → β drops and <b>power rises</b>.</li><li>A bigger true difference (μ₁ far from 100) is easier to detect.</li></ul>`)}
      </div>
      <div class="card">
        <h3>What is a p-value? (picture it)</h3>
        <p><b>p-value = P(getting a result at least this extreme | H₀ is true).</b> It is the tail area beyond your statistic. A small p-value means the data would be surprising if H₀ were true.</p>
        <div class="controls">${UI.slider('pz', 'your test statistic z', -4, 4, 0.01, 1.88)}${UI.seg('ptail', [['two', 'two-tailed'], ['left', 'left'], ['right', 'right']], 'right')}${UI.slider('pal', 'α', 0.01, 0.1, 0.01, 0.05)}</div>
        <div id="pvChart"></div><div id="pvOut"></div>
        <div class="fb">Reject H₀ ⟺ p-value &lt; α ⟺ the statistic falls in the critical (red) region</div>
      </div>
      <div class="card"><h3>Choosing the tail from the wording</h3>
        <table class="t"><tr><th class="l">Words in the question</th><th>H₁</th><th>Tail</th></tr>
        <tr><td class="l">"different", "has changed", "test the claim that μ = …"</td><td>≠</td><td>two</td></tr>
        <tr><td class="l">"more than", "increases", "higher", "exceeds", "greater"</td><td>&gt;</td><td>right</td></tr>
        <tr><td class="l">"less than", "decreases", "reduces", "fewer", "lower"</td><td>&lt;</td><td>left</td></tr>
        <tr><td class="l">"at least 110" (the claim) → H₀: μ ≥ 110</td><td>&lt;</td><td>left</td></tr>
        <tr><td class="l">"at most", "no more than" (the claim) → H₀: μ ≤ …</td><td>&gt;</td><td>right</td></tr></table>
        <p>The "=" sign <b>always</b> goes in H₀.</p></div>
      ${UI.tip(`<ol style="margin:0"><li><b>Hypotheses:</b> H₀ and H₁ in symbols <i>and</i> words; define the parameter.</li><li><b>Assumptions:</b> random sample, normal population or large n (CLT), independence, equal variances…</li><li><b>Test statistic</b> and its distribution under H₀ (e.g. t ~ t<sub>n−1</sub>); substitute the numbers.</li><li><b>Critical value / p-value</b> at α, with a sketch of the rejection region.</li><li><b>Decision + conclusion in context:</b> "At the 5% level there is (not) sufficient evidence that…"</li></ol>`)}
      <h2>📝 Past paper theory questions</h2>
      ${UI.steps('Nov 2025 (23 batch) · Q4 a · 5 marks', `Output of a right-tailed two-sample mean test (equal variances) on daily water usage: t = 2.417, df = 28, p = 0.0112, α = 5%. (i) Interpret the p-value. (ii) Write the decision, describing the significance level meaningfully. (iii) What is most likely decided if df rises to 40 and α falls to 1%?`, [
        ['(i)', `If the two population means were really equal (H₀ true), the probability of getting a t statistic of 2.417 or larger is only <b>0.0112 (1.12%)</b>.`],
        ['(ii)', `p = 0.0112 &lt; α = 0.05 → <b>reject H₀</b>. Group 1's mean daily water usage is significantly higher than group 2's. α = 5% is the risk we accept of wrongly concluding there is a difference when there is none (Type I error).`],
        ['(iii)', `With df = 40, t = 2.417 gives p ≈ ${f(1 - S.tCdf(2.417, 40))}, which is just above 0.01 (t<sub>0.01,40</sub> = ${f(S.tCrit(0.01, 40), 3)} &gt; 2.417). So we would most likely <b>not reject H₀</b> at 1%. A stricter α makes rejection harder.`],
      ])}
      ${UI.steps('Jan 2023 (20 batch) · Q3 B · 10 marks', `The SGPA of students who prefer online vs physical delivery is to be compared. Describe the steps of the analysis (data, variables, parameters, assumptions, test statistic, distribution).`, [
        ['Data & variables', `Take a <u>random sample</u> of students from each group (online-preferring, physical-preferring). Variable X = SGPA (continuous). Group 1 size n₁, group 2 size n₂.`],
        ['Parameters', `μ₁, μ₂ = population mean SGPA of each group; σ₁², σ₂² = population variances.`],
        ['Hypotheses', `H₀: μ₁ = μ₂ (no difference) vs H₁: μ₁ ≠ μ₂.`],
        ['Assumptions', `The two samples are <u>independent</u>; SGPA is approximately <u>normal</u> in each group (or n ≥ 30, CLT); check whether the variances are equal with an <u>F test</u> F = s₁²/s₂².`],
        ['Test statistic', `If the variances are equal: pooled t = (x̄₁ − x̄₂)/(s<sub>p</sub>√(1/n₁ + 1/n₂)) ~ t<sub>n₁+n₂−2</sub>. If unequal: t = (x̄₁ − x̄₂)/√(s₁²/n₁ + s₂²/n₂). If n is large: Z.`],
        ['Decision', `Compare with the critical value at α = 0.05 (or use the p-value), and conclude in context.`],
      ])}`,
    init(root) {
      UI.bind(root, ['pa', 'pm', 'pn'], v => {
        const se = 15 / Math.sqrt(v.pn), c = 100 + S.normInv(1 - v.pa) * se, L = 100 - 4 * se, H = Math.max(v.pm, 100) + 4 * se;
        const f0 = x => S.normPdf(x, 100, se), f1 = x => S.normPdf(x, v.pm, se);
        const p = Plot.make(root.querySelector('#powChart'), { x: [L, H], y: [0, f0(100) * 1.2], h: 250, noY: true, margin: { l: 14 }, xlab: 'sample mean x̄' });
        p.area(f1, L, c, { color: 'var(--s2)', opacity: 0.3 }); p.area(f0, c, H, { color: 'var(--critical)', opacity: 0.55 });
        p.curve(f0); p.curve(f1, { color: 'var(--s2)' });
        p.vline(c, { color: 'var(--text-primary)', dash: '', label: `critical x̄ = ${f(c, 2)}`, ly: f0(100) * 1.2, bold: true });
        p.text(100, f0(100) * 1.05, 'H₀', { color: 'var(--s1)', bold: true, bg: true }); p.text(v.pm, f1(v.pm) * 1.05 > f0(100) * 1.12 ? f0(100) * 1.1 : f1(v.pm) * 1.05, 'H₁', { color: 'var(--s2)', bold: true, bg: true, dx: v.pm === 100 ? 20 : 0 });
        const beta = S.normCdf(c, v.pm, se);
        root.querySelector('#powOut').innerHTML = `<div class="stat"><div class="k">α (Type I)</div><div class="v reject">${f(v.pa, 3)}</div></div><div class="stat"><div class="k">β (Type II)</div><div class="v">${f(beta, 3)}</div></div><div class="stat big"><div class="k">power = 1 − β</div><div class="v">${f(1 - beta, 3)}</div></div><div class="stat"><div class="k">SE = σ/√n</div><div class="v">${f(se, 3)}</div></div>`;
      });
      let tail = 'right', vv = {};
      const pv = () => {
        const r = UI.testPlot(root.querySelector('#pvChart'), { dist: 'z', tail, alpha: vv.pal, stat: vv.pz, h: 220 });
        const D = UI.dist('z'), c = D.cdf(vv.pz);
        const el = root.querySelector('#pvChart'); const pl = el.querySelector('svg');
        root.querySelector('#pvOut').innerHTML = UI.decision(r, vv.pal) + `<p>p-value = ${tail === 'two' ? `2 × min(${f(c)}, ${f(1 - c)})` : tail === 'left' ? `P(Z &lt; ${vv.pz})` : `P(Z &gt; ${vv.pz})`} = <b>${f(r.p)}</b> ${r.p < vv.pal ? '&lt;' : '≥'} α = ${vv.pal}</p>`;
      };
      UI.bindSeg(root, 'ptail', t => { tail = t; pv(); });
      UI.bind(root, ['pz', 'pal'], x => { vv = x; pv(); });
    }
  });

  /* ------------------------------------------------------------------ */
  /* PAGE: test lab                                                       */
  /* ------------------------------------------------------------------ */
  const ws = (src, q, t, v, tail, alpha, extra = {}) => {
    const r = run(t, v), d = decide(r, tail, alpha), h = hyp(t, tail, r.h0);
    const cn = UI.critName(r.dist, alpha, tail, r.df);
    return UI.steps(src, q, [
      ...(extra.pre || []),
      ['Hypotheses', `${extra.hyp || `${h[0]} &nbsp;&nbsp; vs &nbsp;&nbsp; ${h[1]}`}`],
      ['Assumptions', extra.assume || 'Random sample(s); normal population or large n.'],
      ['Test statistic', r.work],
      ['Critical value', `${cn} = <b>${d.crit.map(c => f(c, 3)).join(' and ')}</b> &nbsp; (${tail}-tailed, α = ${alpha}) &nbsp;&nbsp; p-value = ${f(d.p)}`],
      ['Decision & conclusion', `${d.reject ? '<span class="reject">Reject H₀.</span>' : '<span class="accept">Do not reject H₀.</span>'} ${extra.concl ? extra.concl(d.reject) : ''}`],
      ...(extra.post || []),
    ]);
  };

  App.add({
    id: 'tests', group: G, icon: '🧪', week: 'Wk 6', title: 'Test lab: Z, t, paired, proportions',
    html: () => `
      <p class="lead">Every test has the same skeleton: <b>(estimate − value under H₀) ÷ standard error</b>. Pick a test (or load a past paper question), change the numbers, and watch the statistic move in and out of the red rejection region.</p>
      <div class="fb">test statistic = ${F('estimate − H₀ value', 'standard error')}</div>
      <div class="card">
        <div class="controls"><div class="ctl" style="max-width:420px"><label>Load a past paper / tutorial question</label><select id="tlPreset"><option value="">— choose —</option>${PRESETS.map((p, i) => `<option value="${i}">${p.l}</option>`).join('')}</select></div></div>
        <div class="controls">${UI.seg('tlT', Object.entries(TESTS).map(([k, t]) => [k, t.name]), 'z1')}</div>
        <div id="tlNote"></div>
        <div class="controls" id="tlIn"></div>
        <div class="controls">${UI.seg('tlTail', [['two', 'two-tailed (≠)'], ['left', 'left-tailed (<)'], ['right', 'right-tailed (>)']], 'two')}<div class="ctl" style="max-width:160px"><label>α</label><select id="tlA"><option>0.10</option><option selected>0.05</option><option>0.01</option><option>0.025</option></select></div></div>
        <div class="fb" id="tlHyp"></div>
        <div id="tlChart"></div>
        <div class="fb" id="tlWork" style="white-space:normal;text-align:left"></div>
        <div id="tlDec"></div>
      </div>
      <div class="card"><h3>Which test? (summary)</h3><table class="t">
        <tr><th>Situation</th><th>Statistic</th><th>Distribution</th></tr>
        <tr><td class="l">1 mean, σ known (or n ≥ 30)</td><td>(x̄ − μ₀)/(σ/√n)</td><td>Z</td></tr>
        <tr><td class="l">1 mean, σ unknown, n small</td><td>(x̄ − μ₀)/(s/√n)</td><td>t<sub>n−1</sub></td></tr>
        <tr><td class="l">2 means, σ's known</td><td>(x̄₁ − x̄₂ − D₀)/√(σ₁²/n₁ + σ₂²/n₂)</td><td>Z</td></tr>
        <tr><td class="l">2 means, σ's unknown but equal</td><td>(x̄₁ − x̄₂)/(s<sub>p</sub>√(1/n₁ + 1/n₂))</td><td>t<sub>n₁+n₂−2</sub></td></tr>
        <tr><td class="l">2 means, σ's unknown, unequal</td><td>(x̄₁ − x̄₂)/√(s₁²/n₁ + s₂²/n₂)</td><td>t<sub>min(n₁,n₂)−1</sub></td></tr>
        <tr><td class="l">Paired (same unit twice)</td><td>(d̄ − μ<sub>d0</sub>)/(s<sub>d</sub>/√n)</td><td>t<sub>n−1</sub></td></tr>
        <tr><td class="l">1 proportion</td><td>(p̂ − P₀)/√(P₀Q₀/n)</td><td>Z</td></tr>
        <tr><td class="l">2 proportions (H₀: P₁ = P₂)</td><td>(p̂₁ − p̂₂)/√(p̂q̂(1/n₁ + 1/n₂)), pooled p̂</td><td>Z</td></tr></table></div>
      ${UI.trap(`<ul><li><b>Paired or independent?</b> If the same car, site, plant or person is measured twice, it is PAIRED. Work with the differences, not two separate means.</li>
        <li>In a paired test, state the direction of d (e.g. d = after − before) and keep the sign consistent in H₁.</li>
        <li>Never write "accept H₀". Write "do not reject H₀ / insufficient evidence".</li>
        <li>If σ is not given for a <b>lifetime</b>, think Exponential: σ = μ (Nov 2025 Q2d).</li></ul>`)}

      <h2>📝 Past paper tests, fully worked</h2>
      ${ws('Nov 2025 (23 batch) · Q2 d · 10 marks', 'Hours to failure of 50 random bulbs of brand A average 265 h. Test whether the mean time to failure is significantly less than 300 h at the 0.01 level. Underline the assumptions.', 'z1', { xbar: 265, mu0: 300, sig: 300, n: 50 }, 'left', 0.01, {
        hyp: 'H₀: μ = 300 (μ ≥ 300) &nbsp; vs &nbsp; H₁: μ &lt; 300, where μ = mean time to failure of brand A bulbs.',
        assume: `Time to failure follows an <u>exponential distribution</u>, so <u>σ = μ</u>; under H₀, <u>σ = 300</u>. The 50 bulbs are a <u>random sample</u> (independent). n = 50 ≥ 30, so by the <u>CLT</u> x̄ ~ N(μ, σ²/n).`,
        concl: r => r ? 'The mean lifetime is significantly less than 300 h.' : 'At the 1% level there is not enough evidence that the mean time to failure of brand A bulbs is less than 300 hours.' })}
      ${ws('Nov 2023 (21 batch) · Q2 c · 10 marks', 'Yoghurt times (hours). Starter A: 6.8 6.3 7.4 6.1 8.2 7.3 6.9. Starter B: 6.1 6.4 5.7 5.5 6.9 6.3 6.7. Assume normal with the same variance. Test whether the mean time is the same for both starters.', 'tp', PRESETS[5].v, 'two', 0.05, {
        assume: 'Both samples are random and <u>independent</u>, from <u>normal</u> populations with <u>equal variances</u> → pooled t.',
        concl: r => r ? 'At the 5% level the mean yoghurt-making times are significantly different (starter A takes longer).' : 'There is no significant difference.' })}
      ${ws('Nov 2024 (22 batch) · Q3 b · 10 marks', 'Repair costs. Guard 1: 127 168 143 165 122 139. Guard 2: 154 135 132 171 153 149. Test at 0.01 whether the difference between the means is significant.', 'tp', PRESETS[6].v, 'two', 0.01, {
        assume: 'Independent random samples from <u>normal</u> populations with <u>equal variances</u> (small n → t).',
        concl: r => r ? 'Significant.' : 'At the 1% level there is no significant difference in mean repair cost between the two bumper guards.' })}
      ${ws('Jun 2022 (19 batch) · Q3 c · 13 marks', 'Miles per 10 gallons for 8 cars without and with an additive. (i) Are the observations dependent? (ii) Test at 5% whether the additive increases performance. (iii) Verify using a 95% CI.', 'pd', PRESETS[7].v, 'right', 0.05, {
        pre: [['(i) Dependent or independent?', 'The SAME car is measured twice, so the observations are <b>dependent (paired)</b>. Differences remove the car-to-car variation.']],
        hyp: 'H₀: μ<sub>d</sub> = 0 &nbsp; vs &nbsp; H₁: μ<sub>d</sub> &gt; 0, where d = (with additive) − (without)',
        assume: 'The differences are a random sample from a <u>normal</u> distribution.',
        concl: r => r ? 'The additive increases mileage.' : 'At the 5% level there is not enough evidence that the additive increases performance.',
        post: [['(iii) 95% CI for μ<sub>d</sub>', (() => { const r = run('pd', PRESETS[7].v), tc = S.tCrit(0.025, r.df), m = tc * r.sd / Math.sqrt(r.n); return `d̄ ± t<sub>0.025,7</sub> s<sub>d</sub>/√n = ${f(r.md)} ± ${f(tc, 3)} × ${f(r.sd)}/√8 = <b>(${f(r.md - m, 2)}, ${f(r.md + m, 2)})</b>. The interval contains 0, so a zero mean difference is plausible. This agrees with not rejecting H₀.`; })()]] })}
      ${ws('Nov 2023 (21 batch) · Q2 d · 8 marks', 'Temperatures at 11 sites by ground thermometer (x) and satellite (y). Do satellites give significantly higher readings on average?', 'pd', PRESETS[8].v, 'right', 0.05, {
        hyp: 'H₀: μ<sub>d</sub> = 0 vs H₁: μ<sub>d</sub> &gt; 0, d = y − x', assume: 'The same site is measured by both methods → <u>paired</u>; the differences are <u>normal</u>.',
        concl: r => r ? 'At the 5% level the satellite sensors give significantly higher readings on average.' : 'Not significant.' })}
      ${ws('Nov 2024 (22 batch) · Q3 c · 10 marks', 'Weekly lost work-hours in 10 plants before and after a safety program: (45,36) (73,60) (46,44) (124,119) (33,35) (57,51) (83,77) (34,29) (26,24) (17,11). Is the program effective?', 'pd', PRESETS[9].v, 'left', 0.05, {
        hyp: 'H₀: μ<sub>d</sub> = 0 vs H₁: μ<sub>d</sub> &lt; 0, d = after − before', assume: 'The same plant before and after → <u>paired</u>; the differences are approximately <u>normal</u>.',
        concl: r => r ? 'At the 5% level the safety program significantly reduces lost work-hours. It is effective.' : 'Not effective.' })}
      ${ws('Jun 2022 (19 batch) · Q3 b · 7 marks', 'Breakdowns: 8 of 80 world-brand machines and 18 of 120 local machines. Are the proportions significantly different at 5%?', 'p2', PRESETS[11].v, 'two', 0.05, {
        concl: r => r ? '' : 'The breakdown proportions are not significantly different, so the company has no statistical reason to pay more for the expensive brand.' })}
      ${ws('Jan 2023 (20 batch) · Q1 B · 10 marks', 'After 3 months, samples of 250 men and 250 women give proportions 0.45 and 0.35. Check the claim that the gap is still at least 0.15 at 5%.', 'p2', PRESETS[12].v, 'left', 0.05, {
        hyp: 'H₀: P₁ − P₂ ≥ 0.15 (the claim) &nbsp; vs &nbsp; H₁: P₁ − P₂ &lt; 0.15',
        concl: r => r ? 'The gap has shrunk below 0.15.' : 'At the 5% level there is no significant evidence against the claim. The gap of at least 0.15 cannot be rejected.' })}`,
    init(root) {
      let t = 'z1', tail = 'two';
      const getT = UI.bindSeg(root, 'tlT', k => { t = k; build(); });
      const getTail = UI.bindSeg(root, 'tlTail', k => { tail = k; calc(); });
      const setSeg = (id, v) => root.querySelectorAll(`#${id} button`).forEach(b => b.classList.toggle('on', b.dataset.v === v));
      const defaults = { z1: { xbar: 74, mu0: 70, sig: 30, n: 200 }, t1: { xbar: 108, mu0: 110, s: 10, n: 20 }, z2: { x1: 1950, s1: 500, n1: 40, x2: 1800, s2: 450, n2: 50, d0: 0 }, tp: PRESETS[5].v, tw: { x1: 52, s1: 4, n1: 12, x2: 48, s2: 9, n2: 15 }, pd: PRESETS[7].v, p1: PRESETS[13].v, p2: PRESETS[11].v };
      let vals = { ...defaults[t] };
      const build = () => {
        const T = TESTS[t];
        root.querySelector('#tlIn').innerHTML = T.inputs.map(([k, l, type]) => type === 'list'
          ? `<div class="ctl" style="max-width:none;flex-basis:100%"><label>${l}</label><textarea id="ti_${k}" rows="1">${vals[k] ?? ''}</textarea></div>`
          : UI.num('ti_' + k, l, vals[k] ?? defaults[t][k] ?? 0)).join('');
        T.inputs.forEach(([k]) => root.querySelector('#ti_' + k).addEventListener('input', calc));
        calc();
      };
      const calc = () => {
        const T = TESTS[t], v = {};
        T.inputs.forEach(([k, , type]) => { const e = root.querySelector('#ti_' + k); v[k] = type === 'list' ? e.value : +e.value; });
        vals = v;
        const alpha = +root.querySelector('#tlA').value;
        let r; try { r = run(t, v); } catch (e) { return; }
        if (!isFinite(r.stat)) return;
        const h = hyp(t, tail, r.h0);
        root.querySelector('#tlHyp').innerHTML = `${h[0]} &nbsp;&nbsp;&nbsp; vs &nbsp;&nbsp;&nbsp; ${h[1]}`;
        root.querySelector('#tlWork').innerHTML = r.work;
        const res = UI.testPlot(root.querySelector('#tlChart'), { dist: r.dist, df: r.df, tail, alpha, stat: r.stat });
        root.querySelector('#tlDec').innerHTML = UI.decision(res, alpha) + `<p>Critical value: ${UI.critName(r.dist, alpha, tail, r.df)} = ${res.crit.map(c => f(c, 3)).join(' , ')}. ${res.reject ? 'The statistic is in the <span class="reject">red region → reject H₀</span>: the data give significant evidence for H₁.' : 'The statistic is in the <span class="accept">blue region → do not reject H₀</span>: there is not enough evidence for H₁.'}</p>`;
      };
      root.querySelector('#tlA').addEventListener('change', calc);
      root.querySelector('#tlPreset').addEventListener('change', e => {
        const p = PRESETS[+e.target.value]; if (!p) return;
        t = p.t; tail = p.tail; vals = { ...p.v };
        setSeg('tlT', t); setSeg('tlTail', tail); root.querySelector('#tlA').value = p.a.toFixed(2) === '0.10' ? '0.10' : String(p.a);
        root.querySelector('#tlNote').innerHTML = UI.box('exam', '📝 ' + p.l, p.note);
        build();
      });
      build();
    }
  });

  /* ------------------------------------------------------------------ */
  /* PAGE: variance tests                                                 */
  /* ------------------------------------------------------------------ */
  App.add({
    id: 'vartest', group: G, icon: '📊', week: 'Wk 6', title: 'Variance tests (χ² and F)',
    html: () => `
      <p class="lead">To test a <b>spread</b> (variance or SD) we cannot use Z or t. A single variance uses χ², and two variances use F.</p>
      <div class="grid2"><div class="fb">χ² = ${F('(n − 1)s²', 'σ₀²')} ~ χ²<sub>n−1</sub></div><div class="fb">F = ${F('s₁²', 's₂²')} ~ F(n₁ − 1, n₂ − 1)</div></div>
      ${UI.tabs('vt', [['One variance (χ²)', `<div class="card">
          <div class="controls">${UI.num('vn', 'n', 9)}${UI.num('vs', 's (sample SD)', 0.0086)}${UI.num('vs0', 'σ₀ (claimed SD)', 0.01)}<div class="ctl"><label>α</label><select id="va"><option>0.10</option><option selected>0.05</option><option>0.01</option></select></div></div>
          <div class="controls">${UI.seg('vtail', [['two', 'σ ≠ σ₀'], ['left', 'σ < σ₀'], ['right', 'σ > σ₀']], 'left')}</div>
          <div class="fb" id="vWork"></div><div id="vChart"></div><div id="vDec"></div></div>`],
        ['Two variances (F)', `<div class="card">
          <div class="controls">${UI.num('fs1', 's₁²', 9.64286)}${UI.num('fn1', 'n₁', 8)}${UI.num('fs2', 's₂²', 10.2667)}${UI.num('fn2', 'n₂', 6)}<div class="ctl"><label>α</label><select id="fa"><option selected>0.10</option><option>0.05</option><option>0.01</option></select></div></div>
          <div class="controls">${UI.seg('ftail', [['two', 'σ₁² ≠ σ₂²'], ['right', 'σ₁² > σ₂²']], 'two')}</div>
          <div class="fb" id="fWork"></div><div id="fChart"></div><div id="fDec"></div>
          <p class="muted">Tutorial example: 27, 29, 22, 21, 26, 28, 24, 29 vs 19, 18, 24, 18, 22, 15 at α = 0.10. For a two-tailed F test the lower critical value is 1/F<sub>α/2</sub>(v₂, v₁). Many texts simply put the <b>larger variance on top</b> and use the upper tail only.</p></div>`]])}

      <div class="card">
        <h3>Why s² = σ₀²[1 + Z<sub>α</sub>√(2/(n−1))]? (Nov 2024 Q4a, Nov 2025 Q3a)</h3>
        <p>For large df, χ²<sub>v</sub> looks like a Normal with mean v and variance 2v. Slide v and watch them match:</p>
        <div class="controls">${UI.slider('nv', 'degrees of freedom v = n − 1', 2, 150, 1, 10)}</div>
        <div id="apxChart"></div>
        ${UI.legend([['var(--s3)', 'χ² with v df', true], ['var(--s2)', 'Normal N(v, 2v)', true]])}
      </div>
      ${UI.steps('Nov 2024 (22) Q4 a [10 marks] and Nov 2025 (23) Q3 a [6 marks]', `Using the fact that χ² is approximately normal for large v, show that for large samples s² = σ₀²[1 + Z<sub>α</sub>√(2/(n−1))] is the margin of the approximate rejection region of size α for testing H₀: σ² = σ₀² against H₁: σ² < σ₀².`, [
        ['Start from the χ² statistic under H₀', `χ² = ${F('(n − 1)s²', 'σ₀²')} ~ χ²<sub>n−1</sub>, with E(χ²) = n − 1 and V(χ²) = 2(n − 1)`],
        ['Large n: approximate by a Normal', `χ² ≈ N(n − 1, 2(n − 1)) &nbsp;⇒&nbsp; Z = ${F('χ² − (n − 1)', '√(2(n − 1))')} ≈ N(0, 1)`],
        ['Left-tailed test (H₁: σ² < σ₀²): reject for small values', `Reject H₀ when Z ≤ Z<sub>α</sub>, where Z<sub>α</sub> is the lower-tail critical value (negative, e.g. −1.645 for α = 0.05)`],
        ['Substitute χ²', `${F('(n − 1)s²/σ₀² − (n − 1)', '√(2(n − 1))')} ≤ Z<sub>α</sub>`],
        ['Multiply out', `(n − 1)s²/σ₀² ≤ (n − 1) + Z<sub>α</sub>√(2(n − 1))`],
        ['Divide by (n − 1) and multiply by σ₀²', `s² ≤ σ₀²[1 + Z<sub>α</sub>${F('√(2(n − 1))', 'n − 1')}] = σ₀²[1 + Z<sub>α</sub>√(${F(2, 'n − 1')})] &nbsp; ∎`],
        ['Meaning', `The boundary of the rejection region is <b>s² = σ₀²[1 + Z<sub>α</sub>√(2/(n−1))]</b>. Reject H₀ if the sample variance falls below it. (If your Z<sub>α</sub> is the positive table value, the formula becomes 1 − Z<sub>α</sub>√(…).)`],
      ])}
      ${UI.steps('Nov 2025 (23 batch) · Q3 b · 7 marks', `9 measurements of the specific heat of iron have s = 0.0086. Test H₀: σ = 0.0100 against H₁: σ < 0.0100 at 5%.`, [
        ['Hypotheses', `H₀: σ² = 0.0100² &nbsp; vs &nbsp; H₁: σ² < 0.0100² (left-tailed)`],
        ['Statistic', `χ² = ${F('(n − 1)s²', 'σ₀²')} = ${F('8 × 0.0086²', '0.01²')} = <b>${f(8 * 0.0086 ** 2 / 0.0001)}</b>, df = 8`],
        ['Critical value (lower tail)', `χ²<sub>0.95, 8</sub> = <b>${f(S.chiCrit(0.95, 8), 3)}</b>. Reject if χ² < 2.733`],
        ['Decision', `${f(8 * 0.0086 ** 2 / 0.0001, 3)} > 2.733 → <span class="accept">do not reject H₀</span>. p-value = ${f(S.chiCdf(8 * 0.0086 ** 2 / 0.0001, 8))}. There is not enough evidence that σ < 0.0100.`],
      ])}`,
    init(root) {
      let tail = 'left', ftail = 'two';
      const vcalc = () => {
        const n = +root.querySelector('#vn').value, s = +root.querySelector('#vs').value, s0 = +root.querySelector('#vs0').value, a = +root.querySelector('#va').value;
        const chi = (n - 1) * s * s / (s0 * s0);
        root.querySelector('#vWork').innerHTML = `χ² = ${F(`(${n} − 1)(${s})²`, `(${s0})²`)} = <b>${f(chi)}</b>, &nbsp; df = ${n - 1}`;
        const r = UI.testPlot(root.querySelector('#vChart'), { dist: 'chi', df: n - 1, tail, alpha: a, stat: chi });
        root.querySelector('#vDec').innerHTML = UI.decision(r, a);
      };
      UI.bindSeg(root, 'vtail', t => { tail = t; vcalc(); });
      ['vn', 'vs', 'vs0', 'va'].forEach(id => root.querySelector('#' + id).addEventListener('input', vcalc));
      const fcalc = () => {
        const s1 = +root.querySelector('#fs1').value, n1 = +root.querySelector('#fn1').value, s2 = +root.querySelector('#fs2').value, n2 = +root.querySelector('#fn2').value, a = +root.querySelector('#fa').value;
        const F0 = s1 / s2;
        root.querySelector('#fWork').innerHTML = `F = ${F(s1, s2)} = <b>${f(F0)}</b>, &nbsp; (v₁, v₂) = (${n1 - 1}, ${n2 - 1})` + (ftail === 'two' ? `<br><small>upper: F<sub>${a / 2}</sub>(${n1 - 1},${n2 - 1}) = ${f(S.fCrit(a / 2, n1 - 1, n2 - 1), 3)} &nbsp; lower: 1/F<sub>${a / 2}</sub>(${n2 - 1},${n1 - 1}) = ${f(1 / S.fCrit(a / 2, n2 - 1, n1 - 1), 3)}</small>` : '');
        const r = UI.testPlot(root.querySelector('#fChart'), { dist: 'F', df: n1 - 1, df2: n2 - 1, tail: ftail, alpha: a, stat: F0 });
        root.querySelector('#fDec').innerHTML = UI.decision(r, a);
      };
      UI.bindSeg(root, 'ftail', t => { ftail = t; fcalc(); });
      ['fs1', 'fn1', 'fs2', 'fn2', 'fa'].forEach(id => root.querySelector('#' + id).addEventListener('input', fcalc));
      vcalc();
      root.querySelector('[data-tabs="vt"]').addEventListener('tabchange', () => { vcalc(); fcalc(); });
      fcalc();
      UI.bind(root, ['nv'], v => {
        const k = v.nv, L = Math.max(0, k - 4.5 * Math.sqrt(2 * k)), H = k + 5 * Math.sqrt(2 * k);
        let ym = 0; for (let i = 1; i <= 200; i++) ym = Math.max(ym, Math.min(1, S.chiPdf(L + (H - L) * i / 200, k)), S.normPdf(k, k, Math.sqrt(2 * k)));
        const p = Plot.make(root.querySelector('#apxChart'), { x: [L, H], y: [0, ym * 1.15], h: 220, noY: true, margin: { l: 14 } });
        p.curve(x => S.chiPdf(x, k), { color: 'var(--s3)', width: 2.5 }); p.curve(x => S.normPdf(x, k, Math.sqrt(2 * k)), { color: 'var(--s2)', dash: '6 4' });
        p.hover(x => `x = <b>${f(x, 2)}</b><br>χ² area left: <b>${f(S.chiCdf(x, k))}</b><br>Normal area left: <b>${f(S.normCdf(x, k, Math.sqrt(2 * k)))}</b>`);
      });
    }
  });

  window.TESTLIB = { TESTS, run, decide, list };
})();
