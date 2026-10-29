/* ===== WEEK 8 : CORRELATION, REGRESSION, ANOVA ===== */
(function () {
  const F = UI.frac, R = UI.sqrt, f = S.fmt;
  const G = 'Part E · Regression';

  const SETS = {
    gloves: { l: 'Jun 2022 Q4 · temperature vs gloves', xl: 'Temperature (°F)', yl: 'Pairs of gloves (100s)', x: [72, 71, 78, 75, 81, 77, 68, 76], y: [37, 37, 32, 36, 33, 35, 39, 34] },
    rods: { l: 'Nov 2024 Q2 · load vs deflection', xl: 'Load x (g)', yl: 'Deflection y (cm)', x: [25, 30, 35, 40, 55, 45, 50, 60], y: [1.58, 1.39, 1.41, 1.60, 1.81, 1.78, 1.65, 1.94] },
    sat: { l: 'Nov 2023 Q3 · Verbal SAT vs Math SAT', xl: 'Verbal SAT', yl: 'Math SAT', x: [493, 563, 565, 570, 574, 585, 588, 589, 590, 592, 596], y: [502, 552, 562, 563, 579, 588, 588, 589, 605, 597, 608] },
    tute: { l: 'Tutorial · x vs y example', xl: 'x', yl: 'y', x: [26.8, 28.9, 23.6, 28.1, 22.6, 27.7, 24.7, 25.6], y: [26.5, 24.2, 27.1, 22.5, 25.8, 23.6, 26.3, 24.9] },
    wind: { l: 'Tutorial · wind speed vs DC output', xl: 'Wind speed (mph)', yl: 'DC output', x: [0.123, 0.5, 0.653, 0.558, 1.057, 1.137, 1.144, 1.194, 1.562, 1.582, 1.501, 1.737, 1.822, 1.866, 1.93, 1.8, 2.088, 2.179, 2.166, 2.112, 2.303, 2.294, 2.386, 2.236, 2.31], y: [2.45, 2.7, 2.9, 3.05, 3.4, 3.6, 3.95, 4.1, 4.6, 5, 5.45, 5.8, 6, 6.2, 6.35, 7, 7.4, 7.85, 8.15, 8.8, 9.1, 9.55, 9.7, 10, 10.2] },
  };

  function fullWorking(xs, ys, alpha = 0.05) {
    const g = S.regress(xs, ys), n = g.n, df = n - 2;
    const tc = S.tCrit(alpha / 2, df), Fc = S.fCrit(alpha, 1, df), Fst = g.SSR / g.MSE, tst = g.b / g.seB;
    const zF = Math.sqrt(n - 3) / 2 * Math.log((1 + g.r) / (1 - g.r));
    return { ...g, df, tc, Fc, Fst, tst, zF, ciB: [g.b - tc * g.seB, g.b + tc * g.seB], pF: 1 - S.fCdf(Fst, 1, df) };
  }

  App.add({
    id: 'regression', group: G, icon: '📉', week: 'Wk 8', title: 'Correlation & linear regression',
    html: () => `
      <p class="lead">Regression finds the straight line ŷ = a + bx that best predicts y from x. "Best" means it makes the <b>sum of squared errors</b> as small as possible. <b>Drag the points</b> and watch the line, the error squares and r react.</p>
      <div class="card">
        <div class="controls"><div class="ctl" style="max-width:420px"><label>Data set</label><select id="rSel">${Object.entries(SETS).map(([k, d]) => `<option value="${k}">${d.l}</option>`).join('')}</select></div>
          <label class="ctl" style="flex-direction:row;align-items:center;gap:6px;max-width:220px"><input type="checkbox" id="rSq" checked> show squared errors</label>
          <label class="ctl" style="flex-direction:row;align-items:center;gap:6px;max-width:220px"><input type="checkbox" id="rMine"> try my own line</label></div>
        <div class="controls" id="mineCtl" style="display:none">${UI.slider('ma', 'my intercept a', -100, 100, 0.1, 0)}${UI.slider('mb', 'my slope b', -5, 5, 0.01, 0)}</div>
        <div id="rChart"></div>
        ${UI.legend([['var(--s1)', 'data point (drag me)'], ['var(--s2)', 'least-squares line ŷ = a + bx', true], ['var(--s4)', 'your line', true], ['color-mix(in srgb, var(--s2) 30%, transparent)', 'squared errors (their total area = SSE)']])}
        <div class="readout" id="rOut"></div>
        <b>Splitting the variation: SST = SSR + SSE</b>
        <div id="rSplit"></div>
      </div>
      ${UI.idea(`<ul><li><b>r</b> (between −1 and +1) measures how close the points are to <b>a straight line</b>. The sign gives the direction.</li><li><b>R² = SSR/SST</b> is the fraction of the variation in y that the line explains. R² = r² for simple regression.</li><li>The least-squares line always passes through <b>(x̄, ȳ)</b>.</li><li>r = 0 means no <i>linear</i> relationship. The variables could still be related in a curve. Correlation is not causation.</li></ul>`)}
      <div class="card"><h3>What does r look like?</h3><div class="controls">${UI.slider('rr', 'target correlation r', -1, 1, 0.05, 0.7)}</div><div id="rGal"></div></div>

      <h2>🧮 Full exam working for the selected data set</h2>
      <p class="muted">This updates with the data set above, including the points you dragged. It follows the order of marks in the past papers.</p>
      <div id="rWork"></div>

      <div class="card"><h3>ANOVA table for regression</h3>
        <table class="t"><tr><th>Source</th><th>SS</th><th>df</th><th>MS</th><th>F</th></tr>
        <tr><td class="l">Regression</td><td>SSR = Σ(ŷ − ȳ)² = b·S<sub>xy</sub> = b²S<sub>xx</sub></td><td>1</td><td>MSR = SSR/1</td><td rowspan="2">F = MSR/MSE ~ F(1, n−2)</td></tr>
        <tr><td class="l">Error (residual)</td><td>SSE = Σ(y − ŷ)² = S<sub>yy</sub> − b²S<sub>xx</sub></td><td>n − 2</td><td>MSE = SSE/(n−2) = σ̂²</td></tr>
        <tr><td class="l">Total</td><td>SST = Σ(y − ȳ)² = S<sub>yy</sub></td><td>n − 1</td><td></td><td></td></tr></table>
        <p>H₀: the regression line does not fit the data well (β = 0) &nbsp; vs &nbsp; H₁: the line fits well (β ≠ 0). Reject H₀ if F &gt; F<sub>α</sub>(1, n − 2). For simple regression, F = t².</p></div>
      ${UI.trap(`<ul><li>df for error = <b>n − 2</b> (two parameters, a and b, are estimated).</li><li>S<sub>xx</sub> = Σx² − (Σx)²/n. Don't confuse Σx² with (Σx)².</li><li>"Sum of squares of X" in a question usually means S<sub>xx</sub> = Σ(x − x̄)².</li><li>Interpret b in context: "for each 1 °F rise in temperature, production changes by b hundred pairs on average".</li></ul>`)}

      <h2>📝 Past paper questions with summary statistics</h2>
      ${UI.steps('Jun 2022 (19 batch) · Q4 c (part) · show that SSE = S<sub>yy</sub> − b²S<sub>xx</sub>', 'Show that the error sum of squares is S<sub>yy</sub> − β̂²S<sub>xx</sub>.', [
        ['Write ŷ using a = ȳ − bx̄', `ŷᵢ = a + bxᵢ = ȳ + b(xᵢ − x̄) &nbsp;⇒&nbsp; yᵢ − ŷᵢ = (yᵢ − ȳ) − b(xᵢ − x̄)`],
        ['Square and sum', `SSE = Σ[(yᵢ − ȳ) − b(xᵢ − x̄)]² = S<sub>yy</sub> − 2bS<sub>xy</sub> + b²S<sub>xx</sub>`],
        ['Use b = S<sub>xy</sub>/S<sub>xx</sub> ⇒ S<sub>xy</sub> = bS<sub>xx</sub>', `SSE = S<sub>yy</sub> − 2b(bS<sub>xx</sub>) + b²S<sub>xx</sub> = <b>S<sub>yy</sub> − b²S<sub>xx</sub></b> &nbsp; ∎`],
      ])}
      ${UI.steps('Nov 2025 (23 batch) · Q4 c · 10 marks', 'ŷ = 21.69 + 3.471x (test score vs hours studied). Variance of the errors σ̂² = 14.720, n = 10, sum of squares of X = 376 and of Y = 475.24. (i) 95% CI for the regression coefficient, and interpret it. (ii) Find F in the ANOVA and test goodness of fit at 5%.', [
        ['(i) SE of b', `SE(b) = √(σ̂²/S<sub>xx</sub>) = √(14.720/376) = <b>${f(Math.sqrt(14.72 / 376))}</b>`],
        ['Critical t (df = n − 2 = 8)', `t<sub>0.025, 8</sub> = ${f(S.tCrit(0.025, 8), 3)}`],
        ['CI', `3.471 ± 2.306 × ${f(Math.sqrt(14.72 / 376))} = 3.471 ± ${f(S.tCrit(0.025, 8) * Math.sqrt(14.72 / 376))} = <b>(${f(3.471 - S.tCrit(0.025, 8) * Math.sqrt(14.72 / 376), 3)}, ${f(3.471 + S.tCrit(0.025, 8) * Math.sqrt(14.72 / 376), 3)})</b>`],
        ['Interpret', `We are 95% confident that each extra hour of study increases the mean test score by between about 3.0 and 3.9 marks. The interval does not contain 0, so hours studied is a significant predictor.`],
        ['(ii) ANOVA pieces', `SSE = (n − 2)σ̂² = 8 × 14.72 = 117.76; &nbsp; SST = S<sub>yy</sub> = 475.24; &nbsp; SSR = SST − SSE = <b>357.48</b>`],
        ['F statistic', `F = ${F('SSR/1', 'SSE/(n−2)')} = ${F('357.48', '14.72')} = <b>${f(357.48 / 14.72, 3)}</b> &nbsp; vs &nbsp; F<sub>0.05</sub>(1, 8) = ${f(S.fCrit(0.05, 1, 8), 3)}`],
        ['Decision', `${f(357.48 / 14.72, 2)} > 5.32 → <span class="reject">reject H₀</span>. The regression model fits the data well at 5%. <small>(Note: the given figures are not fully consistent, because b²S<sub>xx</sub> = ${f(3.471 ** 2 * 376, 0)} &gt; S<sub>yy</sub>. Using SSR = b²S<sub>xx</sub> instead gives an even larger F, so the decision is the same.)</small>`],
      ])}
      ${UI.steps('Jan 2023 (20 batch) · Q2 B(ii) · 8 marks', 'The line ŷ = 0.208 + 0.026x is fitted to the n = 20 observations. The regression mean square is 120.97 and the error mean square is 19.45. Test whether the model fits at 5%.', [
        ['Hypotheses', `H₀: the regression line does not fit the data well (β = 0); H₁: it fits well (β ≠ 0)`],
        ['F', `F = MSR/MSE = 120.97/19.45 = <b>${f(120.97 / 19.45, 3)}</b>, df = (1, n − 2) = (1, 18)`],
        ['Critical value', `F<sub>0.05</sub>(1, 18) = <b>${f(S.fCrit(0.05, 1, 18), 3)}</b>`],
        ['Decision', `6.22 > 4.41 → <span class="reject">reject H₀</span>: the regression model fits the data well (p = ${f(1 - S.fCdf(120.97 / 19.45, 1, 18))}).`],
      ])}
      ${UI.steps('Jun 2022 (19 batch) · Q4 e · 2 marks', 'Model summary: R = 0.925, R² = 0.855, adjusted R² = 0.831, standard error of the estimate = 0.956. Explain the goodness of fit.', [
        ['Answer', `R² = 0.855: <b>85.5%</b> of the variation in glove production is explained by temperature through the linear model. Adjusted R² = 0.831 (corrected for the number of predictors) is still high. R = 0.925 shows a strong linear relationship (negative here, since b &lt; 0). Typical prediction errors are about 0.956 hundred pairs. The model fits well.`],
      ])}
      ${UI.steps('Jan 2023 (20 batch) · Q4 B · 7 marks', 'A multiple regression model is ŷ = 7.38 + 0.04x₁ + 0.07x₂ + 0.30x₃. (i) Two assumptions? (ii) Interpret the coefficient of x₃. (iii) R² = 0.5582. What does it say?', [
        ['(i) Assumptions', `The errors εᵢ are <u>independent</u> and <u>Normally distributed with mean 0 and constant variance σ²</u> (homoscedasticity); y is <u>linearly</u> related to the x's; the predictors are not strongly correlated with each other (no multicollinearity).`],
        ['(ii) Interpretation of 0.30', `If x₁ and x₂ are <b>held constant</b>, a one-unit increase in x₃ increases the expected value of y by 0.30 units.`],
        ['(iii) R² = 0.5582', `About <b>55.8%</b> of the variation in y is explained by x₁, x₂, x₃ together. The fit is only moderate: about 44% is unexplained, so other important variables may be missing.`],
      ])}`,
    init(root) {
      let key = 'gloves', xs = [...SETS.gloves.x], ys = [...SETS.gloves.y], range, drag = -1, plot;
      const setRange = () => {
        const xl = Math.min(...xs), xh = Math.max(...xs), yl = Math.min(...ys), yh = Math.max(...ys);
        const px = (xh - xl) * 0.15 || 1, py = (yh - yl) * 0.25 || 1;
        range = { x: [xl - px, xh + px], y: [yl - py, yh + py] };
        const g = S.regress(xs, ys);
        const ma = root.querySelector('#ma'), mb = root.querySelector('#mb');
        const bs = Math.max(Math.abs(g.b) * 3, 0.05);
        mb.min = (-bs).toFixed(3); mb.max = bs.toFixed(3); mb.step = (bs / 200).toPrecision(2); mb.value = (g.b * 0.6).toPrecision(4);
        const as = Math.abs(g.a) + Math.abs(g.b * g.mx) + (yh - yl) * 2;
        ma.min = (g.a - as).toFixed(2); ma.max = (g.a + as).toFixed(2); ma.step = (as / 400).toPrecision(2); ma.value = (g.my - g.b * 0.6 * g.mx).toPrecision(5);
      };
      const draw = () => {
        const d = SETS[key], g = S.regress(xs, ys), sq = root.querySelector('#rSq').checked, mine = root.querySelector('#rMine').checked;
        plot = Plot.make(root.querySelector('#rChart'), { x: range.x, y: range.y, h: 340, xlab: d.xl, ylab: d.yl, margin: { l: 60 } });
        const p = plot;
        // squared residuals as true squares in screen space (visual metaphor)
        const yScalePx = Math.abs(p.sy(1) - p.sy(0)), xScalePx = Math.abs(p.sx(1) - p.sx(0));
        const lineA = mine ? +root.querySelector('#ma').value : g.a, lineB = mine ? +root.querySelector('#mb').value : g.b;
        if (sq) xs.forEach((x, i) => {
          const yh = lineA + lineB * x, e = ys[i] - yh, side = Math.abs(e) * yScalePx / xScalePx;
          const dir = (x - g.mx) > 0 ? -1 : 1;
          p.rect(x, yh, x + dir * side, ys[i], { color: mine ? 'var(--s4)' : 'var(--s2)', opacity: 0.16, stroke: mine ? 'var(--s4)' : 'var(--s2)', sw: 0.6 });
        });
        xs.forEach((x, i) => p.line(x, ys[i], x, lineA + lineB * x, { color: mine ? 'var(--s4)' : 'var(--s2)', dash: '3 2', width: 1, under: true }));
        p.curve(x => g.a + g.b * x, { color: 'var(--s2)', width: 2.5 });
        if (mine) p.curve(x => lineA + lineB * x, { color: 'var(--s4)', width: 2.5 });
        p.text(g.mx, g.my, '✚ (x̄, ȳ)', { dx: 6, dy: -8, anchor: 'start', color: 'var(--text-secondary)', bg: true, size: 11 });
        xs.forEach((x, i) => {
          const c = p.el('circle', { cx: p.sx(x), cy: p.sy(ys[i]), r: 7, 'data-i': i }, { fill: drag === i ? 'var(--s2)' : 'var(--s1)', stroke: 'var(--surface-1)', strokeWidth: 2, cursor: 'grab', touchAction: 'none' });
          c.addEventListener('mousemove', ev => { if (drag < 0) Plot.showTip(`point ${i + 1}: (<b>${f(x, 3)}</b>, <b>${f(ys[i], 3)}</b>)<br>ŷ = ${f(g.a + g.b * x, 3)}, residual e = <b>${f(ys[i] - g.a - g.b * x, 3)}</b>`, ev); });
          c.addEventListener('mouseleave', Plot.hideTip);
          p.gTop.append(c);
        });
        const mineSSE = S.sum(xs.map((x, i) => (ys[i] - lineA - lineB * x) ** 2));
        root.querySelector('#rOut').innerHTML = `<div class="stat big"><div class="k">ŷ = a + bx</div><div class="v" style="font-size:1.15rem">ŷ = ${f(g.a, 4)} ${g.b < 0 ? '−' : '+'} ${f(Math.abs(g.b), 4)}x</div></div>
          <div class="stat"><div class="k">r</div><div class="v">${f(g.r, 4)}</div></div><div class="stat"><div class="k">R²</div><div class="v">${f(g.R2, 4)}</div></div>
          <div class="stat"><div class="k">SSE (least squares)</div><div class="v">${f(g.SSE, 4)}</div></div>
          ${mine ? `<div class="stat"><div class="k">SSE of YOUR line</div><div class="v" style="color:var(--s4)">${f(mineSSE, 4)}</div></div>` : ''}`;
        // SST split bar
        const sp = Plot.make(root.querySelector('#rSplit'), { x: [0, g.SST], y: [0, 1], h: 70, noY: true, margin: { l: 14, b: 26, t: 4 }, xtickCount: 5 });
        sp.rect(0, 0.15, g.SSR - g.SST * 0.002, 0.85, { color: 'var(--s1)', opacity: 0.9, rx: 4 });
        sp.rect(g.SSR + g.SST * 0.002, 0.15, g.SST, 0.85, { color: 'var(--s2)', opacity: 0.9, rx: 4 });
        if (g.SSR / g.SST > 0.15) sp.text(g.SSR / 2, 0.5, `SSR ${f(g.SSR, 3)} (${f(g.R2 * 100, 1)}%) explained`, { color: '#fff', bold: true, dy: 4 });
        if (g.SSE / g.SST > 0.15) sp.text(g.SSR + g.SSE / 2, 0.5, `SSE ${f(g.SSE, 3)} unexplained`, { color: '#fff', bold: true, dy: 4 });
        if (drag < 0) work();
      };
      const work = () => {
        const d = SETS[key], w = fullWorking(xs, ys), n = w.n;
        const rows = xs.map((x, i) => `<tr><td>${f(x, 4)}</td><td>${f(ys[i], 4)}</td><td>${f(x * x, 4)}</td><td>${f(ys[i] ** 2, 4)}</td><td>${f(x * ys[i], 4)}</td></tr>`).join('');
        const html = UI.steps(d.l, `x = ${d.xl}, y = ${d.yl} (n = ${n}). Fit the least-squares line, test the fit (ANOVA), test β, find a 95% CI for β, and test ρ.`, [
          ['Scatter plot & correlation (evidence of a linear relationship?)', `r = ${F('S<sub>xy</sub>', '√(S<sub>xx</sub>S<sub>yy</sub>)')} = ${F(f(w.Sxy, 4), `√(${f(w.Sxx, 4)} × ${f(w.Syy, 4)})`)} = <b>${f(w.r, 4)}</b> → ${Math.abs(w.r) > 0.8 ? 'strong' : Math.abs(w.r) > 0.5 ? 'moderate' : 'weak'} ${w.r > 0 ? 'positive' : 'negative'} linear relationship. The scatter plot above shows the points lying roughly along a line.`],
          ['Table of sums', `<div class="tablewrap"><table class="t"><tr><th>x</th><th>y</th><th>x²</th><th>y²</th><th>xy</th></tr>${rows}<tr><th>Σx = ${f(w.sumX, 4)}</th><th>Σy = ${f(w.sumY, 4)}</th><th>Σx² = ${f(w.sumX2, 4)}</th><th>Σy² = ${f(w.sumY2, 4)}</th><th>Σxy = ${f(w.sumXY, 4)}</th></tr></table></div>`],
          ['S<sub>xx</sub>, S<sub>yy</sub>, S<sub>xy</sub>', `S<sub>xx</sub> = Σx² − (Σx)²/n = ${f(w.sumX2, 4)} − ${f(w.sumX, 4)}²/${n} = <b>${f(w.Sxx, 4)}</b><br>S<sub>yy</sub> = Σy² − (Σy)²/n = <b>${f(w.Syy, 4)}</b><br>S<sub>xy</sub> = Σxy − (Σx)(Σy)/n = <b>${f(w.Sxy, 4)}</b>`],
          ['Least-squares estimates', `b = S<sub>xy</sub>/S<sub>xx</sub> = ${f(w.Sxy, 4)}/${f(w.Sxx, 4)} = <b>${f(w.b, 5)}</b><br>a = ȳ − b x̄ = ${f(w.my, 4)} − (${f(w.b, 5)})(${f(w.mx, 4)}) = <b>${f(w.a, 4)}</b><br><b>ŷ = ${f(w.a, 4)} ${w.b < 0 ? '−' : '+'} ${f(Math.abs(w.b), 5)}x</b>. Each 1-unit increase in x changes the mean y by ${f(w.b, 4)}.`],
          ['ANOVA', `<div class="tablewrap"><table class="t"><tr><th>Source</th><th>SS</th><th>df</th><th>MS</th><th>F</th></tr>
            <tr><td class="l">Regression</td><td>SSR = b·S<sub>xy</sub> = ${f(w.SSR, 4)}</td><td>1</td><td>${f(w.SSR, 4)}</td><td rowspan="2"><b>${f(w.Fst, 3)}</b></td></tr>
            <tr><td class="l">Error</td><td>SSE = S<sub>yy</sub> − SSR = ${f(w.SSE, 4)}</td><td>${w.df}</td><td>${f(w.MSE, 5)}</td></tr>
            <tr><td class="l">Total</td><td>${f(w.SST, 4)}</td><td>${n - 1}</td><td></td><td></td></tr></table></div>
            H₀: the line does not fit (β = 0) vs H₁: it fits. F<sub>0.05</sub>(1, ${w.df}) = ${f(w.Fc, 3)}. ${w.Fst > w.Fc ? `<span class="reject">${f(w.Fst, 2)} > ${f(w.Fc, 2)} → reject H₀</span>: the model fits well.` : `<span class="accept">${f(w.Fst, 2)} < ${f(w.Fc, 2)} → do not reject H₀</span>: the fit is not significant.`} R² = ${f(w.R2, 4)} (${f(w.R2 * 100, 1)}% of the variation is explained).`],
          ['t test for the regression coefficient', `H₀: β = 0 vs H₁: β ≠ 0. &nbsp; SE(b) = √(MSE/S<sub>xx</sub>) = √(${f(w.MSE, 5)}/${f(w.Sxx, 4)}) = ${f(w.seB, 5)}<br>t = b/SE(b) = ${f(w.b, 5)}/${f(w.seB, 5)} = <b>${f(w.tst, 3)}</b> vs ±t<sub>0.025, ${w.df}</sub> = ±${f(w.tc, 3)} → ${Math.abs(w.tst) > w.tc ? '<span class="reject">significant</span>' : '<span class="accept">not significant</span>'} (note t² = ${f(w.tst ** 2, 3)} = F)`],
          ['95% CI for β', `b ± t<sub>0.025, ${w.df}</sub>·SE(b) = ${f(w.b, 5)} ± ${f(w.tc, 3)} × ${f(w.seB, 5)} = <b>(${f(w.ciB[0], 5)}, ${f(w.ciB[1], 5)})</b>${w.ciB[0] * w.ciB[1] > 0 ? '. It does not contain 0, so β is significant.' : '. It contains 0, so β is not significant.'}`],
          ['Test ρ = 0 (Fisher z, as in Nov 2024 Q2b)', `Z<sub>cal</sub> = ${F('√(n−3)', 2)} ln${F('1 + r', '1 − r')} = ${F(`√${n - 3}`, 2)} ln${F(f(1 + w.r, 4), f(1 - w.r, 4))} = <b>${f(w.zF, 3)}</b> vs ±1.96 → ${Math.abs(w.zF) > 1.96 ? '<span class="reject">ρ is significantly different from 0</span>' : '<span class="accept">ρ is not significantly different from 0</span>'}`],
        ]);
        const el = root.querySelector('#rWork'); el.innerHTML = html; UI.initCommon(el);
      };
      // dragging: listeners on window because every redraw replaces the svg
      root.querySelector('#rChart').addEventListener('pointerdown', ev => {
        const i = ev.target.dataset && ev.target.dataset.i;
        if (i != null) { drag = +i; ev.preventDefault(); Plot.hideTip(); }
      });
      const onMove = ev => {
        if (drag < 0 || !plot) return;
        const svg = plot.svg, pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
        const q = pt.matrixTransform(svg.getScreenCTM().inverse()), W = plot.W, H = plot.H, m = plot.m;
        xs[drag] = +(range.x[0] + (q.x - m.l) / (W - m.l - m.r) * (range.x[1] - range.x[0])).toPrecision(5);
        ys[drag] = +(range.y[0] + (H - m.b - q.y) / (H - m.t - m.b) * (range.y[1] - range.y[0])).toPrecision(5);
        draw();
      };
      const onUp = () => { if (drag >= 0) { drag = -1; draw(); } };
      window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
      window.addEventListener('hashchange', () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); }, { once: true });
      const load = k => { key = k; xs = [...SETS[k].x]; ys = [...SETS[k].y]; setRange(); draw(); };
      root.querySelector('#rSel').addEventListener('change', e => load(e.target.value));
      root.querySelector('#rSq').addEventListener('change', draw);
      root.querySelector('#rMine').addEventListener('change', e => { root.querySelector('#mineCtl').style.display = e.target.checked ? '' : 'none'; draw(); });
      ['ma', 'mb'].forEach(id => root.querySelector('#' + id).addEventListener('input', () => { root.querySelector('#' + id + '_o').textContent = (+root.querySelector('#' + id).value).toPrecision(4); draw(); }));
      load('gloves');

      // correlation gallery
      const base = Array.from({ length: 70 }, () => [S.randn(), S.randn()]);
      UI.bind(root, ['rr'], v => {
        const r = v.rr, pts = base.map(([a, b]) => [a, r * a + Math.sqrt(1 - r * r) * b]);
        const p = Plot.make(root.querySelector('#rGal'), { x: [-3.2, 3.2], y: [-3.6, 3.6], h: 240, noY: true, margin: { l: 14 } });
        pts.forEach(q => p.dot(q[0], q[1], { r: 3.5 }));
        const sr = S.regress(pts.map(q => q[0]), pts.map(q => q[1]));
        p.curve(x => sr.a + sr.b * x, { color: 'var(--s2)', width: 2 });
        p.text(-3, 3.2, `sample r = ${f(sr.r, 2)}`, { anchor: 'start', bold: true, bg: true });
      });
    }
  });
})();
