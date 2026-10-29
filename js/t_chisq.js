/* ===== WEEK 7 : CHI-SQUARE TESTS ===== */
(function () {
  const F = UI.frac, f = S.fmt;
  const G = 'Part D · χ² tests';

  /* ---------------- independence engine ---------------- */
  function indep(O) {
    const r = O.length, c = O[0].length;
    const rt = O.map(row => S.sum(row)), ct = O[0].map((_, j) => S.sum(O.map(row => row[j]))), N = S.sum(rt);
    const E = O.map((row, i) => row.map((_, j) => rt[i] * ct[j] / N));
    const C = O.map((row, i) => row.map((o, j) => (o - E[i][j]) ** 2 / E[i][j]));
    const chi = S.sum(C.flat()), df = (r - 1) * (c - 1);
    const small = E.flat().filter(e => e < 5).length;
    return { r, c, rt, ct, N, E, C, chi, df, small, pct: small / (r * c) * 100, p: 1 - S.chiCdf(chi, df), crit: S.chiCrit(0.05, df) };
  }
  const IND = {
    iq: { l: 'Tutorial · IQ test by gender', rows: ['Male', 'Female'], cols: ['Pass', 'Fail'], O: [[28, 12], [34, 26]], rv: 'Gender', cv: 'Result' },
    dvd: { l: 'Jun 2022 Q2b / Nov 2023 Q4a · DVD factories', rows: ['Repair needed', 'Repair not needed'], cols: ['A', 'B', 'C', 'D'], O: [[4, 15, 9, 12], [8, 10, 6, 6]], rv: 'Reliability', cv: 'Factory' },
    onl: { l: 'Jan 2023 Q3A(ii) · delivery mode × field', rows: ['Online', 'Physical'], cols: ['A', 'B', 'C', 'D', 'E'], O: [[45, 21, 10, 13, 33], [25, 23, 23, 22, 12]], rv: 'Preferred mode', cv: 'Engineering field' },
  };

  function tableHTML(d, O, res, editable) {
    const mx = Math.max(...res.C.flat(), 1e-9);
    let h = `<table class="t"><tr><th class="l">${d.rv} \\ ${d.cv}</th>${d.cols.map(c => `<th>${c}</th>`).join('')}<th>Row total</th></tr>`;
    O.forEach((row, i) => {
      h += `<tr><th class="l">${d.rows[i]}</th>` + row.map((o, j) => {
        const e = res.E[i][j], c = res.C[i][j], t = Math.min(1, c / mx), pos = o >= e;
        const bg = `color-mix(in srgb, ${pos ? 'var(--div-pos)' : 'var(--div-neg)'} ${Math.round(t * 55)}%, var(--div-mid))`;
        return `<td style="background:${bg};min-width:86px" data-tip="O = <b>${o}</b><br>E = ${res.rt[i]} × ${res.ct[j]} / ${res.N} = <b>${f(e, 3)}</b><br>(O−E)²/E = <b>${f(c, 4)}</b><br>${pos ? 'more than expected ▲' : 'fewer than expected ▼'}">
          ${editable ? `<input type="number" data-i="${i}" data-j="${j}" value="${o}">` : `<b>${o}</b>`}<br><small>E = ${f(e, 2)}${e < 5 ? ' ⚠️' : ''}</small><br><small>${pos ? '▲' : '▼'} ${f(c, 3)}</small></td>`;
      }).join('') + `<td><b>${res.rt[i]}</b></td></tr>`;
    });
    h += `<tr><th class="l">Column total</th>${res.ct.map(c => `<td><b>${c}</b></td>`).join('')}<td><b>${res.N}</b></td></tr></table>`;
    return h;
  }

  App.add({
    id: 'chiind', group: G, icon: '🔲', week: 'Wk 7', title: 'χ² test of independence',
    html: () => `
      <p class="lead">Two <b>categorical</b> variables (e.g. factory and reliability). Are they <b>associated</b>? Work out what the table <b>would</b> look like if they were independent (the expected counts E), then measure how far the real table (O) is from it.</p>
      <div class="grid2"><div class="fb">E = ${F('row total × column total', 'grand total')}</div><div class="fb">χ² = Σ ${F('(O − E)²', 'E')} ~ χ²<sub>(r−1)(c−1)</sub></div></div>
      <div class="card">
        <div class="controls"><div class="ctl" style="max-width:420px"><label>Data set</label><select id="ciSel">${Object.entries(IND).map(([k, d]) => `<option value="${k}">${d.l}</option>`).join('')}</select></div></div>
        <p class="muted">Each cell shows O (you can edit it), E, and its contribution (O−E)²/E. Colour: <span style="color:var(--div-pos)">▲ red = more than expected</span>, <span style="color:var(--div-neg)">▼ blue = fewer than expected</span>, and a darker cell gives a bigger contribution. Hover for the working.</p>
        <div id="ciTable" class="tablewrap"></div>
        <div class="readout" id="ciOut"></div>
        <div id="ciChart"></div>
        <div id="ciDec"></div>
      </div>
      ${UI.idea(`If the variables are independent, each row should be split <b>in the same proportions</b> as the column totals. That is exactly what E = (row × column)/N does. A large χ² means the rows are split differently, so the variables are associated.`)}
      ${UI.trap(`<ul><li>df = (rows − 1)(columns − 1), <b>not</b> n − 1.</li><li>The χ² test of independence is always <b>right-tailed</b> (big χ² = big disagreement).</li><li>Validity: every E ≥ 1 and <b>no more than 20% of cells with E &lt; 5</b>. Otherwise merge categories. (Nov 2023 Q4a(ii) asks you to comment on this.)</li><li>Use counts, never percentages.</li></ul>`)}
      ${UI.tip(`H₀: there is <b>no association</b> between [row variable] and [column variable] (they are independent).<br>H₁: there <b>is</b> an association.<br>… Since χ²<sub>cal</sub> ${'>'} χ²<sub>0.05, df</sub>, reject H₀: at the 5% level, [row variable] depends on [column variable].`)}
      <h2>📝 Past paper questions</h2>
      <div id="ciWorked"></div>`,
    init(root) {
      let key = 'iq', O = IND[key].O.map(r => [...r]);
      const draw = () => {
        const d = IND[key], res = indep(O);
        const tb = root.querySelector('#ciTable'); tb.innerHTML = tableHTML(d, O, res, true);
        tb.querySelectorAll('td[data-tip]').forEach(td => { td.addEventListener('mousemove', e => Plot.showTip(td.dataset.tip, e)); td.addEventListener('mouseleave', Plot.hideTip); });
        tb.querySelectorAll('input').forEach(inp => inp.addEventListener('change', () => { O[+inp.dataset.i][+inp.dataset.j] = Math.max(0, +inp.value); draw(); }));
        root.querySelector('#ciOut').innerHTML = `<div class="stat big"><div class="k">χ² = Σ(O−E)²/E</div><div class="v">${f(res.chi)}</div></div><div class="stat"><div class="k">df = (${res.r}−1)(${res.c}−1)</div><div class="v">${res.df}</div></div><div class="stat"><div class="k">cells with E &lt; 5</div><div class="v">${res.small} (${f(res.pct, 1)}%)</div></div>`;
        const r = UI.testPlot(root.querySelector('#ciChart'), { dist: 'chi', df: res.df, tail: 'right', alpha: 0.05, stat: res.chi, h: 220 });
        root.querySelector('#ciDec').innerHTML = UI.decision(r, 0.05) + `<p>${r.reject ? `<b>Conclusion:</b> there is a significant association between ${d.rv.toLowerCase()} and ${d.cv.toLowerCase()}.` : `<b>Conclusion:</b> there is no significant evidence of an association between ${d.rv.toLowerCase()} and ${d.cv.toLowerCase()}. They appear independent.`} ${res.pct > 20 ? '⚠️ More than 20% of the cells have E &lt; 5, so the χ² approximation is doubtful. Merge categories.' : '✔ The expected-count rule is satisfied.'}</p>`;
      };
      root.querySelector('#ciSel').addEventListener('change', e => { key = e.target.value; O = IND[key].O.map(r => [...r]); draw(); });
      draw();
      // worked solutions
      const worked = (src, q, d, interp) => {
        const res = indep(d.O);
        return UI.steps(src, q, [
          ['Hypotheses', `H₀: ${d.rv} and ${d.cv} are independent (no association). &nbsp; H₁: they are associated.`],
          ['Totals and expected counts E = (row × column)/N', `<div class="tablewrap"><table class="t"><tr><th></th>${d.cols.map(c => `<th>${c}</th>`).join('')}<th>Total</th></tr>${d.O.map((row, i) => `<tr><th>${d.rows[i]}</th>${row.map((o, j) => `<td>${o}<br><small>E = ${f(res.E[i][j], 2)}</small></td>`).join('')}<td>${res.rt[i]}</td></tr>`).join('')}<tr><th>Total</th>${res.ct.map(c => `<td>${c}</td>`).join('')}<td>${res.N}</td></tr></table></div>e.g. E₁₁ = ${res.rt[0]} × ${res.ct[0]} / ${res.N} = ${f(res.E[0][0], 3)}`],
          ['Contributions (O − E)²/E', res.C.map((row, i) => row.map(c => f(c, 3)).join(' + ')).join(' + <br>') + ` = <b>${f(res.chi)}</b>`],
          ['Degrees of freedom & critical value', `df = (${res.r} − 1)(${res.c} − 1) = ${res.df}; &nbsp; χ²<sub>0.05, ${res.df}</sub> = <b>${f(res.crit, 3)}</b>`],
          ['Decision', `${f(res.chi, 3)} ${res.chi > res.crit ? '>' : '<'} ${f(res.crit, 3)} → ${res.chi > res.crit ? '<span class="reject">reject H₀</span>' : '<span class="accept">do not reject H₀</span>'} (p = ${f(res.p)})`],
          ['Interpretation', interp(res)],
        ]);
      };
      root.querySelector('#ciWorked').innerHTML =
        worked('Jun 2022 (19) Q2b · 11 marks &nbsp;|&nbsp; Nov 2023 (21) Q4a · 12 marks', 'Recorders from factories A to D: repair needed 4, 15, 9, 12; repair not needed 8, 10, 6, 6. Test for an association between factory and reliability at 5% and interpret (Nov 2023 also asks about cells with E < 5).', IND.dvd,
          r => `At the 5% level there is no significant evidence that a recorder's first-year reliability depends on the factory that made it. All ${r.r * r.c} expected counts are ≥ 5 (the smallest is ${f(Math.min(...r.E.flat()), 2)}), so <b>0% of cells have E &lt; 5</b> and the test is valid.`) +
        worked('Jan 2023 (20 batch) · Q3 A(ii) · 10 marks', 'Preferred mode (online/physical) by engineering field A to E. Is there a significant association at 5%?', IND.onl,
          r => `At the 5% level the preferred mode of delivery is significantly associated with the field of study. Fields A and E prefer online more than expected (▲), and C and D prefer physical.`) +
        UI.steps('Jan 2023 (20 batch) · Q3 A(i) · 5 marks', 'Briefly describe a sampling plan to select 350 students representing 3 intakes and 5 disciplines.', [
          ['Use stratified random sampling', `The population has natural subgroups: 3 intakes × 5 disciplines = <b>15 strata</b>. Students in a stratum are similar, and strata differ.`],
          ['Proportional allocation', `Get the list (sampling frame) of each stratum. Sample n<sub>h</sub> = 350 × N<sub>h</sub>/N students from stratum h.`],
          ['Select randomly inside each stratum', `Use random numbers (simple random sampling) within each stratum, then combine. Every intake and discipline is represented in proportion. See <a href="#sampling">Sampling techniques</a>.`],
        ]);
      UI.initCommon(root.querySelector('#ciWorked'));
    }
  });

  /* ---------------- goodness of fit ---------------- */
  function merge(labels, O, E) {
    const g = []; let cur = null;
    labels.forEach((l, i) => {
      if (!cur) cur = { l: [], O: 0, E: 0 };
      cur.l.push(l); cur.O += O[i]; cur.E += E[i];
      if (cur.E >= 5) { g.push(cur); cur = null; }
    });
    if (cur) { if (g.length) { const last = g[g.length - 1]; last.O += cur.O; last.E += cur.E; last.l.push(...cur.l); } else g.push(cur); }
    return g.map(x => ({ label: x.l.length > 1 ? `${x.l[0]} – ${x.l[x.l.length - 1]}` : x.l[0], O: x.O, E: x.E, merged: x.l.length > 1 }));
  }
  const GOF = {
    lib: { l: 'Nov 2025 Q4b · library books per weekday (uniform)', type: 'unif', labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], O: [20, 13, 18, 17, 22] },
    die: { l: 'Tutorial · is the die fair? (uniform)', type: 'unif', labels: ['1', '2', '3', '4', '5', '6'], O: [20, 14, 18, 17, 22, 29] },
    dig: { l: 'Tutorial · random digits (uniform)', type: 'unif', labels: '0123456789'.split(''), O: [40, 58, 49, 53, 38, 56, 61, 53, 60, 32] },
    toy: { l: 'Jun 2022 Q2a · defective toys per hour (Poisson)', type: 'pois', labels: ['0', '1', '2', '3', '4', '5', '≥6'], vals: [0, 1, 2, 3, 4, 5, 6], O: [33, 78, 59, 20, 7, 2, 1] },
    rain: { l: 'Tutorial · rainstorms per station (Poisson)', type: 'pois', labels: ['0', '1', '2', '3', '4', '5', '>5'], vals: [0, 1, 2, 3, 4, 5, 6], O: [102, 114, 74, 28, 10, 2, 0] },
    gei: { l: 'Nov 2024 Q4b · Geiger counter (Normal)', type: 'norm', labels: ['5–9', '10–14', '15–19', '20–24', '25–29', '30–34', '35+'], mids: [7, 12, 17, 22, 27, 32, 37], bounds: [9.5, 14.5, 19.5, 24.5, 29.5, 34.5], O: [1, 10, 37, 36, 13, 2, 1] },
  };
  function gofRun(d) {
    const n = S.sum(d.O); let probs, m = 0, est = '';
    if (d.type === 'unif') { probs = d.O.map(() => 1 / d.O.length); est = `Uniform: every category has p = 1/${d.O.length}; E = ${n}/${d.O.length} = ${f(n / d.O.length, 3)}. No parameters estimated (m = 0).`; }
    if (d.type === 'pois') {
      const lam = S.sum(d.O.map((o, i) => o * d.vals[i])) / n; m = 1;
      probs = d.vals.map((x, i) => i === d.vals.length - 1 ? 1 - S.poisCdf(x - 1, lam) : S.poisPmf(x, lam));
      est = `λ̂ = x̄ = Σfx / Σf = ${S.sum(d.O.map((o, i) => o * d.vals[i]))}/${n} = <b>${f(lam, 4)}</b> (1 parameter estimated, m = 1). The last class takes the whole upper tail so the probabilities add to 1.`;
      d.lam = lam;
    }
    if (d.type === 'norm') {
      const mu = S.sum(d.O.map((o, i) => o * d.mids[i])) / n;
      const ss = S.sum(d.O.map((o, i) => o * (d.mids[i] - mu) ** 2)), sd = Math.sqrt(ss / (n - 1)); m = 2;
      const cdf = d.bounds.map(b => S.normCdf(b, mu, sd));
      probs = d.O.map((_, i) => (i === d.O.length - 1 ? 1 : cdf[i]) - (i === 0 ? 0 : cdf[i - 1]));
      est = `Use class midpoints: x̄ = Σfx/n = <b>${f(mu, 3)}</b>; s = √(Σf(x − x̄)²/(n − 1)) = √(${f(ss, 1)}/${n - 1}) = <b>${f(sd, 3)}</b> (2 parameters estimated, m = 2).<br>Class probabilities come from the class boundaries ${d.bounds.join(', ')}: e.g. P(X < 9.5) = Φ(${F(`9.5 − ${f(mu, 2)}`, f(sd, 3))}) = ${f(cdf[0])}`;
      d.mu = mu; d.sd = sd;
    }
    const E = probs.map(p => p * n), g = merge(d.labels, d.O, E);
    const chi = S.sum(g.map(x => (x.O - x.E) ** 2 / x.E)), df = g.length - 1 - m;
    return { n, probs, E, g, chi, df, m, est, crit: S.chiCrit(0.05, Math.max(1, df)), p: 1 - S.chiCdf(chi, Math.max(1, df)) };
  }

  App.add({
    id: 'gof', group: G, icon: '📶', week: 'Wk 7', title: 'χ² goodness of fit',
    html: () => `
      <p class="lead">Does the data follow a <b>claimed distribution</b> (uniform, Poisson, normal…)? Compute what you would expect to see (E = n × probability) and compare it with what you saw (O).</p>
      <div class="grid2"><div class="fb">χ² = Σ ${F('(O − E)²', 'E')}</div><div class="fb">df = k − 1 − m</div></div>
      <p style="text-align:center" class="muted">k = number of classes AFTER merging; m = number of parameters you estimated from the data (Poisson λ → 1; Normal μ, σ → 2; Uniform → 0)</p>
      <div class="card">
        <div class="controls"><div class="ctl" style="max-width:440px"><label>Data set</label><select id="gSel">${Object.entries(GOF).map(([k, d]) => `<option value="${k}">${d.l}</option>`).join('')}</select></div></div>
        <div id="gObs" class="controls"></div>
        <div class="box tip" id="gEst"></div>
        <div id="gBars"></div>
        ${UI.legend([['var(--s1)', 'Observed O'], ['var(--s2)', 'Expected E']])}
        <div id="gTable" class="tablewrap"></div>
        <div class="readout" id="gOut"></div>
        <div id="gChart"></div><div id="gDec"></div>
      </div>
      ${UI.trap(`<ul><li><b>Merge</b> neighbouring classes until every E ≥ 5, and do it <b>before</b> you count k.</li><li>Subtract one df for <b>each parameter estimated</b> from the data. Forgetting this is the most common mistake.</li><li>For Poisson, the last class must be "≥ x" (it takes the whole tail) so the probabilities add to 1.</li><li>For normal grouped data, use the <b>class boundaries</b> (9.5, 14.5, …) to get the probabilities, not the class limits.</li></ul>`)}
      ${UI.tip(`H₀: the data follow a [Poisson/Uniform/Normal] distribution. H₁: they do not.<br>Right-tailed: reject H₀ if χ²<sub>cal</sub> &gt; χ²<sub>α, k−1−m</sub>.<br>"Do not reject" means the model <b>fits adequately</b>.`)}
      <h2>📝 Past paper questions</h2>
      <div id="gWorked"></div>`,
    init(root) {
      let key = 'lib', d = JSON.parse(JSON.stringify(GOF[key]));
      const draw = () => {
        const r = gofRun(d);
        root.querySelector('#gEst').innerHTML = `<b class="tag">Step 1 · model & parameters</b><div>${r.est}</div>`;
        const k = d.labels.length, ym = Math.max(...d.O, ...r.E) * 1.15;
        const p = Plot.make(root.querySelector('#gBars'), { x: [-0.7, k - 0.3], y: [0, ym], h: 230, xticks: S.range(0, k - 1), xfmt: i => d.labels[i] ?? '', ylab: 'frequency' });
        p.bars(d.O.map((o, i) => ({ x: i - 0.2, y: o })), { width: 0.4, color: 'var(--s1)', tip: b => `${d.labels[Math.round(b.x + 0.2)]}: observed <b>${b.y}</b>` });
        p.bars(r.E.map((e, i) => ({ x: i + 0.2, y: e })), { width: 0.4, color: 'var(--s2)', tip: b => `${d.labels[Math.round(b.x - 0.2)]}: expected <b>${f(b.y, 2)}</b>${b.y < 5 ? '<br>⚠️ E &lt; 5 → merge' : ''}` });
        root.querySelector('#gTable').innerHTML = `<table class="t"><tr><th>Class (after merging)</th><th>O</th><th>E</th><th>(O − E)²/E</th></tr>${r.g.map(x => `<tr${x.merged ? ' style="background:var(--accent-bg)"' : ''}><td>${x.label}${x.merged ? ' <span class="chip a">merged</span>' : ''}</td><td>${x.O}</td><td>${f(x.E, 3)}</td><td>${f((x.O - x.E) ** 2 / x.E, 4)}</td></tr>`).join('')}<tr><th>Total</th><th>${r.n}</th><th>${f(S.sum(r.E), 2)}</th><th>${f(r.chi, 4)}</th></tr></table>`;
        root.querySelector('#gOut').innerHTML = `<div class="stat big"><div class="k">χ²</div><div class="v">${f(r.chi)}</div></div><div class="stat"><div class="k">k (classes after merge)</div><div class="v">${r.g.length}</div></div><div class="stat"><div class="k">df = k − 1 − m = ${r.g.length} − 1 − ${r.m}</div><div class="v">${r.df}</div></div>`;
        if (r.df < 1) { root.querySelector('#gChart').innerHTML = '<p>⚠️ df &lt; 1: too few classes remain after merging.</p>'; root.querySelector('#gDec').innerHTML = ''; return; }
        const res = UI.testPlot(root.querySelector('#gChart'), { dist: 'chi', df: r.df, tail: 'right', alpha: 0.05, stat: r.chi, h: 210 });
        root.querySelector('#gDec').innerHTML = UI.decision(res, 0.05) + `<p>${res.reject ? 'The data do <b>not</b> follow the proposed distribution.' : 'The proposed distribution <b>fits the data adequately</b>.'}</p>`;
      };
      const build = () => {
        root.querySelector('#gObs').innerHTML = d.labels.map((l, i) => `<div class="ctl" style="min-width:70px;flex:0 1 80px"><label>O(${l})</label><input type="number" min="0" data-i="${i}" value="${d.O[i]}"></div>`).join('');
        root.querySelectorAll('#gObs input').forEach(inp => inp.addEventListener('input', () => { d.O[+inp.dataset.i] = Math.max(0, +inp.value || 0); draw(); }));
        draw();
      };
      root.querySelector('#gSel').addEventListener('change', e => { key = e.target.value; d = JSON.parse(JSON.stringify(GOF[key])); build(); });
      build();

      const worked = (src, q, k, extraFirst, interp) => {
        const dd = JSON.parse(JSON.stringify(GOF[k])), r = gofRun(dd);
        return UI.steps(src, q, [
          ...extraFirst,
          ['Model & parameter estimates', r.est],
          ['Expected frequencies E = n × p', `<div class="tablewrap"><table class="t"><tr><th>class</th>${dd.labels.map(l => `<th>${l}</th>`).join('')}</tr><tr><td>O</td>${dd.O.map(o => `<td>${o}</td>`).join('')}</tr><tr><td>p</td>${r.probs.map(p => `<td>${f(p, 4)}</td>`).join('')}</tr><tr><td>E</td>${r.E.map(e => `<td>${f(e, 2)}${e < 5 ? '⚠️' : ''}</td>`).join('')}</tr></table></div>`],
          ['Merge classes with E < 5, then compute', `${r.g.map(x => `<span class="chip">${x.label}: O=${x.O}, E=${f(x.E, 2)}</span>`).join(' ')}<br>χ² = ${r.g.map(x => f((x.O - x.E) ** 2 / x.E, 3)).join(' + ')} = <b>${f(r.chi)}</b>`],
          ['Degrees of freedom & critical value', `df = k − 1 − m = ${r.g.length} − 1 − ${r.m} = ${r.df}; &nbsp; χ²<sub>0.05, ${r.df}</sub> = <b>${f(r.crit, 3)}</b>`],
          ['Decision', `${f(r.chi, 3)} ${r.chi > r.crit ? '>' : '<'} ${f(r.crit, 3)} → ${r.chi > r.crit ? '<span class="reject">reject H₀</span>' : '<span class="accept">do not reject H₀</span>'} (p = ${f(r.p)}). ${interp(r.chi > r.crit)}`],
        ]);
      };
      root.querySelector('#gWorked').innerHTML =
        worked('Nov 2025 (23 batch) · Q4 b · 10 marks', 'Books signed out: Mon 20, Tue 13, Wed 18, Thu 17, Fri 22. Is it equally likely that a person takes a book on each weekday? Use 5%.', 'lib',
          [['Hypotheses', 'H₀: books are taken out equally often on all 5 days (uniform, p = 1/5 each). H₁: they are not equally likely.']],
          rej => rej ? '' : 'There is no significant difference in the number of books taken out on different days.') +
        worked('Jun 2022 (19 batch) · Q2 a · 14 marks', 'Defective toys per hour in 200 one-hour slots: 0:33, 1:78, 2:59, 3:20, 4:7, 5:2, 6:1. (i) Suggest a model and estimate its parameter. (ii) Test the fit at 5%.', 'toy',
          [['(i) Suggest a model', 'We are <b>counting random events (defects) in a fixed interval (1 hour)</b> → Poisson(λ). Check: the sample mean (1.5) is close to the sample variance, as expected for a Poisson.'], ['Hypotheses', 'H₀: the number of defective toys per hour follows a Poisson distribution. H₁: it does not.']],
          rej => rej ? '' : 'The Poisson model adequately fits the number of defective toys per hour.') +
        worked('Nov 2024 (22 batch) · Q4 b · 15 marks', 'Particles emitted in 100 forty-second intervals (classes 5–9, …, 35+). Test at 5% whether the data can be regarded as a random sample from a normal population.', 'gei',
          [['Hypotheses', 'H₀: the number of particles follows a normal distribution. H₁: it does not.']],
          rej => rej ? 'The normal model does not fit.' : 'The data can be regarded as a sample from a normal population.');
      UI.initCommon(root.querySelector('#gWorked'));
    }
  });
})();
