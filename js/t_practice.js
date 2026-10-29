/* ===== PRACTICE: past paper index, quiz, formula sheet ===== */
(function () {
  const F = UI.frac, f = S.fmt;
  const G = 'Practice & revision';

  const PAPERS = [
    ['Jun 2022 · 19 batch (MA3013)', [['Q1a', 'Exponential waiting times, memoryless, min of two', 'expo', 8], ['Q1b', 'Biased die: binomial errors, normal approx. to find k', 'approx', 17], ['Q2a', 'Defective toys: Poisson model + goodness of fit', 'gof', 14], ['Q2b', 'DVD factories: χ² independence', 'chiind', 11], ['Q3a', 'Derive the sampling distribution of p̂₁ − p̂₂', 'clt', 5], ['Q3b', 'Sewing machines: two-proportion Z test', 'tests', 7], ['Q3c', 'Petrol additive: paired t + CI', 'tests', 13], ['Q4', 'Gloves vs temperature: full regression + ANOVA + R²', 'regression', 25]]],
    ['Jan 2023 · 20 batch', [['Q1A', 'Tax proposal: sampling distributions, CI for P₁ − P₂', 'ci', 15], ['Q1B', 'Gap of at least 0.15: two-proportion test', 'tests', 10], ['Q2A', 'Disk defects (Poisson), interrupts (exponential)', 'discrete', 10], ['Q2B(i)', '90% CI for σ²', 'ci', 7], ['Q2B(ii)', 'Regression ANOVA F from mean squares', 'regression', 8], ['Q3A(i)', 'Sampling plan for 350 students', 'sampling', 5], ['Q3A(ii)', 'Delivery mode × field: χ² independence', 'chiind', 10], ['Q3B', 'Describe a two-sample comparison', 'testing', 10], ['Q4A', 'Latin square ANOVA', 'doe', 18], ['Q4B', 'Interpret a multiple regression', 'regression', 7]]],
    ['Nov 2023 · 21 batch', [['Q1a', 'Normal: equal tails → μ and σ', 'normal', 6], ['Q1b', 'Bulb lifetimes: normal + binomial', 'normal', 12], ['Q2a', '90% CI for a proportion', 'ci', 7], ['Q2b', '90% CI for σ²', 'ci', 7], ['Q2c', 'Yoghurt: pooled two-sample t', 'tests', 10], ['Q2d', 'Satellite vs ground: paired t', 'tests', 8], ['Q3', 'SAT scores: regression + ANOVA + test β', 'regression', 25], ['Q4a', 'DVD factories: χ² + cells with E < 5', 'chiind', 12], ['Q4b', 'Stratified sampling allocation', 'sampling', 13]]],
    ['Nov 2024 · 22 batch', [['Q1', 'Seeds: Poisson variables, normal approximations, proportion', 'approx', 25], ['Q2', 'Plastic rods: r, Fisher z, regression, CI for β, ANOVA', 'regression', 25], ['Q3a', 'Mean vs median efficiency', 'median', 5], ['Q3b', 'Bumper guards: two-sample t at 1%', 'tests', 10], ['Q3c', 'Safety program: paired t', 'tests', 10], ['Q4a', 'Derive s² = σ₀²[1 + Zα√(2/(n−1))]', 'vartest', 10], ['Q4b', 'Geiger counter: normal goodness of fit', 'gof', 15]]],
    ['Nov 2025 · 23 batch', [['Q1a', 'Empirical rule & normality of sample means', 'normal', 7], ['Q1b–d', 'CLT statement, conditions, P(17 < x̄ < 23)', 'clt', 13], ['Q1e', 'Proportion range with 95% confidence', 'ci', 5], ['Q2a', 'Web server overload: Poisson', 'discrete', 5], ['Q2b,c', 'Urn E(X), V(X); Y = X₁ − X₂', 'ev', 15], ['Q2d', 'Bulb failure mean test (exponential σ = μ)', 'tests', 10], ['Q3a', 'Derive the approximate rejection region for σ²', 'vartest', 6], ['Q3b', 'χ² test for one SD', 'vartest', 7], ['Q3c', 'CI for σ² with known μ (df = n)', 'ci', 7], ['Q4a', 'Interpret p-value & decision', 'testing', 5], ['Q4b', 'Library books: uniform goodness of fit', 'gof', 10], ['Q4c', 'Regression CI for β & F from summaries', 'regression', 10]]],
  ];

  App.add({
    id: 'papers', group: G, icon: '🗂️', title: 'Past paper index (all questions)', noProgress: true,
    html: () => `
      <p class="lead">Every question from the 5 past papers, with a link to the page where it is solved step by step. Try each one on paper first, then check it.</p>
      ${UI.tip(`<b>Exam timing:</b> 2 hours, 4 questions, 100 marks → about <b>1.2 minutes per mark</b>. A 10-mark test question should take about 12 minutes. Always write: hypotheses → assumptions → statistic → critical value/p-value → conclusion in context.`)}
      ${PAPERS.map(([p, qs]) => `<div class="card"><h3>${p}</h3><table class="t" style="width:100%"><tr><th>Q</th><th class="l">What it tests</th><th>Marks</th><th>Solved on</th></tr>
        ${qs.map(q => `<tr><td><b>${q[0]}</b></td><td class="l">${q[1]}</td><td>${q[3]}</td><td><a href="#${q[2]}">${(App.topics.find(t => t.id === q[2]) || {}).title || q[2]} ›</a></td></tr>`).join('')}</table></div>`).join('')}`
  });

  /* ---------------- QUIZ ---------------- */
  const Q = [
    ['5 cards are drawn without replacement and X = number of red cards. X follows…', ['Binomial', 'Hypergeometric', 'Poisson', 'Geometric'], 1, 'Without replacement from a finite population, so p changes every draw → Hypergeometric.', 'discrete'],
    ['X ~ Poisson(4). V(X) = ?', ['2', '4', '16', '0.25'], 1, 'For a Poisson distribution the mean equals the variance: E(X) = V(X) = λ = 4.', 'discrete'],
    ['Waiting time is exponential with mean 3 months. The rate λ is…', ['3 per month', '1/3 per month', '9 per month', 'e⁻³'], 1, 'Mean = 1/λ ⇒ λ = 1/3.', 'expo'],
    ['For an exponential X, P(X > 5 | X > 2) equals…', ['P(X > 5)', 'P(X > 3)', 'P(X > 2)', 'P(X > 7)'], 1, 'Memoryless: P(X > 2 + 3 | X > 2) = P(X > 3).', 'expo'],
    ['A fair die is thrown 360 times. Mean and variance of the number of sixes?', ['60 and 60', '60 and 50', '60 and √50', '6 and 5'], 1, 'np = 60, npq = 360 × ⅙ × ⅚ = 50.', 'approx'],
    ['Using the normal approximation, P(X ≥ 30) for a binomial X becomes…', ['P(Y > 30)', 'P(Y > 30.5)', 'P(Y > 29.5)', 'P(Y < 29.5)'], 2, '"≥ 30" includes the bar at 30, which starts at 29.5.', 'approx'],
    ['σ² = 45 and n = 25. The standard error of x̄ is…', ['1.8', '1.342', '9', '0.268'], 1, 'SE = √(σ²/n) = √(45/25) = √1.8 = 1.342.', 'clt'],
    ['To HALVE the standard error σ/√n you must multiply n by…', ['2', '√2', '4', '½'], 2, 'SE ∝ 1/√n, so n must be 4 times bigger.', 'clt'],
    ['Compared with Z, the t distribution…', ['is skewed', 'has heavier tails', 'has variance less than 1', 'has mean 1'], 1, 't is symmetric with mean 0 but variance v/(v − 2) > 1, so it has heavier tails.', 'tdist'],
    ['χ² with k degrees of freedom has mean and variance…', ['k and k', 'k and 2k', '2k and k', '0 and 1'], 1, 'χ²(k) = Gamma(k/2, 2): mean αβ = k, variance αβ² = 2k.', 'tdist'],
    ['Gamma(α = 1, β = 1/λ) is the same as…', ['Poisson(λ)', 'Exponential(λ)', 'χ²(1)', 'Normal'], 1, 'Putting α = 1 gives f(x) = λe^(−λx).', 'gamma'],
    ['Which statement about a 95% CI (12.1, 15.3) is correct?', ['P(12.1 < μ < 15.3) = 0.95', '95% of the data lie in it', 'We are 95% confident it contains μ (95% of such intervals contain μ)', 'x̄ lies in it with probability 0.95'], 2, 'μ is fixed. The "95%" describes the long-run success rate of the method.', 'ci'],
    ['Increasing the confidence level from 90% to 99% (same data) makes the interval…', ['narrower', 'wider', 'unchanged', 'shift right'], 1, 'The critical value grows (1.645 → 2.576), so the interval is wider.', 'ci'],
    ['In the CI for σ², the LOWER limit is (n−1)s² divided by…', ['χ²₁₋α/₂ (the small value)', 'χ²α/₂ (the large value)', 'Z_α/2', 't_α/2'], 1, 'Dividing by the larger χ² gives the smaller number, which is the lower limit.', 'ci'],
    ['σ² is estimated by (1/n)Σ(Xᵢ − μ) with μ KNOWN. The χ² pivot has df =', ['n − 1', 'n', 'n − 2', '1'], 1, 'No df is lost estimating the mean, so df = n (Nov 2025 Q3c).', 'ci'],
    ['A Type I error is…', ['not rejecting a false H₀', 'rejecting a true H₀', 'rejecting a false H₀', 'a calculation mistake'], 1, 'Type I = false alarm; its probability is α.', 'testing'],
    ['With n fixed, making α smaller makes β…', ['smaller', 'larger', 'unchanged', 'zero'], 1, 'The critical value moves out, so more of the H₁ distribution is left in the "do not reject" region.', 'testing'],
    ['p-value = 0.03 and α = 0.05. Decision?', ['Reject H₀', 'Do not reject H₀', 'Accept H₀', 'Cannot tell'], 0, 'p < α → reject H₀.', 'testing'],
    ['The same 8 cars are tested without and then with an additive. Which test?', ['Pooled two-sample t', 'Paired t', 'χ² test', 'F test'], 1, 'The same unit is measured twice → the observations are dependent → paired t on the differences.', 'tests'],
    ['Pooled two-sample t with n₁ = n₂ = 7 has df =', ['6', '7', '12', '14'], 2, 'df = n₁ + n₂ − 2 = 12.', 'tests'],
    ['A 3 × 4 contingency table. df for the χ² test of independence =', ['12', '11', '6', '7'], 2, '(3 − 1)(4 − 1) = 6.', 'chiind'],
    ['Expected count in a contingency table cell =', ['row total × column total / grand total', 'grand total / number of cells', 'row total / column total', '(O − E)²/E'], 0, 'That is what independence predicts.', 'chiind'],
    ['Poisson goodness of fit: λ estimated from the data, 5 classes left after merging. df =', ['4', '3', '5', '2'], 1, 'k − 1 − m = 5 − 1 − 1 = 3.', 'gof'],
    ['In simple linear regression the error (residual) df is…', ['n', 'n − 1', 'n − 2', '1'], 2, 'Two parameters (a, b) are estimated.', 'regression'],
    ['R² = 0.81 in simple regression means…', ['r = 0.81', '81% of the variation in y is explained by x', 'the slope is 0.81', '81% of the points lie on the line'], 1, 'R² = SSR/SST. Also |r| = 0.9.', 'regression'],
    ['r = 0 between X and Y means…', ['X and Y are independent', 'there is no LINEAR relationship', 'the slope is 1', 'X causes Y'], 1, 'There could still be a curved relationship.', 'regression'],
    ['V(2X + 3) =', ['2V(X) + 3', '4V(X) + 3', '4V(X)', '2V(X)'], 2, 'Adding 3 does not change the spread; multiplying by 2 multiplies the variance by 4.', 'ev'],
    ['X, Y independent. V(X − Y) =', ['V(X) − V(Y)', 'V(X) + V(Y)', '0', 'V(X)V(Y)'], 1, 'The variances always add for independent variables.', 'ev'],
    ['Stratified sampling is preferred when…', ['the groups are alike', 'the population has distinct subgroups that must all be represented', 'there is no list', 'it must be cheap'], 1, 'Strata differ from each other, so sample from every stratum in proportion.', 'sampling'],
    ['A 5 × 5 Latin square: error df =', ['16', '20', '12', '4'], 2, '(p − 1)(p − 2) = 4 × 3 = 12.', 'doe'],
    ['For a normal population, which estimates μ more efficiently?', ['median', 'mean', 'they are equal', 'mode'], 1, 'V(median)/V(mean) → π/2 ≈ 1.57.', 'median'],
    ['For a continuous random variable, P(X = 5) is…', ['f(5)', '0', '1', 'F(5)'], 1, 'A single point has zero area under a density.', 'normal'],
  ];
  App.add({
    id: 'quiz', group: G, icon: '✅', title: 'Quick quiz (32 questions)', noProgress: true,
    html: () => `
      <p class="lead">Click an answer to see instantly whether it is right and <b>why</b>. If you get one wrong, open the linked page.</p>
      <div class="readout"><div class="stat big"><div class="k">score</div><div class="v" id="qzScore">0 / 0</div></div><div class="stat"><div class="k">best so far</div><div class="v" id="qzBest">${UI.store.get('quizBest', 0)} / ${Q.length}</div></div></div>
      <div class="btnrow"><button class="btn" id="qzShuffle">🔀 Shuffle & restart</button></div>
      <div id="qz"></div>`,
    init(root) {
      let order = Q.map((_, i) => i), right = 0, done = 0;
      const titles = Object.fromEntries(App.topics.map(t => [t.id, t.title]));
      const render = () => {
        right = done = 0; root.querySelector('#qzScore').textContent = '0 / 0';
        root.querySelector('#qz').innerHTML = order.map((qi, n) => { const q = Q[qi]; return `<div class="card quiz-q" data-q="${qi}"><b>${n + 1}. ${q[0]}</b>${q[1].map((o, i) => `<button class="quiz-opt" data-i="${i}">${String.fromCharCode(65 + i)}. ${o}</button>`).join('')}<div class="quiz-exp box idea"><b class="tag">Why</b><div>${q[3]} <a href="#${q[4]}">Revise: ${titles[q[4]]} ›</a></div></div></div>`; }).join('');
        root.querySelectorAll('.quiz-q').forEach(card => {
          const q = Q[+card.dataset.q];
          card.querySelectorAll('.quiz-opt').forEach(b => b.onclick = () => {
            const i = +b.dataset.i; card.querySelectorAll('.quiz-opt').forEach(x => x.disabled = true);
            card.querySelectorAll('.quiz-opt')[q[2]].classList.add('right'); card.querySelectorAll('.quiz-opt')[q[2]].insertAdjacentText('beforeend', '  ✔');
            if (i !== q[2]) { b.classList.add('wrong'); b.insertAdjacentText('beforeend', '  ✖'); } else right++;
            done++; card.querySelector('.quiz-exp').style.display = 'block';
            root.querySelector('#qzScore').textContent = `${right} / ${done}`;
            if (done === Q.length && right > UI.store.get('quizBest', 0)) { UI.store.set('quizBest', right); root.querySelector('#qzBest').textContent = `${right} / ${Q.length}`; }
          });
        });
      };
      root.querySelector('#qzShuffle').onclick = () => { order.sort(() => Math.random() - 0.5); render(); };
      render();
    }
  });

  /* ---------------- FORMULA SHEET ---------------- */
  const card = (t, rows) => `<div class="card"><h3>${t}</h3><table class="t" style="width:100%">${rows.map(r => `<tr><td class="l" style="width:34%">${r[0]}</td><td class="l f">${r[1]}</td></tr>`).join('')}</table></div>`;
  App.add({
    id: 'formulas', group: G, icon: '📋', title: 'Formula sheet (printable)', noProgress: true,
    html: () => `
      <div class="btnrow"><button class="btn primary" onclick="window.print()">🖨️ Print / save as PDF</button></div>
      ${card('Discrete distributions', [['Binomial', 'C(n,x)pˣqⁿ⁻ˣ; &nbsp; μ = np, σ² = npq'], ['Poisson', 'e<sup>−λ</sup>λˣ/x!; &nbsp; μ = σ² = λ'], ['Geometric', 'pqˣ⁻¹ (x = 1, 2, …); &nbsp; μ = 1/p, σ² = q/p²'], ['Negative binomial', 'C(x−1, r−1)pʳqˣ⁻ʳ; &nbsp; μ = r/p, σ² = rq/p²'], ['Hypergeometric', 'C(k,x)C(N−k,n−x)/C(N,n); &nbsp; μ = nk/N, σ² = nk(N−k)(N−n)/[N²(N−1)]'], ['Multinomial', 'n!/(x₁!…x<sub>k</sub>!) θ₁ˣ¹…θ<sub>k</sub>ˣᵏ']])}
      ${card('Continuous distributions', [['Normal', 'Z = (X − μ)/σ'], ['Exponential', 'λe<sup>−λx</sup>; P(X > x) = e<sup>−λx</sup>; μ = 1/λ, σ² = 1/λ²; memoryless'], ['Gamma', 'x<sup>α−1</sup>e<sup>−x/β</sup>/(β<sup>α</sup>Γ(α)); μ = αβ, σ² = αβ²; Γ(n) = (n−1)!, Γ(½) = √π'], ['χ²(k)', 'Gamma(k/2, 2); μ = k, σ² = 2k'], ['t(v)', 'mean 0, variance v/(v−2)'], ['F(v₁, v₂)', 'mean v₂/(v₂−2); F<sub>1−α</sub>(v₁,v₂) = 1/F<sub>α</sub>(v₂,v₁)']])}
      ${card('Sampling distributions', [['Mean', 'x̄ ~ N(μ, σ²/n); with the FPC multiply the variance by (N−n)/(N−1)'], ['Proportion', 'p̂ ~ N(P, PQ/n)'], ['Difference of means', 'x̄₁ − x̄₂ ~ N(μ₁ − μ₂, σ₁²/n₁ + σ₂²/n₂)'], ['Difference of proportions', 'p̂₁ − p̂₂ ~ N(P₁ − P₂, P₁Q₁/n₁ + P₂Q₂/n₂)'], ['t', '(x̄ − μ)/(s/√n) ~ t<sub>n−1</sub>'], ['χ²', '(n−1)s²/σ² ~ χ²<sub>n−1</sub>'], ['F', '(s₁²/σ₁²)/(s₂²/σ₂²) ~ F(n₁−1, n₂−1)'], ['Normal approx.', 'Bin → N(np, npq) if np, nq ≥ 5; Pois → N(λ, λ); use ±0.5']])}
      ${card('Confidence intervals', [['μ (σ known / n large)', 'x̄ ± Z<sub>α/2</sub> σ/√n'], ['μ (σ unknown, small n)', 'x̄ ± t<sub>α/2,n−1</sub> s/√n'], ['P', 'p̂ ± Z<sub>α/2</sub>√(p̂q̂/n)'], ['σ²', '[(n−1)s²/χ²<sub>α/2</sub>, (n−1)s²/χ²<sub>1−α/2</sub>]'], ['μ₁ − μ₂', '(x̄₁ − x̄₂) ± Z√(σ₁²/n₁ + σ₂²/n₂)'], ['P₁ − P₂', '(p̂₁ − p̂₂) ± Z√(p̂₁q̂₁/n₁ + p̂₂q̂₂/n₂)'], ['Z values', '90%: 1.645 &nbsp; 95%: 1.96 &nbsp; 99%: 2.576']])}
      ${card('Hypothesis tests', [['One mean', 'Z = (x̄ − μ₀)/(σ/√n) or t = (x̄ − μ₀)/(s/√n), df n−1'], ['Two means, pooled', 's<sub>p</sub>² = [(n₁−1)s₁² + (n₂−1)s₂²]/(n₁+n₂−2); t = (x̄₁−x̄₂)/(s<sub>p</sub>√(1/n₁+1/n₂)), df n₁+n₂−2'], ['Two means, unequal', 't = (x̄₁−x̄₂)/√(s₁²/n₁+s₂²/n₂), df = min(n₁,n₂) − 1'], ['Paired', 't = (d̄ − μ<sub>d0</sub>)/(s<sub>d</sub>/√n), df n−1'], ['One proportion', 'Z = (p̂ − P₀)/√(P₀Q₀/n)'], ['Two proportions', 'Z = (p̂₁ − p̂₂)/√(p̂q̂(1/n₁+1/n₂)), p̂ = (x₁+x₂)/(n₁+n₂)'], ['One variance', 'χ² = (n−1)s²/σ₀², df n−1'], ['Two variances', 'F = s₁²/s₂², df (n₁−1, n₂−1)'], ['Large-n variance region', 's² = σ₀²[1 + Z<sub>α</sub>√(2/(n−1))]']])}
      ${card('χ² tests', [['Statistic', 'Σ(O − E)²/E'], ['Independence', 'E = (row × col)/N; df = (r−1)(c−1)'], ['Goodness of fit', 'E = n·p<sub>i</sub>; df = k − 1 − m (merge cells with E < 5 first)']])}
      ${card('Regression & correlation', [['Sums of squares', 'S<sub>xx</sub> = Σx² − (Σx)²/n; S<sub>yy</sub> = Σy² − (Σy)²/n; S<sub>xy</sub> = Σxy − ΣxΣy/n'], ['Line', 'b = S<sub>xy</sub>/S<sub>xx</sub>; a = ȳ − bx̄'], ['Correlation', 'r = S<sub>xy</sub>/√(S<sub>xx</sub>S<sub>yy</sub>); R² = SSR/SST'], ['ANOVA', 'SST = S<sub>yy</sub>; SSR = bS<sub>xy</sub> = b²S<sub>xx</sub>; SSE = S<sub>yy</sub> − b²S<sub>xx</sub>; F = MSR/MSE ~ F(1, n−2)'], ['Slope test / CI', 'SE(b) = √(MSE/S<sub>xx</sub>); t = b/SE(b) ~ t<sub>n−2</sub>; b ± t<sub>α/2,n−2</sub>SE(b)'], ['Fisher z (ρ = 0)', 'Z = (√(n−3)/2) ln[(1+r)/(1−r)]']])}
      ${card('Latin square (p × p)', [['Model', 'y<sub>ij(k)</sub> = μ + ρ<sub>i</sub> + γ<sub>j</sub> + τ<sub>k</sub> + ε'], ['SS', 'CF = G²/p²; SS = Σ(totals²)/p − CF for rows, columns, treatments'], ['df', 'rows, cols, treatments: p − 1 each; error (p−1)(p−2); total p² − 1']])}
      ${card('Expectation & variance', [['Definitions', 'E(X) = Σx p(x); V(X) = E(X²) − [E(X)]²'], ['Linear', 'E(aX + b) = aE(X) + b; V(aX + b) = a²V(X)'], ['Sums', 'V(X ± Y) = V(X) + V(Y) ± 2Cov(X,Y)']])}`
  });
})();
