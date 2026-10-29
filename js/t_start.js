/* ===== START HERE: big picture, exam map, decision tree ===== */
(function () {
  const P = ['Jun 2022 (19)', 'Jan 2023 (20)', 'Nov 2023 (21)', 'Nov 2024 (22)', 'Nov 2025 (23)'];
  // marks per topic per paper, with question refs
  const MAP = [
    ['Binomial & normal approx.', 'approx', [[21, 'Q1b'], 0, [5, 'Q1b(iii)'], [6, 'Q1b'], [5, 'Q1e']]],
    ['Poisson', 'discrete', [0, [5, 'Q2A(i)'], 0, [14, 'Q1a,c,d'], [5, 'Q2a']]],
    ['Exponential & memoryless', 'expo', [[8, 'Q1a'], [5, 'Q2A(ii)'], 0, 0, 0]],
    ['Normal distribution', 'normal', [0, 0, [13, 'Q1a,b'], 0, [7, 'Q1a']]],
    ['E(X), V(X) from first principles', 'ev', [0, 0, 0, 0, [15, 'Q2b,c']]],
    ['Sampling distributions & CLT', 'clt', [[5, 'Q3a'], [6, 'Q1A(i)'], 0, [10, 'Q1e, Q3a'], [13, 'Q1b-d']]],
    ['Confidence intervals', 'ci', [[4, 'Q3c(iii)'], [16, 'Q1A(ii,iii), Q2B(i)'], [14, 'Q2a,b'], 0, [12, 'Q1e, Q3c']]],
    ['Mean tests (1 & 2 samples)', 'tests', [0, [10, 'Q3B'], [10, 'Q2c'], [10, 'Q3b'], [15, 'Q2d, Q4a']]],
    ['Paired t-test', 'tests', [[9, 'Q3c'], 0, [8, 'Q2d'], [10, 'Q3c'], 0]],
    ['Proportion tests', 'tests', [[7, 'Q3b'], [10, 'Q1B'], 0, 0, 0]],
    ['Variance tests (χ²)', 'vartest', [0, 0, 0, [10, 'Q4a'], [13, 'Q3a,b']]],
    ['χ² test of independence', 'chiind', [[11, 'Q2b'], [10, 'Q3A(ii)'], [12, 'Q4a'], 0, 0]],
    ['χ² goodness of fit', 'gof', [[14, 'Q2a'], 0, 0, [15, 'Q4b'], [10, 'Q4b']]],
    ['Regression, correlation & ANOVA', 'regression', [[25, 'Q4'], [15, 'Q2B(ii), Q4B'], [25, 'Q3'], [25, 'Q2'], [10, 'Q4c']]],
    ['Design of experiments (Latin square)', 'doe', [0, [18, 'Q4A'], 0, 0, 0]],
    ['Sampling techniques', 'sampling', [0, [5, 'Q3A(i)'], [13, 'Q4b'], 0, 0]],
    ['Mean vs median efficiency', 'median', [0, 0, 0, [5, 'Q3a'], 0]],
  ];

  /** decorative animated hero graphic: a histogram settling into bell curves */
  function heroArt() {
    const W = 380, H = 230, sx = x => 20 + (x + 4) / 8 * (W - 40), sy = y => H - 24 - y * (H - 60) / 0.8;
    const curve = (sd, op, delay) => {
      let d = ''; for (let i = 0; i <= 120; i++) { const x = -4 + 8 * i / 120; d += (i ? 'L' : 'M') + sx(x).toFixed(1) + ',' + sy(S.normPdf(x, 0, sd)).toFixed(1); }
      return `<path class="c" d="${d}" stroke="rgba(255,255,255,${op})" stroke-width="${sd === 1 ? 3.5 : 2}" style="animation-delay:${delay}s"/>`;
    };
    let bars = ''; for (let k = 0; k < 16; k++) { const x = -4 + k * 0.5, h = sy(S.normPdf(x + 0.25, 0, 1)); bars += `<rect class="b" x="${sx(x) + 1}" y="${h}" width="${sx(x + 0.5) - sx(x) - 2}" height="${H - 24 - h}" rx="3" style="animation-delay:${0.3 + k * 0.05}s"/>`; }
    const dots = [[-2.4, 0.32], [1.1, 0.62], [2.6, 0.28], [-0.5, 0.74], [0.3, 0.5]].map(([x, y], i) => `<circle class="dot" cx="${sx(x)}" cy="${sy(y)}" r="${4 + i % 2}" style="animation-delay:${i * 0.5}s"/>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><line x1="14" x2="${W - 14}" y1="${H - 24}" y2="${H - 24}" stroke="rgba(255,255,255,.45)" stroke-width="2"/>${bars}${curve(1.6, 0.4, 0.2)}${curve(0.5, 0.55, 0.5)}${curve(1, 1, 0)}${dots}</svg>`;
  }

  App.add({
    id: 'start', group: 'Start here', icon: '🧭', title: 'Big picture & exam map', noProgress: true,
    html: () => `
      <div class="hero">
        <div>
          <span class="hero-badge">MA3014 · Semester 3 · University of Moratuwa</span>
          <h2>See the statistics.<br><span>Don't just memorise it.</span></h2>
          <p>Drag sliders, run simulations and watch every formula come alive. All five past papers are solved one step at a time.</p>
          <div class="hero-stats"><div><b>${App.topics.length}</b>interactive pages</div><div><b>5</b>past papers solved</div><div><b>32</b>quiz questions</div></div>
          <div class="btnrow"><a class="btn primary" href="#discrete">Start with Week 1 ▸</a><a class="btn" href="#regression">Jump to regression</a><a class="btn" href="#quiz">Try the quiz</a></div>
        </div>
        <div class="hero-art">${heroArt()}</div>
      </div>
      <p class="lead">This guide turns every theory point from your 8 weekly tutes into pictures you can play with, and it walks through <b>every question from the 5 past papers</b> (2022 to 2025) step by step. Move the sliders, watch the shapes change, then reveal the worked answer one step at a time.</p>

      <div class="card">
        <h3>The whole module in one picture</h3>
        <p>Statistics is a ladder. Each rung uses the one below it. If a later topic feels confusing, go one rung down.</p>
        <div id="ladder"></div>
      </div>

      ${UI.idea(`<b>The one sentence that ties it all together:</b> we never know the population (μ, σ, P), so we take a <b>sample</b>, compute a <b>statistic</b> (x̄, s², p̂), and use the statistic's <b>sampling distribution</b> (Z, t, χ², F) to say how far from the truth it might be. That one idea gives you confidence intervals, hypothesis tests, chi-square tests and regression tests.`)}

      <div class="card">
        <h3>Exam heat map: where the marks come from</h3>
        <p>Each cell shows the marks a topic earned in that paper. The stronger the colour, the more marks. <b>Hover</b> to see the question number, <b>click</b> to open the topic.</p>
        <div id="heat" class="tablewrap"></div>
        <p class="muted">Regression appears in <b>every</b> paper (about 25 marks). χ² tests, CIs and hypothesis tests come next. Learn those first.</p>
      </div>

      <div class="card">
        <h3>🧠 "Which tool do I use?" — interactive decision tree</h3>
        <p>In the exam, the hardest step is choosing the right method. Answer the questions below and the tree takes you to the right page.</p>
        <div id="dtree"></div>
      </div>

      <div class="card">
        <h3>How to study with this guide (visual learner plan)</h3>
        <ol>
          <li><b>Play first.</b> On each page, move the sliders <i>before</i> reading the formulas. Ask yourself: <i>what happens to the shape?</i></li>
          <li><b>Read the 💡 Big idea</b> boxes. They explain each formula in plain words.</li>
          <li><b>Try the past-paper question yourself</b>, then press <span class="kbd">Show next step</span> to check each line.</li>
          <li>Tick <b>"I understand this topic"</b> at the bottom of each page. Your progress is saved in this browser.</li>
          <li>Finish with the <a href="#quiz">Quick quiz</a> and the <a href="#formulas">Formula sheet</a>.</li>
        </ol>
      </div>`,
    init(root) {
      // ladder flow diagram (svg)
      const rungs = [
        ['1 · Random variables', 'Discrete (count) vs continuous (measure)', 'discrete', 'Wk 1–2'],
        ['2 · Named distributions', 'Binomial, Poisson, Normal, Exponential, Gamma…', 'family', 'Wk 1–2'],
        ['3 · Sampling distributions', 'x̄ ~ N(μ, σ²/n), CLT, then t, χ², F', 'clt', 'Wk 3–4'],
        ['4 · Estimation', 'Confidence intervals: statistic ± critical × SE', 'ci', 'Wk 5'],
        ['5 · Hypothesis tests', 'Z, t, paired-t, proportion, χ², F tests', 'testing', 'Wk 6'],
        ['6 · Categorical data', 'χ² independence & goodness of fit', 'chiind', 'Wk 7'],
        ['7 · Relationships', 'Correlation, regression, ANOVA', 'regression', 'Wk 8'],
      ];
      const W = 640, H = rungs.length * 52 + 10;
      const box = document.createElement('div'); root.querySelector('#ladder').appendChild(box);
      const svg = Plot.el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'viz' });
      box.appendChild(svg);
      rungs.forEach((r, i) => {
        const y = H - 52 * (i + 1), x = 20 + i * 28;
        const g = Plot.el('g', {}, { cursor: 'pointer' });
        // fixed blues (light to dark going up the ladder), all dark enough for white text in either theme
        const shade = ['#2f74c9', '#2a6bbd', '#2561ad', '#1f589c', '#1a4e8c', '#15447b', '#103a6b'][i];
        g.append(Plot.el('rect', { x, y, width: W - 40 - i * 28 * 1.2, height: 44, rx: 10 }, { fill: shade }));
        const t1 = Plot.el('text', { x: x + 14, y: y + 19 }, { fill: '#fff', fontWeight: 700, fontSize: '14px' }); t1.textContent = r[0];
        const t2 = Plot.el('text', { x: x + 14, y: y + 36 }, { fill: '#dbe8fa', fontSize: '12px' }); t2.textContent = r[1];
        const t3 = Plot.el('text', { x: W - 30 - i * 28 * 0.2, y: y + 27, 'text-anchor': 'end' }, { fill: '#dbe8fa', fontSize: '12px', fontWeight: 600 }); t3.textContent = r[3] + ' ›';
        g.append(t1, t2, t3);
        g.addEventListener('click', () => location.hash = r[2]);
        svg.append(g);
      });

      // heat map
      const max = 25;
      const shade = v => {
        if (!v) return ['transparent', 'var(--text-muted)'];
        const steps = ['--seq-1', '--seq-2', '--seq-3', '--seq-4', '--seq-5', '--seq-6'];
        const i = Math.min(5, Math.floor(v / max * 5.99));
        // the ramp is reversed in dark mode (bigger = brighter), so the text colour has to flip too
        const dark = document.documentElement.dataset.theme === 'dark';
        return [`var(${steps[i]})`, dark ? (i >= 3 ? '#0b0b0b' : '#fff') : (i >= 3 ? '#fff' : 'var(--text-primary)')];
      };
      const totals = MAP.map(r => r[2].reduce((s, c) => s + (c ? c[0] : 0), 0));
      let h = `<table class="t heat"><tr><th class="l">Topic</th>${P.map(p => `<th>${p}</th>`).join('')}<th>Total</th></tr>`;
      MAP.forEach((r, i) => {
        h += `<tr><td class="l"><a href="#${r[1]}">${r[0]}</a></td>` + r[2].map((c, j) => {
          const [bg, fg] = shade(c ? c[0] : 0);
          return `<td data-tip="${c ? `<b>${P[j]}</b><br>${c[1]} · ${c[0]} marks` : `${P[j]}: not asked`}" data-go="${r[1]}" style="background:${bg};color:${fg};cursor:pointer;font-weight:600;min-width:74px;border:2px solid var(--surface-1)">${c ? c[0] : '·'}</td>`;
        }).join('') + `<td><b>${totals[i]}</b></td></tr>`;
      });
      h += '</table>';
      const heat = root.querySelector('#heat'); heat.innerHTML = h;
      heat.querySelectorAll('td[data-tip]').forEach(td => {
        td.addEventListener('mousemove', e => Plot.showTip(td.dataset.tip, e));
        td.addEventListener('mouseleave', Plot.hideTip);
        td.addEventListener('click', () => location.hash = td.dataset.go);
      });

      // decision tree
      const T = {
        q: 'What does the question ask you to do?', o: [
          ['Find a probability (a count, a time, a measurement)', {
            q: 'What is the random variable?', o: [
              ['Number of successes in a FIXED number n of independent trials', { r: 'Binomial  X ~ Bin(n, p).  If n is large (np ≥ 5, nq ≥ 5), use the Normal approximation with ±0.5 continuity correction.', go: 'discrete', go2: 'approx' }],
              ['Number of trials until the r-th success (r = 1 → first success)', { r: 'Negative Binomial b*(x; r, p).  When r = 1 it is Geometric g(x; p) = p·qˣ⁻¹.', go: 'discrete' }],
              ['Successes when drawing WITHOUT replacement from a finite group', { r: 'Hypergeometric h(x; N, n, k).  (With replacement it would be Binomial.)', go: 'discrete' }],
              ['Number of events in a time/area/volume at an average rate', { r: 'Poisson P(λ).  Scale λ to the interval asked!  Large λ → Normal approx N(λ, λ).', go: 'discrete' }],
              ['Waiting time / lifetime until the next event (memoryless)', { r: 'Exponential Exp(λ): P(X > t) = e^(−λt), mean 1/λ.', go: 'expo' }],
              ['Waiting time until the α-th event, or a skewed positive quantity', { r: 'Gamma(α, β): mean αβ, variance αβ².', go: 'gamma' }],
              ['A measurement that is bell-shaped (heights, lifetimes "normally distributed")', { r: 'Normal: standardise Z = (X − μ)/σ and use the Z table.', go: 'normal' }],
              ['A sample MEAN or sample PROPORTION', { r: 'Sampling distribution: x̄ ~ N(μ, σ²/n), p̂ ~ N(P, PQ/n). This rests on the CLT.', go: 'clt' }],
            ]
          }],
          ['Estimate a parameter with a range ("construct a 95% interval")', {
            q: 'Which parameter?', o: [
              ['Mean μ, σ known OR n large (≥ 30)', { r: 'x̄ ± Z_{α/2} · σ/√n', go: 'ci' }],
              ['Mean μ, σ unknown and n small, normal population', { r: 'x̄ ± t_{α/2, n−1} · s/√n', go: 'ci' }],
              ['Proportion P', { r: 'p̂ ± Z_{α/2} · √(p̂q̂/n)', go: 'ci' }],
              ['Variance σ² (or SD)', { r: '[(n−1)s²/χ²_{α/2}, (n−1)s²/χ²_{1−α/2}]. This interval is not symmetric!', go: 'ci' }],
              ['Difference of two means / two proportions', { r: '(x̄₁ − x̄₂) ± Z·√(σ₁²/n₁ + σ₂²/n₂)  or  (p̂₁ − p̂₂) ± Z·√(p̂₁q̂₁/n₁ + p̂₂q̂₂/n₂)', go: 'ci' }],
            ]
          }],
          ['Test a claim ("is there evidence that…", "test whether…")', {
            q: 'What is the claim about?', o: [
              ['ONE mean', { q: 'Do you know σ (or is n ≥ 30)?', o: [['Yes', { r: 'One-sample Z test: Z = (x̄ − μ₀)/(σ/√n)', go: 'tests' }], ['No, and n is small', { r: 'One-sample t test: t = (x̄ − μ₀)/(s/√n), df = n − 1', go: 'tests' }]] }],
              ['TWO means', { q: 'Are the observations paired (same unit measured twice: before/after, same car, same site)?', o: [['Yes, paired', { r: 'Paired t test on the differences d: t = (d̄ − μ_d)/(s_d/√n), df = n − 1', go: 'tests' }], ['No, two independent groups', { q: 'Are the population variances assumed equal?', o: [['Yes (or told "same variance")', { r: 'Pooled t test: s_p² = [(n₁−1)s₁² + (n₂−1)s₂²]/(n₁+n₂−2), df = n₁+n₂−2', go: 'tests' }], ['No', { r: 'Welch t: SE = √(s₁²/n₁ + s₂²/n₂), df = min(n₁−1, n₂−1) (lecturer\'s rule)', go: 'tests' }]] }]] }],
              ['A proportion (one or two groups)', { r: 'Z = (p̂ − P₀)/√(P₀Q₀/n), or for two groups Z = (p̂₁ − p̂₂ − D₀)/SE', go: 'tests' }],
              ['A variance or SD', { r: 'One variance: χ² = (n−1)s²/σ₀², df = n − 1.  Two variances: F = s₁²/s₂².', go: 'vartest' }],
              ['Two categorical variables in a table (association?)', { r: 'χ² test of independence: E = row total × column total / grand total, df = (r−1)(c−1)', go: 'chiind' }],
              ['Does data follow a distribution (uniform / Poisson / normal)?', { r: 'χ² goodness of fit: df = k − 1 − (number of estimated parameters)', go: 'gof' }],
              ['Is a regression model good / is the slope significant?', { r: 'ANOVA F = MSR/MSE ~ F(1, n−2), and t = b/SE(b) ~ t(n−2)', go: 'regression' }],
              ['Treatments in a designed experiment (rows × columns)', { r: 'Latin square ANOVA', go: 'doe' }],
            ]
          }],
          ['Describe the relationship between two numeric variables', { r: 'Scatter plot → correlation r → least-squares line ŷ = a + bx → ANOVA & t-test on b', go: 'regression' }],
          ['Choose how to select a sample', { r: 'Sampling techniques: SRS, stratified (proportional allocation), cluster, systematic', go: 'sampling' }],
        ]
      };
      const dt = root.querySelector('#dtree');
      const titles = Object.fromEntries(App.topics.map(t => [t.id, t.title]));
      const draw = (node, path) => {
        let h = path.length ? `<div class="dt-path">${path.map(p => '› ' + p).join(' ')}</div>` : '';
        if (node.r) {
          h += `<div class="result-card"><b>Use:</b> <span class="f">${node.r}</span><div class="btnrow">
            <a class="btn primary sm" href="#${node.go}">Open: ${titles[node.go] || node.go} ▸</a>
            ${node.go2 ? `<a class="btn sm" href="#${node.go2}">Also: ${titles[node.go2]}</a>` : ''}</div></div>`;
        } else {
          h += `<div class="dt-q">${node.q}</div><div class="dt-opts">${node.o.map((o, i) => `<button class="btn" data-i="${i}">${o[0]}</button>`).join('')}</div>`;
        }
        if (path.length) h += `<div class="btnrow"><button class="btn sm" data-restart>↺ Start again</button></div>`;
        dt.innerHTML = h;
        dt.querySelectorAll('[data-i]').forEach(b => b.onclick = () => draw(node.o[+b.dataset.i][1], [...path, node.o[+b.dataset.i][0]]));
        const rs = dt.querySelector('[data-restart]'); if (rs) rs.onclick = () => draw(T, []);
      };
      draw(T, []);
    }
  });
})();
