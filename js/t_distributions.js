/* ===== WEEKS 1–2 : DISTRIBUTIONS ===== */
(function () {
  const F = UI.frac, R = UI.sqrt, f = S.fmt;
  const G = 'Part A · Distributions';

  /* ------------------------------------------------------------------ */
  /* 1. DISCRETE DISTRIBUTIONS EXPLORER                                   */
  /* ------------------------------------------------------------------ */
  const DISTS = {
    binom: {
      label: 'Binomial', params: [['n', 'n = number of trials', 1, 40, 1, 12], ['p', 'p = P(success)', 0.01, 0.99, 0.01, 0.25]],
      fix: v => v, sup: v => [0, v.n], pmf: (x, v) => S.binomPmf(x, v.n, v.p),
      mean: v => v.n * v.p, vari: v => v.n * v.p * (1 - v.p),
      sub: (k, v) => `C(${v.n}, ${k}) · ${v.p}<sup>${k}</sup> · ${f(1 - v.p, 2)}<sup>${v.n - k}</sup>`,
      story: `Do <b>n</b> independent trials. Each trial is a success with the <b>same</b> probability p. <b>X = number of successes.</b><br>Example: throw a die 12 times and count the sixes.`,
      formula: `P(X = x) = C(n, x) · p<sup>x</sup> · (1 − p)<sup>n − x</sup>, &nbsp; x = 0, 1, …, n &nbsp;&nbsp;|&nbsp;&nbsp; E(X) = np, &nbsp; V(X) = npq`,
      keys: 'fixed n · independent · constant p · count successes · "with replacement"',
    },
    pois: {
      label: 'Poisson', params: [['lam', 'λ = average count in the interval', 0.2, 20, 0.1, 3]],
      fix: v => v, sup: v => [0, Math.ceil(v.lam + 4.5 * Math.sqrt(v.lam) + 3)], pmf: (x, v) => S.poisPmf(x, v.lam),
      mean: v => v.lam, vari: v => v.lam,
      sub: (k, v) => `e<sup>−${v.lam}</sup> · ${v.lam}<sup>${k}</sup> / ${k}!`,
      story: `Events happen <b>randomly</b> in time (or space) at an average rate λ per interval. <b>X = number of events in the interval.</b><br>Example: page requests per second, defects per 800 cm².`,
      formula: `P(X = x) = ${F('e<sup>−λ</sup> λ<sup>x</sup>', 'x!')}, &nbsp; x = 0, 1, 2, … &nbsp;&nbsp;|&nbsp;&nbsp; E(X) = V(X) = λ`,
      keys: '"per hour / per cm² / per second" · rare events · average rate · mean = variance',
    },
    geom: {
      label: 'Geometric', params: [['p', 'p = P(success)', 0.03, 0.95, 0.01, 0.3]],
      fix: v => v, sup: v => [1, Math.min(60, Math.max(8, Math.ceil(Math.log(0.004) / Math.log(1 - v.p))))], pmf: (x, v) => S.geomPmf(x, v.p),
      mean: v => 1 / v.p, vari: v => (1 - v.p) / v.p ** 2,
      sub: (k, v) => `${v.p} · ${f(1 - v.p, 2)}<sup>${k - 1}</sup>`,
      story: `Repeat independent trials <b>until the first success</b>. <b>X = the trial number of that first success.</b><br>Example: the inspector inspects widgets until the first defective one.`,
      formula: `g(x; p) = p · q<sup>x − 1</sup>, &nbsp; x = 1, 2, … &nbsp;&nbsp;|&nbsp;&nbsp; E(X) = ${F(1, 'p')}, &nbsp; V(X) = ${F('q', 'p²')}`,
      keys: '"first success occurs on trial x" · Negative Binomial with r = 1 · memoryless',
    },
    nb: {
      label: 'Negative Binomial', params: [['r', 'r = successes needed', 1, 10, 1, 3], ['p', 'p = P(success)', 0.05, 0.95, 0.01, 0.55]],
      fix: v => v, sup: v => { let x = v.r, c = 0; while (c < 0.996 && x < v.r + 80) { c += S.nbPmf(x, v.r, v.p); x++; } return [v.r, Math.max(x, v.r + 6)]; },
      pmf: (x, v) => S.nbPmf(x, v.r, v.p), mean: v => v.r / v.p, vari: v => v.r * (1 - v.p) / v.p ** 2,
      sub: (k, v) => `C(${k - 1}, ${v.r - 1}) · ${v.p}<sup>${v.r}</sup> · ${f(1 - v.p, 2)}<sup>${k - v.r}</sup>`,
      story: `Repeat independent trials <b>until the r-th success</b>. <b>X = the trial on which the r-th success happens.</b><br>The last trial MUST be a success, so we choose places for the other r − 1 successes among the first x − 1 trials.`,
      formula: `b*(x; r, p) = C(x − 1, r − 1) · p<sup>r</sup> · q<sup>x − r</sup>, &nbsp; x = r, r+1, … &nbsp;&nbsp;|&nbsp;&nbsp; E(X) = ${F('r', 'p')}, &nbsp; V(X) = ${F('rq', 'p²')}`,
      keys: '"wins for the 4th time on the 7th game" · r fixed, trials random',
    },
    hyper: {
      label: 'Hypergeometric', params: [['N', 'N = population size', 2, 60, 1, 20], ['k', 'k = successes in population', 0, 60, 1, 8], ['n', 'n = sample size', 1, 60, 1, 6]],
      fix: v => { v.k = Math.min(v.k, v.N); v.n = Math.min(v.n, v.N); return v; },
      sup: v => [Math.max(0, v.n - (v.N - v.k)), Math.min(v.n, v.k)], pmf: (x, v) => S.hyperPmf(x, v.N, v.n, v.k),
      mean: v => v.n * v.k / v.N, vari: v => v.N > 1 ? v.n * v.k * (v.N - v.k) * (v.N - v.n) / (v.N ** 2 * (v.N - 1)) : 0,
      sub: (k, v) => `C(${v.k}, ${k}) · C(${v.N - v.k}, ${v.n - k}) / C(${v.N}, ${v.n})`,
      story: `A box has <b>N</b> items and <b>k</b> of them are "successes". Draw <b>n WITHOUT replacement</b>. <b>X = number of successes drawn.</b><br>p changes after every draw, so this is NOT Binomial.`,
      formula: `h(x; N, n, k) = ${F('C(k, x) · C(N − k, n − x)', 'C(N, n)')} &nbsp;&nbsp;|&nbsp;&nbsp; E(X) = ${F('nk', 'N')}, &nbsp; V(X) = ${F('nk(N − k)(N − n)', 'N²(N − 1)')}`,
      keys: '"without replacement" · "sample of 4 from a batch of 100" · cards, committees, juries',
    },
  };

  function discreteHTML() {
    return `
      <p class="lead">A <b>discrete</b> random variable <b>counts</b> something (0, 1, 2, …). Each named distribution is just a different <b>story</b> about how the counting happens. Learn the story and you will know which formula to use.</p>
      ${UI.idea(`Every bar in the chart is a probability P(X = x). All bars together add up to 1. <b>Run the experiment</b> many times: the dots (what really happened) settle onto the bars (the theory). That is what a probability distribution means.`)}
      <div class="card">
        ${UI.seg('dd', Object.entries(DISTS).map(([k, d]) => [k, d.label]), 'binom')}
        <div id="ddStory" class="box tip" style="margin-top:12px"></div>
        <div class="controls" id="ddCtl"></div>
        <div class="controls">
          <div>${UI.seg('ev', [['eq', 'P(X = k)'], ['le', 'P(X ≤ k)'], ['ge', 'P(X ≥ k)'], ['bt', 'P(k ≤ X ≤ m)']], 'eq')}</div>
          ${UI.slider('kk', 'k', 0, 12, 1, 3)}
          <div id="mmWrap" style="display:none">${UI.slider('mm', 'm', 0, 12, 1, 6)}</div>
        </div>
        <div id="ddChart" class="chart"></div>
        ${UI.legend([['var(--s1)', 'bars in your event'], ['color-mix(in srgb, var(--text-muted) 40%, transparent)', 'other bars'], ['var(--s2)', 'simulated frequency (dots)']])}
        <div class="readout" id="ddOut"></div>
        <div class="fb" id="ddSub"></div>
        <div class="fb" id="ddFormula" style="font-size:1.05em"></div>
        <h3>🎲 Run the experiment</h3>
        <div class="btnrow"><button class="btn primary" id="sim1">Run once (watch it)</button><button class="btn" id="sim1000">Run 1000 times</button><button class="btn" id="simClr">Clear dots</button></div>
        <div id="simView"></div>
      </div>

      ${UI.trap(`<ul>
        <li><b>Binomial vs Hypergeometric:</b> "with replacement" or an infinite population means Binomial. "Without replacement" from a small group means Hypergeometric.</li>
        <li><b>Poisson:</b> scale λ to the interval asked. 20 defects per 15000 cm² becomes λ = 20 × 800/15000 = 1.067 for 800 cm².</li>
        <li><b>Discrete "≤" vs "<":</b> P(X &lt; 3) = P(X ≤ 2). For a discrete variable the end points matter!</li>
        <li><b>Negative binomial definitions differ.</b> In this course X = the trial number of the r-th success, so the mean is r/p.</li></ul>`)}

      <div class="card">
        <h3>See the links: Binomial ⇄ Hypergeometric and Binomial ⇄ Poisson</h3>
        ${UI.tabs('lk', [['Hypergeometric → Binomial when N is large', `
          <p>Keep the success fraction k/N = 0.5 and the sample n = 6, then make the population N bigger. Without replacement starts to look like with replacement.</p>
          <div class="controls">${UI.slider('hN', 'Population N', 8, 400, 2, 12)}</div><div id="hbChart"></div>`],
        ['Binomial → Poisson when n is large and p is small', `
          <p>Keep λ = np = 3 and increase n (so p = 3/n gets smaller). The Binomial bars turn into the Poisson bars.</p>
          <div class="controls">${UI.slider('bpN', 'n', 4, 200, 1, 6)}</div><div id="bpChart"></div>`]])}
      </div>

      <div class="card">
        <h3>More than two categories: Multinomial & Multivariate Hypergeometric</h3>
        <div class="grid2">
          <div><b>Multinomial</b> (with replacement, k categories)
            <div class="fb" style="font-size:1em">f = ${F('n!', 'x₁! x₂! … x<sub>k</sub>!')} θ₁<sup>x₁</sup> θ₂<sup>x₂</sup> … θ<sub>k</sub><sup>x<sub>k</sub></sup></div>
            <small>TV example: channels 12/10/3 have shares 0.5/0.3/0.2. Of 8 viewers, find P(5, 2, 1):</small>
            <div class="fb" style="font-size:1em">${F('8!', '5! 2! 1!')}(0.5)<sup>5</sup>(0.3)<sup>2</sup>(0.2)<sup>1</sup> = 168 × 0.03125 × 0.09 × 0.2 = <b>${f(168 * 0.03125 * 0.09 * 0.2)}</b></div>
          </div>
          <div><b>Multivariate hypergeometric</b> (without replacement)
            <div class="fb" style="font-size:1em">f = ${F('C(M₁,x₁) C(M₂,x₂) … C(M<sub>k</sub>,x<sub>k</sub>)', 'C(N, n)')}</div>
            <small>Jury example: 6 married men, 3 single men, 7 married women, 4 single women. Choose 12 jurors: 4, 1, 5, 2.</small>
            <div class="fb" style="font-size:1em">${F('C(6,4)C(3,1)C(7,5)C(4,2)', 'C(20,12)')} = ${F('15·3·21·6', '125970')} = <b>${f(15 * 3 * 21 * 6 / S.choose(20, 12))}</b></div>
          </div>
        </div>
      </div>

      <h2>📝 Worked questions (tutorial + past papers)</h2>
      ${UI.steps('Tutorial · Negative binomial', `Shakthi wins a chess game with probability 0.55. Find the probability that: (a) his first win is in the 3rd game; (b) he wins exactly 4 of the first 7; (c) he wins for the 4th time in the 7th game; (d) his 4th win is on or before the 7th game.`, [
        ['Spot the story for each part', `(a) the <b>first</b> success, so Geometric. (b) a fixed 7 games and count wins, so Binomial. (c) and (d): wait for the <b>4th</b> success, so Negative Binomial with r = 4.`],
        ['(a) Geometric', `g(3; 0.55) = 0.55 × 0.45² = <b>${f(S.geomPmf(3, 0.55))}</b>`],
        ['(b) Binomial', `C(7,4)(0.55)⁴(0.45)³ = 35 × ${f(0.55 ** 4)} × ${f(0.45 ** 3)} = <b>${f(S.binomPmf(4, 7, 0.55))}</b>`],
        ['(c) Negative binomial', `b*(7; 4, 0.55) = C(6,3)(0.55)⁴(0.45)³ = 20 × ${f(0.55 ** 4)} × ${f(0.45 ** 3)} = <b>${f(S.nbPmf(7, 4, 0.55))}</b>`],
        ['(d) Add up x = 4, 5, 6, 7', `${[4, 5, 6, 7].map(x => f(S.nbPmf(x, 4, 0.55))).join(' + ')} = <b>${f([4, 5, 6, 7].reduce((s, x) => s + S.nbPmf(x, 4, 0.55), 0))}</b>`],
      ])}
      ${UI.steps('Tutorial · Hypergeometric', `Tyres: 10 in every 100 are defective. A sample of 4 is tested to destruction. Find (a) P(exactly 1 defective), (b) E(X), (c) V(X), (d) P(at most 2 defective).`, [
        ['Identify', `Sampling 4 <b>without replacement</b> from N = 100 with k = 10 defectives, so X ~ h(x; 100, 4, 10).`],
        ['(a)', `h(1) = C(10,1)C(90,3)/C(100,4) = <b>${f(S.hyperPmf(1, 100, 4, 10))}</b>`],
        ['(b) Mean', `nk/N = 4 × 10/100 = <b>0.4</b>`],
        ['(c) Variance', `nk(N−k)(N−n) / [N²(N−1)] = 4·10·90·96 / (100²·99) = <b>${f(4 * 10 * 90 * 96 / (1e4 * 99))}</b>`],
        ['(d)', `h(0) + h(1) + h(2) = ${[0, 1, 2].map(x => f(S.hyperPmf(x, 100, 4, 10))).join(' + ')} = <b>${f([0, 1, 2].reduce((s, x) => s + S.hyperPmf(x, 100, 4, 10), 0))}</b>`],
      ])}
      ${UI.steps('Jan 2023 (20 batch) · Q2 A(i) · 5 marks', `A process makes 20 defects per 15000 cm². A disk pack has 800 cm². A pack with at most one defect is marketable. Find the percentage of marketable disk packs.`, [
        ['Scale λ to the interval', `λ = 20 × ${F(800, 15000)} = <b>${f(20 * 800 / 15000)}</b> defects per pack`],
        ['Marketable means X ≤ 1', `P(X ≤ 1) = e<sup>−λ</sup>(1 + λ) = e<sup>−1.0667</sup> × 2.0667 = <b>${f(S.poisCdf(1, 16 / 15))}</b>`],
        ['Answer', `About <b>${f(S.poisCdf(1, 16 / 15) * 100, 1)}%</b> of the disk packs are marketable.`],
      ])}
      ${UI.steps('Nov 2025 (23 batch) · Q2 a · 5 marks', `A web server overloads if it receives more than 25 page requests in a 1-second interval. Traffic averages 1000 requests per minute. What is the probability of an overload?`, [
        ['Convert the rate to the interval asked (1 second)', `λ = 1000/60 = <b>${f(1000 / 60)}</b> requests per second, so X ~ Poisson(16.67)`],
        ['Overload means X > 25', `P(X > 25) = 1 − P(X ≤ 25) = 1 − Σ<sub>x=0</sub><sup>25</sup> e<sup>−16.67</sup>16.67<sup>x</sup>/x!`],
        ['Compute', `= 1 − ${f(S.poisCdf(25, 1000 / 60))} = <b>${f(1 - S.poisCdf(25, 1000 / 60))}</b>`],
        ['Shortcut (if no calculator sum)', `Normal approximation: μ = σ² = 16.67. P(X > 25.5) = P(Z > (25.5 − 16.67)/4.082) = P(Z > ${f((25.5 - 1000 / 60) / Math.sqrt(1000 / 60), 3)}) = ${f(1 - S.normCdf((25.5 - 1000 / 60) / Math.sqrt(1000 / 60)))}`],
      ])}
      ${UI.steps('Tutorial · Geometric', `A machine makes a defective widget with probability 0.002. The inspector inspects until the first defective. Find P(the 10th widget is the first defective) and P(the 250th widget is the first defective, given the first 240 were good).`, [
        ['Geometric', `X = the trial of the first defective, p = 0.002. g(10) = 0.002 × 0.998⁹ = <b>${f(S.geomPmf(10, 0.002), 6)}</b>`],
        ['Memoryless!', `Given 240 failures already, the process "restarts". P(X = 250 | X > 240) = P(X = 10) = <b>${f(S.geomPmf(10, 0.002), 6)}</b>`],
      ])}
    `;
  }

  function discreteInit(root) {
    let cur = 'binom', vals = {}, tally = null, tallyN = 0;
    const ctl = root.querySelector('#ddCtl');
    const kk = root.querySelector('#kk'), mm = root.querySelector('#mm');
    const getEv = UI.bindSeg(root, 'ev', () => { root.querySelector('#mmWrap').style.display = getEv() === 'bt' ? '' : 'none'; draw(); });
    const buildCtl = () => {
      const d = DISTS[cur];
      ctl.innerHTML = d.params.map(p => UI.slider('p_' + p[0], p[1], p[2], p[3], p[4], p[5])).join('');
      root.querySelector('#ddStory').innerHTML = `<b class="tag">The story</b><div>${d.story}</div><div style="margin-top:6px">${d.keys.split(' · ').map(k => `<span class="chip a">${k}</span>`).join('')}</div>`;
      root.querySelector('#ddFormula').innerHTML = d.formula;
      UI.bind(root, d.params.map(p => 'p_' + p[0]), v => {
        vals = {}; d.params.forEach(p => vals[p[0]] = v['p_' + p[0]]); d.fix(vals);
        tally = null; draw();
      });
    };
    const draw = () => {
      const d = DISTS[cur], [lo, hi] = d.sup(vals);
      kk.min = mm.min = lo; kk.max = mm.max = hi;
      if (+kk.value < lo || +kk.value > hi) kk.value = Math.round((lo + hi) / 3);
      if (+mm.value < +kk.value) mm.value = Math.min(hi, +kk.value + 2);
      root.querySelector('#kk_o').textContent = kk.value; root.querySelector('#mm_o').textContent = mm.value;
      const k = +kk.value, m = +mm.value, ev = getEv();
      const inEv = x => ev === 'eq' ? x === k : ev === 'le' ? x <= k : ev === 'ge' ? x >= k : (x >= k && x <= m);
      const xs = S.range(lo, hi), ps = xs.map(x => d.pmf(x, vals));
      const ymax = Math.max(...ps, tally ? Math.max(...xs.map(x => (tally[x] || 0) / tallyN)) : 0) * 1.15 || 1;
      const p = Plot.make(root.querySelector('#ddChart'), { x: [lo - 0.7, hi + 0.7], y: [0, ymax], h: 260, xlab: 'x', ylab: 'P(X = x)', xtickCount: Math.min(14, hi - lo + 1) });
      p.bars(xs.map((x, i) => ({ x, y: ps[i], color: inEv(x) ? 'var(--s1)' : 'var(--text-muted)', opacity: inEv(x) ? 1 : 0.35 })),
        { width: Math.min(0.85, 0.85), tip: b => `P(X = ${b.x}) = <b>${f(b.y)}</b>${tally ? `<br>simulated: <b>${f((tally[b.x] || 0) / tallyN)}</b>` : ''}` });
      const mu = d.mean(vals);
      p.vline(mu, { color: 'var(--text-secondary)', label: `mean = ${f(mu, 3)}`, ly: ymax, dy: 12 });
      if (tally) xs.forEach(x => p.dot(x, (tally[x] || 0) / tallyN, { color: 'var(--s2)', r: 4 }));
      const prob = xs.reduce((s, x, i) => s + (inEv(x) ? ps[i] : 0), 0);
      const evTxt = ev === 'eq' ? `P(X = ${k})` : ev === 'le' ? `P(X ≤ ${k})` : ev === 'ge' ? `P(X ≥ ${k})` : `P(${k} ≤ X ≤ ${m})`;
      root.querySelector('#ddOut').innerHTML = `
        <div class="stat big"><div class="k">${evTxt}</div><div class="v">${f(prob)}</div></div>
        <div class="stat"><div class="k">mean E(X)</div><div class="v">${f(mu)}</div></div>
        <div class="stat"><div class="k">variance V(X)</div><div class="v">${f(d.vari(vals))}</div></div>
        <div class="stat"><div class="k">SD</div><div class="v">${f(Math.sqrt(d.vari(vals)))}</div></div>`;
      root.querySelector('#ddSub').innerHTML = `P(X = ${k}) = ${d.sub(k, vals)} = <b>${f(d.pmf(k, vals))}</b>` +
        (ev === 'ge' ? `<br><small>P(X ≥ ${k}) = 1 − P(X ≤ ${k - 1}) = ${f(prob)}  ← use the complement when there are many terms</small>` : '');
    };
    UI.bindSeg(root, 'dd', v => { cur = v; tally = null; root.querySelector('#simView').innerHTML = ''; buildCtl(); });
    kk.addEventListener('input', draw); mm.addEventListener('input', draw);
    buildCtl();

    // simulations
    const once = () => {
      const v = vals, out = { seq: [], x: 0 };
      if (cur === 'binom') { for (let i = 0; i < v.n; i++) { const s = Math.random() < v.p; out.seq.push(s); if (s) out.x++; } }
      else if (cur === 'geom' || cur === 'nb') { const r = cur === 'geom' ? 1 : v.r; let succ = 0; while (succ < r && out.seq.length < 400) { const s = Math.random() < v.p; out.seq.push(s); if (s) succ++; } out.x = out.seq.length; }
      else if (cur === 'pois') { let t = S.rexp(v.lam); while (t < 1) { out.seq.push(t); t += S.rexp(v.lam); } out.x = out.seq.length; }
      else if (cur === 'hyper') { const urn = Array.from({ length: v.N }, (_, i) => i < v.k); for (let i = urn.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [urn[i], urn[j]] = [urn[j], urn[i]]; } out.urn = urn; out.drawn = v.n; out.x = urn.slice(0, v.n).filter(Boolean).length; }
      return out;
    };
    const view = root.querySelector('#simView');
    root.querySelector('#sim1').onclick = () => {
      const o = once(); let h = '';
      if (cur === 'pois') {
        h = `<svg viewBox="0 0 640 50" class="viz"><line x1="20" x2="620" y1="25" y2="25" class="axis"/><text x="20" y="46" class="tick">start of interval</text><text x="620" y="46" class="tick" text-anchor="end">end</text>${o.seq.map(t => `<circle cx="${20 + t * 600}" cy="25" r="6" style="fill:var(--s3)"/>`).join('')}</svg>`;
      } else if (cur === 'hyper') {
        h = `<div class="muted">The urn (drawn balls have a ring). Green = success.</div><div class="urn">${o.urn.map((s, i) => `<span class="ball" style="background:${s ? 'var(--s3)' : 'var(--text-muted)'};${i < o.drawn ? 'outline:3px solid var(--s2);outline-offset:1px' : 'opacity:.45'}"></span>`).join('')}</div>`;
      } else {
        h = `<div class="trials">${o.seq.map((s, i) => `<span class="${s ? 'S' : 'F'}" style="animation-delay:${Math.min(i, 60) * 25}ms">${s ? 'S' : 'F'}</span>`).join('')}</div>`;
      }
      view.innerHTML = h + `<p>Result: <b>X = ${o.x}</b> ${cur === 'binom' ? 'successes' : cur === 'pois' ? 'events in the interval' : cur === 'hyper' ? 'successes drawn' : 'trials needed'}</p>`;
      if (!tally) { tally = {}; tallyN = 0; } tally[o.x] = (tally[o.x] || 0) + 1; tallyN++; draw();
    };
    root.querySelector('#sim1000').onclick = () => { if (!tally) { tally = {}; tallyN = 0; } for (let i = 0; i < 1000; i++) { const o = once(); tally[o.x] = (tally[o.x] || 0) + 1; tallyN++; } view.innerHTML = `<p>${tallyN} experiments simulated. The orange dots show how often each value happened. See how they sit on the bars?</p>`; draw(); };
    root.querySelector('#simClr').onclick = () => { tally = null; view.innerHTML = ''; draw(); };

    // comparison charts (two series → legend + grouped bars)
    const grouped = (el, xs, a, b, la, lb) => {
      const ymax = Math.max(...a, ...b) * 1.15;
      const p = Plot.make(el, { x: [xs[0] - 0.7, xs[xs.length - 1] + 0.7], y: [0, ymax], h: 230, xlab: 'x', ylab: 'P(X = x)' });
      p.bars(xs.map((x, i) => ({ x: x - 0.2, y: a[i] })), { width: 0.4, color: 'var(--s1)', tip: d => `${la}: <b>${f(d.y)}</b>` });
      p.bars(xs.map((x, i) => ({ x: x + 0.2, y: b[i] })), { width: 0.4, color: 'var(--s2)', tip: d => `${lb}: <b>${f(d.y)}</b>` });
      el.insertAdjacentHTML('beforeend', UI.legend([['var(--s1)', la], ['var(--s2)', lb]]));
    };
    UI.bind(root, ['hN'], v => {
      const N = v.hN, n = 6, k = N / 2, xs = S.range(0, 6);
      grouped(root.querySelector('#hbChart'), xs, xs.map(x => S.hyperPmf(x, N, n, k)), xs.map(x => S.binomPmf(x, n, 0.5)), `Hypergeometric (N=${N}, k=${k}, n=6)`, 'Binomial (n=6, p=0.5)');
    });
    UI.bind(root, ['bpN'], v => {
      const n = v.bpN, xs = S.range(0, 12);
      grouped(root.querySelector('#bpChart'), xs, xs.map(x => S.binomPmf(x, n, 3 / n)), xs.map(x => S.poisPmf(x, 3)), `Binomial (n=${n}, p=${f(3 / n, 3)})`, 'Poisson (λ = 3)');
    });
  }

  App.add({ id: 'discrete', group: G, icon: '🎲', week: 'Wk 1', title: 'Discrete distributions', html: discreteHTML, init: discreteInit });

  /* ------------------------------------------------------------------ */
  /* 2. FAMILY TREE                                                       */
  /* ------------------------------------------------------------------ */
  const NODES = {
    bern: [70, 50, 'Bernoulli', 'One trial: success (1) or failure (0). P(X=1)=p. E=p, V=pq.', 'discrete'],
    bin: [230, 50, 'Binomial', 'Sum of n independent Bernoulli trials. Count successes in a fixed number n of trials.', 'discrete'],
    multi: [230, 140, 'Multinomial', 'Binomial with more than 2 outcome categories.', 'discrete'],
    hyp: [70, 140, 'Hypergeometric', 'Like Binomial but WITHOUT replacement from a finite population (p changes every draw).', 'discrete'],
    geo: [70, 240, 'Geometric', 'Trials until the FIRST success. Negative binomial with r = 1. Memoryless (discrete).', 'discrete'],
    nb: [70, 330, 'Neg. Binomial', 'Trials until the r-th success. Sum of r geometric waiting times.', 'discrete'],
    poi: [230, 240, 'Poisson', 'Counts of random events per interval. Limit of Binomial as n→∞, p→0, np=λ.', 'discrete'],
    nor: [430, 50, 'Normal', 'Bell curve. The limit of sums and means (CLT). Binomial (large n) and Poisson (large λ) both approach it.', 'normal'],
    exp: [430, 240, 'Exponential', 'Waiting time between Poisson events. Continuous version of Geometric. Memoryless.', 'expo'],
    gam: [430, 330, 'Gamma', 'Waiting time until the α-th Poisson event. Gamma(α=1, β=1/λ) = Exponential.', 'gamma'],
    chi: [610, 330, 'Chi-square χ²', 'Gamma(α=k/2, β=2). Also the sum of k squared Z\'s. (n−1)s²/σ² ~ χ²(n−1).', 'tdist'],
    t: [610, 140, 'Student t', 'Z / √(χ²_k / k). Use when σ is unknown and replaced by s. Fat tails → Normal as df → ∞.', 'tdist'],
    F: [610, 240, 'F', '(χ²₁/v₁) / (χ²₂/v₂). Ratio of two variances. Used for variance tests and ANOVA.', 'tdist'],
  };
  const EDGES = [
    ['bern', 'bin', 'sum of n'], ['bin', 'multi', '>2 categories'], ['bin', 'hyp', 'no replacement'], ['bern', 'geo', 'wait for 1st success'],
    ['geo', 'nb', 'wait for r-th'], ['bin', 'poi', 'n→∞, p→0'], ['bin', 'nor', 'large n (CLT)'], ['poi', 'nor', 'large λ'],
    ['poi', 'exp', 'time between events'], ['geo', 'exp', 'continuous analogue'], ['exp', 'gam', 'α-th event'], ['gam', 'chi', 'α=k/2, β=2'],
    ['nor', 't', 'σ unknown → s'], ['nor', 'chi', 'sum of Z²'], ['chi', 'F', 'ratio of two'], ['chi', 't', 'Z/√(χ²/k)'],
  ];
  App.add({
    id: 'family', group: G, icon: '🌳', week: 'Wk 1–4', title: 'Distribution family tree',
    html: () => `
      <p class="lead">There are not 15 separate formulas to memorise. They form <b>one family</b>. Each arrow is a small change to the story. <b>Hover</b> a box to light up its relatives, and <b>click</b> it to read about it.</p>
      <div class="card"><div id="tree"></div><div id="treeInfo" class="result-card">Click any box…</div></div>
      ${UI.idea(`<ul>
        <li><b>Fix n, count successes</b> → Binomial. <b>Fix the successes, count the trials</b> → Negative Binomial / Geometric.</li>
        <li><b>Count events</b> → Poisson. <b>Time between events</b> → Exponential. <b>Time to the α-th event</b> → Gamma.</li>
        <li>The Week 4 distributions (t, χ², F) are all built from the <b>Normal</b>. They are the tools for inference.</li></ul>`)}
      <div class="card"><h3>Keyword → distribution (memorise this table)</h3>
      <table class="t"><tr><th class="l">If the question says…</th><th>Use</th></tr>
      ${[['"n trials", "independent", "probability p each time", "with replacement"', 'Binomial'], ['"until the first …"', 'Geometric'], ['"for the r-th time on trial x"', 'Negative Binomial'],
        ['"without replacement", "from a batch/deck/committee"', 'Hypergeometric'], ['"per minute", "per cm²", "on average λ events"', 'Poisson'], ['"waiting time", "lifetime", "time between", "memoryless"', 'Exponential'],
        ['"time until the 3rd …", skewed positive amounts (power consumption)', 'Gamma'], ['"normally distributed", bell-shaped measurement', 'Normal'], ['sample mean, large n', 'Normal (CLT)'],
        ['σ unknown, small sample', 't'], ['a variance or standard deviation', 'χ²'], ['ratio of two variances', 'F']].map(r => `<tr><td class="l">${r[0]}</td><td><b>${r[1]}</b></td></tr>`).join('')}
      </table></div>`,
    init(root) {
      const W = 700, H = 380, svg = Plot.el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'viz' });
      root.querySelector('#tree').appendChild(svg);
      const defs = Plot.el('defs'); defs.innerHTML = `<marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:var(--text-muted)"/></marker>`;
      svg.append(defs);
      const eG = Plot.el('g'), nG = Plot.el('g'); svg.append(eG, nG);
      const bw = 112, bh = 34, edgeEls = [];
      EDGES.forEach(([a, b, lab]) => {
        const A = NODES[a], B = NODES[b];
        const dx = B[0] - A[0], dy = B[1] - A[1];
        // trim to box edges
        const t = Math.min(Math.abs(dx) > 0 ? (bw / 2 + 4) / Math.abs(dx) : 9, Math.abs(dy) > 0 ? (bh / 2 + 4) / Math.abs(dy) : 9);
        const x1 = A[0] + dx * t, y1 = A[1] + dy * t, x2 = B[0] - dx * t, y2 = B[1] - dy * t;
        const ln = Plot.el('line', { x1, y1, x2, y2, 'marker-end': 'url(#arr)' }, { stroke: 'var(--text-muted)', strokeWidth: 1.4 });
        const tx = Plot.el('text', { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 4, 'text-anchor': 'middle', class: 'lbl halo' }, { fill: 'var(--text-secondary)', fontSize: '10.5px' });
        tx.textContent = lab; eG.append(ln, tx); edgeEls.push([a, b, ln, tx]);
      });
      Object.entries(NODES).forEach(([id, n]) => {
        const g = Plot.el('g', {}, { cursor: 'pointer' });
        const cont = ['nor', 'exp', 'gam'].includes(id), inf = ['chi', 't', 'F'].includes(id);
        const rect = Plot.el('rect', { x: n[0] - bw / 2, y: n[1] - bh / 2, width: bw, height: bh, rx: 9 }, { fill: inf ? 'var(--s4)' : cont ? 'var(--s3)' : 'var(--s1)', stroke: 'var(--surface-1)', strokeWidth: 2 });
        const tx = Plot.el('text', { x: n[0], y: n[1] + 4.5, 'text-anchor': 'middle' }, { fill: '#fff', fontWeight: 700, fontSize: '13px' }); tx.textContent = n[2];
        g.append(rect, tx); nG.append(g);
        g.addEventListener('mouseenter', () => edgeEls.forEach(([a, b, ln, t]) => { const on = a === id || b === id; ln.style.stroke = on ? 'var(--s2)' : 'var(--border)'; ln.style.strokeWidth = on ? 2.4 : 1; t.style.opacity = on ? 1 : 0.25; }));
        g.addEventListener('mouseleave', () => edgeEls.forEach(([, , ln, t]) => { ln.style.stroke = 'var(--text-muted)'; ln.style.strokeWidth = 1.4; t.style.opacity = 1; }));
        g.addEventListener('click', () => { root.querySelector('#treeInfo').innerHTML = `<b>${n[2]}</b>: ${n[3]} <div class="btnrow"><a class="btn sm primary" href="#${n[4]}">Open the ${n[2]} page ▸</a></div>`; });
      });
      root.querySelector('#tree').insertAdjacentHTML('beforeend', UI.legend([['var(--s1)', 'discrete (Wk 1)'], ['var(--s3)', 'continuous (Wk 2)'], ['var(--s4)', 'sampling distributions (Wk 3–4)']]));
    }
  });

  /* ------------------------------------------------------------------ */
  /* 3. NORMAL                                                            */
  /* ------------------------------------------------------------------ */
  App.add({
    id: 'normal', group: G, icon: '🔔', week: 'Wk 2', title: 'Normal distribution & Z',
    html: () => `
      <p class="lead">The Normal curve is symmetric about μ. Its width is set by σ. <b>Every</b> normal curve becomes the same <b>standard normal Z</b> once you measure distance from the mean in units of σ.</p>
      <div class="fb">Z = ${F('X − μ', 'σ')} &nbsp;&nbsp;&nbsp; f(x) = ${F(1, 'σ√(2π)')} e<sup>−(x−μ)²/(2σ²)</sup></div>
      <div class="card">
        <div class="controls">${UI.slider('nmu', 'μ (mean)', 0, 100, 1, 50)}${UI.slider('nsd', 'σ (standard deviation)', 1, 25, 0.5, 10)}</div>
        <div class="controls">${UI.seg('nev', [['lt', 'P(X < b)'], ['gt', 'P(X > a)'], ['bt', 'P(a < X < b)']], 'bt')}${UI.slider('na', 'a', -50, 150, 0.5, 40)}${UI.slider('nb', 'b', -50, 150, 0.5, 65)}</div>
        <div id="nX"></div>
        <div style="text-align:center;color:var(--text-secondary);font-weight:600">⇣ subtract μ, divide by σ ⇣ &nbsp; (same area, new scale)</div>
        <div id="nZ"></div>
        <div class="readout" id="nOut"></div>
        <div class="fb" id="nWork"></div>
      </div>
      <div class="card">
        <h3>The empirical rule (68 – 95 – 99.7)</h3>
        <p>Click the buttons to see how much area lies within 1, 2 and 3 standard deviations of the mean.</p>
        ${UI.seg('emp', [['1', 'μ ± 1σ'], ['2', 'μ ± 2σ'], ['3', 'μ ± 3σ']], '1')}
        <div id="empChart"></div>
        ${UI.exam(`<b>Nov 2025 Q1a (7 marks):</b> "Explain how the empirical rule can be used to check whether sample means are Normal."<br>
        <b>Model answer:</b> Take many samples and compute the <u>sample mean</u> of each. Find the <u>mean</u> (x̄̄) and <u>standard deviation</u> (standard error) of these sample means. If the <u>sampling distribution</u> is <u>Normal</u>, then about <u>68%</u> of the sample means should fall within ±1 SE, about <u>95%</u> within ±2 SE, and about <u>99.7%</u> within ±3 SE. Count the actual percentages. If they are close to 68/95/99.7, and the histogram is <u>symmetric</u> and <u>bell-shaped</u>, the sample means are approximately Normal. This is what the <u>Central Limit Theorem</u> predicts for a large <u>sample size</u>.`)}
      </div>
      <div class="card">
        <h3>Going backwards: from a probability to a value</h3>
        <p>"Find the lifetime NOT achieved by 0.4% of bulbs" means find x so that the area to the <b>left</b> of x is 0.004.</p>
        <div class="controls">${UI.slider('ip', 'area to the left', 0.001, 0.999, 0.001, 0.004)}</div>
        <div id="invChart"></div><div class="fb" id="invWork"></div>
      </div>
      ${UI.trap(`<ul><li>N(μ, σ²): the second number is the <b>variance</b>. N(20, 45) means σ = √45.</li>
      <li>For a continuous variable, P(X = a) = 0, so P(X &lt; a) = P(X ≤ a).</li>
      <li>Symmetry: P(Z &lt; −a) = P(Z &gt; a) = 1 − Φ(a).</li></ul>`)}

      <h2>📝 Past paper questions</h2>
      ${UI.steps('Nov 2023 (21 batch) · Q1 a · 6 marks', `Y ~ N(μ, σ²). Given P(Y ≤ 48) = P(Y ≥ 57) = 0.0668, find P(50.1 ≤ Y ≤ 55.8).`, [
        ['Draw it: equal tails → the mean is in the middle', `The two tails have equal area, so μ is half-way between them: μ = (48 + 57)/2 = <b>52.5</b>`],
        ['Find z for a tail area of 0.0668', `Φ(z) = 0.0668 ⇒ z = <b>${f(S.normInv(0.0668), 3)}</b> (from the table: Φ(−1.5) = 0.0668)`],
        ['Solve for σ', `${F('48 − 52.5', 'σ')} = −1.5 ⇒ σ = <b>3</b>`],
        ['Standardise both limits', `z₁ = (50.1 − 52.5)/3 = −0.8, &nbsp; z₂ = (55.8 − 52.5)/3 = 1.1`],
        ['Area between', `Φ(1.1) − Φ(−0.8) = ${f(S.normCdf(1.1))} − ${f(S.normCdf(-0.8))} = <b>${f(S.normCdf(1.1) - S.normCdf(-0.8))}</b>`],
      ])}
      ${UI.steps('Nov 2023 (21 batch) · Q1 b · 12 marks', `Bulb lifetimes ~ N(5500, 120²). (i) P(lifetime > 5764)? (ii) the lifetime not reached by 0.4% of bulbs? (iii) 30 bulbs are chosen: P(exactly 2 exceed 5764)?`, [
        ['(i) Standardise', `z = (5764 − 5500)/120 = <b>2.2</b>. P(X > 5764) = 1 − Φ(2.2) = <b>${f(1 - S.normCdf(2.2))}</b>`],
        ['(ii) Work backwards', `Φ(z) = 0.004 ⇒ z = ${f(S.normInv(0.004), 3)}. x = 5500 + (${f(S.normInv(0.004), 3)})(120) = <b>${f(5500 + 120 * S.normInv(0.004), 1)} hours</b>`],
        ['(iii) This is a Binomial question in disguise!', `Each bulb is a "trial". Success = lifetime > 5764, with p = ${f(1 - S.normCdf(2.2))}. X ~ Bin(30, ${f(1 - S.normCdf(2.2))})`],
        ['Compute', `P(X = 2) = C(30,2) p² q²⁸ = 435 × ${f((1 - S.normCdf(2.2)) ** 2, 6)} × ${f(S.normCdf(2.2) ** 28)} = <b>${f(S.binomPmf(2, 30, 1 - S.normCdf(2.2)))}</b>`],
      ])}`,
    init(root) {
      const ev = UI.bindSeg(root, 'nev', () => upd());
      let v = {};
      const upd = () => {
        const { nmu: mu, nsd: sd, na: a, nb: b } = v, e = ev();
        const lo = mu - 4 * sd, hi = mu + 4 * sd, pdf = x => S.normPdf(x, mu, sd);
        const A = e === 'lt' ? -Infinity : a, B = e === 'gt' ? Infinity : b;
        const draw = (el, L, H, fn, aa, bb, lab) => {
          const p = Plot.make(el, { x: [L, H], y: [0, fn((L + H) / 2) * 1.15], h: 170, noY: true, margin: { l: 14, b: 36 }, xlab: lab });
          p.area(fn, Math.max(aa, L), Math.min(bb, H), { color: 'var(--s1)', opacity: 0.45 });
          p.curve(fn);
          return p;
        };
        const px = draw(root.querySelector('#nX'), lo, hi, pdf, A, B, 'X (original units)');
        px.hover(x => `x = <b>${f(x, 2)}</b> → z = <b>${f((x - mu) / sd, 2)}</b><br>P(X < x) = <b>${f(S.normCdf(x, mu, sd))}</b>`);
        const pz = draw(root.querySelector('#nZ'), -4, 4, x => S.normPdf(x), (A - mu) / sd, (B - mu) / sd, 'Z (standard units)');
        pz.hover(z => `z = <b>${f(z, 2)}</b><br>Φ(z) = <b>${f(S.normCdf(z))}</b>`);
        const za = (a - mu) / sd, zb = (b - mu) / sd;
        const prob = (e === 'gt' ? 1 : S.normCdf(zb)) - (e === 'lt' ? 0 : S.normCdf(za));
        root.querySelector('#nOut').innerHTML = `<div class="stat big"><div class="k">probability (shaded area)</div><div class="v">${f(prob)}</div></div>
          ${e !== 'lt' ? `<div class="stat"><div class="k">z for a</div><div class="v">${f(za, 3)}</div></div>` : ''}${e !== 'gt' ? `<div class="stat"><div class="k">z for b</div><div class="v">${f(zb, 3)}</div></div>` : ''}`;
        root.querySelector('#nWork').innerHTML = e === 'lt' ? `P(X < ${b}) = P(Z < ${F(`${b} − ${mu}`, sd)}) = Φ(${f(zb, 3)}) = <b>${f(prob)}</b>`
          : e === 'gt' ? `P(X > ${a}) = P(Z > ${F(`${a} − ${mu}`, sd)}) = 1 − Φ(${f(za, 3)}) = <b>${f(prob)}</b>`
            : `P(${a} < X < ${b}) = Φ(${f(zb, 3)}) − Φ(${f(za, 3)}) = ${f(S.normCdf(zb))} − ${f(S.normCdf(za))} = <b>${f(prob)}</b>`;
      };
      UI.bind(root, ['nmu', 'nsd', 'na', 'nb'], x => { v = x; upd(); });

      const emp = k => {
        const p = Plot.make(root.querySelector('#empChart'), { x: [-4, 4], y: [0, 0.46], h: 200, noY: true, margin: { l: 14 }, xticks: [-3, -2, -1, 0, 1, 2, 3], xfmt: t => t === 0 ? 'μ' : `μ${t > 0 ? '+' : '−'}${Math.abs(t)}σ` });
        p.area(S.normPdf, -k, k, { color: 'var(--s1)', opacity: 0.45 }); p.curve(S.normPdf);
        p.text(0, 0.18, `${f((S.normCdf(k) - S.normCdf(-k)) * 100, 2)}%`, { bold: true, size: 20, bg: true });
        p.text(-k - 0.3, 0.05, `${f(S.normCdf(-k) * 100, 2)}%`, { anchor: 'end', color: 'var(--text-secondary)', bg: true });
        p.text(k + 0.3, 0.05, `${f(S.normCdf(-k) * 100, 2)}%`, { anchor: 'start', color: 'var(--text-secondary)', bg: true });
      };
      UI.bindSeg(root, 'emp', k => emp(+k)); emp(1);

      UI.bind(root, ['ip'], v => {
        const z = S.normInv(v.ip);
        const p = Plot.make(root.querySelector('#invChart'), { x: [-4, 4], y: [0, 0.46], h: 180, noY: true, margin: { l: 14 } });
        p.area(S.normPdf, -4, z, { color: 'var(--s2)', opacity: 0.5 }); p.curve(S.normPdf);
        p.vline(z, { label: `z = ${f(z, 3)}`, color: 'var(--s2)', ly: 0.42 });
        root.querySelector('#invWork').innerHTML = `Φ(z) = ${v.ip} ⇒ z = <b>${f(z, 3)}</b> ⇒ x = μ + zσ (for N(5500, 120²): x = <b>${f(5500 + 120 * z, 1)}</b>)`;
      });
    }
  });

  /* ------------------------------------------------------------------ */
  /* 4. EXPONENTIAL + POISSON PROCESS                                     */
  /* ------------------------------------------------------------------ */
  App.add({
    id: 'expo', group: G, icon: '⏳', week: 'Wk 2', title: 'Exponential & memoryless',
    html: () => `
      <p class="lead">If events arrive at random (a <b>Poisson process</b>), then the <b>number</b> of events in an interval is Poisson(λ) and the <b>waiting time</b> between events is Exponential(λ). Same process, two ways of looking at it.</p>
      <div class="card">
        <h3>One random process, two distributions</h3>
        <div class="controls">${UI.slider('ppl', 'λ = events per unit time', 0.5, 6, 0.1, 2)}<div class="ctl" style="max-width:160px"><button class="btn primary" id="ppNew">New random process</button></div></div>
        <div id="ppLine"></div>
        <div class="grid2"><div><b>Counts per unit interval</b> → Poisson(λ)<div id="ppCount"></div></div><div><b>Gaps between events</b> → Exponential(λ)<div id="ppGap"></div></div></div>
        ${UI.legend([['var(--s1)', 'what happened (simulated)'], ['var(--s2)', 'theory', true]])}
      </div>
      <div class="fb">f(x) = λe<sup>−λx</sup>, x ≥ 0 &nbsp;|&nbsp; P(X > x) = e<sup>−λx</sup> &nbsp;|&nbsp; F(x) = 1 − e<sup>−λx</sup> &nbsp;|&nbsp; E(X) = ${F(1, 'λ')} &nbsp;|&nbsp; V(X) = ${F(1, 'λ²')}</div>
      ${UI.trap(`λ is a <b>rate</b>. If the question gives the <b>mean</b> waiting time ("on average 3 months"), then λ = 1/3 per month. Check your units!`)}
      <div class="card">
        <h3>Memoryless property: "the bulb doesn't remember its age"</h3>
        <div class="fb">P(X > s + t | X > s) = P(X > t)</div>
        <div class="controls">${UI.slider('ml', 'λ', 0.2, 2, 0.05, 0.5)}${UI.slider('ms', 's = time already survived', 0, 6, 0.1, 2)}${UI.slider('mt', 't = extra time', 0.1, 5, 0.1, 1.5)}</div>
        <div id="memChart"></div>
        ${UI.legend([['var(--s1)', 'original pdf (new item)', true], ['var(--s2)', 'pdf of the remaining life, given it survived to s (shifted back)', true]])}
        <div class="readout" id="memOut"></div>
        ${UI.idea(`Cut off the curve at s and stretch what is left so its area is 1 again. You get <b>exactly the same curve</b> (the orange dashes sit on the blue line). Having waited s hours tells you nothing about the extra wait. Only the Exponential (continuous) and Geometric (discrete) have this property.`)}
      </div>
      <h2>📝 Worked questions</h2>
      ${UI.steps('Jun 2022 (19 batch) · Q1 a · 8 marks', `Vaccination waiting time is exponential. Mean wait = 3 months (government) and 2 months (private). (i) A patient has already waited 1 month at the government hospital. Find P(waits more than 1 more month). (ii) A patient registers at both. Find P(waits at least 1 month).`, [
        ['Rates', `Government: λ₁ = 1/3 per month. Private: λ₂ = 1/2 per month.`],
        ['(i) Memoryless', `P(X > 1 + 1 | X > 1) = P(X > 1) = e<sup>−1/3</sup> = <b>${f(Math.exp(-1 / 3))}</b>`],
        ['(ii) "Registered in both" means they wait until the FIRST hospital calls', `They wait ≥ 1 month only if <b>both</b> waits exceed 1 month (independent): P = P(X₁ > 1)·P(X₂ > 1)`],
        ['Compute', `e<sup>−1/3</sup> · e<sup>−1/2</sup> = e<sup>−5/6</sup> = <b>${f(Math.exp(-5 / 6))}</b>`],
      ])}
      ${UI.steps('Jan 2023 (20 batch) · Q2 A(ii) · 5 marks', `A processor receives on average 150 interrupts per 10 ms (Poisson). Find the mean and variance of the time between interrupts.`, [
        ['Rate per ms', `λ = 150/10 = <b>15 per ms</b>`],
        ['Time between Poisson events is Exponential(λ)', `Mean = 1/λ = 1/15 = <b>${f(1 / 15)} ms</b>; Variance = 1/λ² = 1/225 = <b>${f(1 / 225)} ms²</b>`],
      ])}
      ${UI.steps('Tutorial · Industrial lamp', `Lamp life ~ Exp with λ = 1/3 (per 1000 h, so the mean life is 3000 h). Find (a) P(lasts no longer than its mean), (b) P(longer than its mean), (c) P(2000 to 3000 h), (d) P(lasts another 1000 h given it is still working at 2500 h).`, [
        ['(a)', `P(X ≤ 3) = 1 − e<sup>−1</sup> = <b>${f(1 - Math.exp(-1))}</b> (the same for ANY λ!)`],
        ['(b)', `P(X > 3) = e<sup>−1</sup> = <b>${f(Math.exp(-1))}</b>`],
        ['(c)', `P(2 ≤ X ≤ 3) = e<sup>−2/3</sup> − e<sup>−1</sup> = <b>${f(Math.exp(-2 / 3) - Math.exp(-1))}</b>`],
        ['(d) Memoryless', `P(X > 3.5 | X > 2.5) = P(X > 1) = e<sup>−1/3</sup> = <b>${f(Math.exp(-1 / 3))}</b>`],
      ])}`,
    init(root) {
      let lam = 2, T = 40;
      const run = () => {
        const ev = []; let t = S.rexp(lam); while (t < T) { ev.push(t); t += S.rexp(lam); }
        const p = Plot.make(root.querySelector('#ppLine'), { x: [0, 12], y: [0, 1], h: 80, noY: true, margin: { l: 14, b: 30, t: 6 }, xlab: 'time (first 12 units shown)' });
        for (let i = 0; i <= 12; i++) p.line(i, 0, i, 1, { color: 'var(--border)', under: true });
        ev.filter(x => x < 12).forEach(x => p.dot(x, 0.5, { r: 5, color: 'var(--s1)' }));
        // counts
        const counts = Array(T).fill(0); ev.forEach(x => counts[Math.floor(x)]++);
        const maxc = Math.max(...counts, Math.ceil(lam + 3 * Math.sqrt(lam)));
        const xs = S.range(0, maxc), freq = xs.map(x => counts.filter(c => c === x).length / T);
        const pc = Plot.make(root.querySelector('#ppCount'), { x: [-0.7, maxc + 0.7], y: [0, Math.max(...freq, S.poisPmf(Math.floor(lam), lam)) * 1.2], h: 200, xlab: 'events in one unit' });
        pc.bars(xs.map((x, i) => ({ x, y: freq[i] })), { color: 'var(--s1)', tip: d => `${d.x} events: simulated <b>${f(d.y, 3)}</b>, Poisson <b>${f(S.poisPmf(d.x, lam), 3)}</b>` });
        xs.forEach(x => pc.dot(x, S.poisPmf(x, lam), { color: 'var(--s2)', r: 4 }));
        const gaps = ev.slice(1).map((x, i) => x - ev[i]);
        const gmax = 4 / lam, nb = 16, w = gmax / nb, hist = Array(nb).fill(0);
        gaps.forEach(g => { if (g < gmax) hist[Math.floor(g / w)]++; });
        const pg = Plot.make(root.querySelector('#ppGap'), { x: [0, gmax], y: [0, lam * 1.25], h: 200, xlab: 'gap length' });
        pg.bars(hist.map((c, i) => ({ x: (i + 0.5) * w, y: c / (gaps.length * w) })), { width: w * 0.95, color: 'var(--s1)', tip: d => `gap ≈ ${f(d.x, 2)}: density <b>${f(d.y, 3)}</b>` });
        pg.curve(x => S.expPdf(x, lam), { color: 'var(--s2)', width: 2.5 });
      };
      UI.bind(root, ['ppl'], v => { lam = v.ppl; run(); });
      root.querySelector('#ppNew').onclick = run;

      UI.bind(root, ['ml', 'ms', 'mt'], v => {
        const { ml: l, ms: s, mt: t } = v, X = Math.max(8, s + t + 4 / l);
        const p = Plot.make(root.querySelector('#memChart'), { x: [0, X], y: [0, l * 1.15], h: 230, xlab: 'time x', ylab: 'density' });
        p.area(x => S.expPdf(x, l), s, X, { color: 'var(--s2)', opacity: 0.18 });
        p.area(x => S.expPdf(x, l), s + t, X, { color: 'var(--s2)', opacity: 0.4 });
        p.curve(x => S.expPdf(x, l));
        p.curve(x => S.expPdf(x + s, l) / Math.exp(-l * s), { color: 'var(--s2)', dash: '6 4', width: 2.5 });
        p.vline(s, { label: 's', color: 'var(--s2)' }); p.vline(s + t, { label: 's+t', color: 'var(--s2)' });
        p.hover(x => `x = <b>${f(x, 2)}</b><br>P(X > x) = e^(−λx) = <b>${f(Math.exp(-l * x))}</b>`);
        root.querySelector('#memOut').innerHTML = `<div class="stat"><div class="k">P(X > s)</div><div class="v">${f(Math.exp(-l * s))}</div></div>
          <div class="stat"><div class="k">P(X > s+t)</div><div class="v">${f(Math.exp(-l * (s + t)))}</div></div>
          <div class="stat big"><div class="k">P(X > s+t | X > s) = ratio</div><div class="v">${f(Math.exp(-l * t))}</div></div>
          <div class="stat big"><div class="k">P(X > t) = e^(−λt)</div><div class="v">${f(Math.exp(-l * t))}</div></div>`;
      });
    }
  });

  /* ------------------------------------------------------------------ */
  /* 5. GAMMA                                                             */
  /* ------------------------------------------------------------------ */
  App.add({
    id: 'gamma', group: G, icon: '📈', week: 'Wk 2', title: 'Gamma distribution',
    html: () => `
      <p class="lead">The Gamma is the <b>parent</b> of the Exponential and the Chi-square. α (shape) changes the <b>shape</b> and β (scale) <b>stretches</b> it.</p>
      <div class="fb">f(x; α, β) = ${F('1', 'β<sup>α</sup> Γ(α)')} x<sup>α−1</sup> e<sup>−x/β</sup>, x > 0 &nbsp;&nbsp;|&nbsp;&nbsp; E(X) = αβ &nbsp;&nbsp; V(X) = αβ²</div>
      <div class="card">
        <div class="controls">${UI.slider('ga', 'α (shape)', 0.5, 12, 0.5, 3)}${UI.slider('gb', 'β (scale)', 0.25, 5, 0.25, 2)}${UI.slider('gx', 'shade P(X > x), x =', 0, 40, 0.5, 12)}</div>
        <div class="btnrow"><button class="btn sm" id="gExp">Make it Exponential (α = 1)</button><button class="btn sm" id="gChi">Make it χ² with 6 df (α = 3, β = 2)</button></div>
        <div id="gChart"></div><div class="readout" id="gOut"></div>
      </div>
      <div class="grid2">
        ${UI.idea(`<b>Gamma → Exponential:</b> put α = 1, β = 1/λ: f(x) = λe<sup>−λx</sup>.<br><b>Gamma → Chi-square:</b> put α = k/2, β = 2. That is why χ² has mean = αβ = k and variance = αβ² = 2k.`)}
        <div class="card" style="margin:12px 0"><h3>The Gamma function Γ(α)</h3>
          <div class="f">Γ(α) = ∫₀<sup>∞</sup> y<sup>α−1</sup> e<sup>−y</sup> dy</div>
          <ul><li>Γ(α) = (α − 1) Γ(α − 1)</li><li>Γ(n) = (n − 1)! &nbsp; e.g. Γ(5) = 24</li><li>Γ(1) = 1, &nbsp; Γ(½) = √π</li></ul>
          <div class="controls">${UI.num('gfx', 'Try Γ(x) for x =', 3.5)}</div><div id="gfOut" class="f"></div></div>
      </div>
      ${UI.steps('Tutorial · Gamma', `Daily power consumption (millions of kWh) ~ Gamma(α = 3, β = 2). (i) Average consumption? (ii) The plant capacity is 12 million kWh. Find P(supply is inadequate).`, [
        ['(i) Mean', `E(X) = αβ = 3 × 2 = <b>6 million kWh</b>`],
        ['(ii) Inadequate means X > 12', `P(X > 12) = ∫₁₂<sup>∞</sup> ${F(1, '2³ Γ(3)')} x² e<sup>−x/2</sup> dx = ∫₁₂<sup>∞</sup> ${F('x²', 16)} e<sup>−x/2</sup> dx`],
        ['Integrate by parts (or use the Poisson link for integer α)', `For integer α: P(X > x) = Σ<sub>j=0</sub><sup>α−1</sup> e<sup>−x/β</sup>(x/β)<sup>j</sup>/j! = e<sup>−6</sup>(1 + 6 + 18) = 25e<sup>−6</sup>`],
        ['Answer', `= <b>${f(1 - S.gammaCdf(12, 3, 2))}</b>`],
      ])}`,
    init(root) {
      const read = UI.bind(root, ['ga', 'gb', 'gx'], v => {
        const { ga: a, gb: b, gx: x } = v, X = Math.max(10, a * b + 5 * Math.sqrt(a) * b);
        const pdf = t => S.gammaPdf(t, a, b);
        let ym = 0; for (let i = 1; i <= 200; i++) ym = Math.max(ym, pdf(X * i / 200)); ym = Math.min(ym, 2);
        const p = Plot.make(root.querySelector('#gChart'), { x: [0, X], y: [0, ym * 1.15], h: 240, xlab: 'x', ylab: 'density' });
        p.area(pdf, x, X, { color: 'var(--s2)', opacity: 0.4 }); p.curve(pdf);
        p.vline(a * b, { label: `mean αβ = ${f(a * b, 2)}`, ly: ym * 1.12 });
        p.hover(t => `x = <b>${f(t, 2)}</b><br>f(x) = <b>${f(pdf(t))}</b><br>P(X > x) = <b>${f(1 - S.gammaCdf(t, a, b))}</b>`);
        root.querySelector('#gOut').innerHTML = `<div class="stat"><div class="k">mean αβ</div><div class="v">${f(a * b)}</div></div><div class="stat"><div class="k">variance αβ²</div><div class="v">${f(a * b * b)}</div></div><div class="stat big"><div class="k">P(X > ${x})</div><div class="v">${f(1 - S.gammaCdf(x, a, b))}</div></div>`;
      });
      const set = (a, b) => { root.querySelector('#ga').value = a; root.querySelector('#gb').value = b; root.querySelector('#ga').dispatchEvent(new Event('input')); };
      root.querySelector('#gExp').onclick = () => set(1, 2); root.querySelector('#gChi').onclick = () => set(3, 2);
      UI.bind(root, ['gfx'], v => { root.querySelector('#gfOut').innerHTML = `Γ(${v.gfx}) = <b>${f(S.gamma(v.gfx), 5)}</b>`; });
    }
  });

  /* ------------------------------------------------------------------ */
  /* 6. NORMAL APPROXIMATION                                              */
  /* ------------------------------------------------------------------ */
  App.add({
    id: 'approx', group: G, icon: '🧱', week: 'Wk 2–3', title: 'Normal approximation & continuity correction',
    html: () => `
      <p class="lead">When n is large, Binomial bars look like a bell curve, so we use N(np, npq) instead. The bars are <b>blocks of width 1</b> centred on whole numbers. The bar for "x = 30" covers 29.5 to 30.5, and that is why we add or subtract <b>0.5</b>.</p>
      <div class="card">
        <div class="controls">${UI.seg('apd', [['b', 'Binomial'], ['p', 'Poisson']], 'b')}${UI.slider('an', 'n', 5, 400, 1, 48)}${UI.slider('ap', 'p', 0.02, 0.98, 0.01, 0.5)}<div id="apLamWrap" style="display:none">${UI.slider('alam', 'λ', 1, 60, 0.5, 14)}</div></div>
        <div class="controls">${UI.seg('aev', [['ge', 'P(X ≥ k)'], ['le', 'P(X ≤ k)'], ['eq', 'P(X = k)'], ['gt', 'P(X > k)'], ['lt', 'P(X < k)']], 'ge')}${UI.slider('ak', 'k', 0, 400, 1, 30)}</div>
        <div id="apChart"></div>
        ${UI.legend([['var(--s1)', 'exact bars in the event'], ['var(--s2)', 'normal curve area used', false]])}
        <div class="readout" id="apOut"></div><div class="fb" id="apWork"></div>
        <div id="apRule"></div>
      </div>
      <div class="card"><h3>Continuity correction table (must know)</h3>
        <table class="t"><tr><th>Discrete</th><th>Use with Normal</th><th>Why</th></tr>
        <tr><td>P(X = a)</td><td>P(a − 0.5 &lt; X &lt; a + 0.5)</td><td>the whole bar a</td></tr>
        <tr><td>P(X ≥ a)</td><td>P(X &gt; a − 0.5)</td><td>include bar a</td></tr>
        <tr><td>P(X &gt; a)</td><td>P(X &gt; a + 0.5)</td><td>exclude bar a</td></tr>
        <tr><td>P(X ≤ a)</td><td>P(X &lt; a + 0.5)</td><td>include bar a</td></tr>
        <tr><td>P(X &lt; a)</td><td>P(X &lt; a − 0.5)</td><td>exclude bar a</td></tr></table>
        <p>Conditions: Binomial needs <b>np ≥ 5 and nq ≥ 5</b> (μ = np, σ = √(npq)). Poisson needs <b>λ ≳ 10</b> (μ = σ² = λ).</p></div>

      <h2>📝 Past paper questions</h2>
      ${UI.steps('Jun 2022 (19 batch) · Q1 b · 17 marks', `One die gives a six with probability 0.25 (biased); the other is fair. One die is picked at random and thrown 12 times. If there are 3 or more sixes he says "biased", otherwise "fair". (i) P(says biased | fair)? (ii) P(says fair | biased)? (iii) P(his assertion is wrong)? (iv) Instead he throws 360 times and says biased if there are k or more sixes. Use the normal approximation to find k so that P(says biased | fair) = 0.75.`, [
        ['(i) Fair die: X ~ Bin(12, 1/6)', `P(X ≥ 3) = 1 − P(X ≤ 2) = 1 − [${[0, 1, 2].map(x => f(S.binomPmf(x, 12, 1 / 6))).join(' + ')}] = <b>${f(1 - S.binomCdf(2, 12, 1 / 6))}</b>  (this is like a Type I error)`],
        ['(ii) Biased die: X ~ Bin(12, 0.25)', `P(X ≤ 2) = ${[0, 1, 2].map(x => f(S.binomPmf(x, 12, 0.25))).join(' + ')} = <b>${f(S.binomCdf(2, 12, 0.25))}</b>  (like a Type II error)`],
        ['(iii) Law of total probability', `Each die is chosen with probability ½: P(wrong) = ½(${f(1 - S.binomCdf(2, 12, 1 / 6))}) + ½(${f(S.binomCdf(2, 12, 0.25))}) = <b>${f(0.5 * (1 - S.binomCdf(2, 12, 1 / 6)) + 0.5 * S.binomCdf(2, 12, 0.25))}</b>`],
        ['(iv) Normal approximation for the fair die, n = 360', `μ = np = 60, σ = √(360·⅙·⅚) = √50 = ${f(Math.sqrt(50))}`],
        ['Continuity correction', `P(X ≥ k) ≈ P(Y > k − 0.5) = 0.75 ⇒ ${F('k − 0.5 − 60', '7.071')} = z<sub>0.25</sub> = −0.6745`],
        ['Solve', `k = 60.5 − 0.6745 × 7.071 = ${f(60.5 - 0.6745 * Math.sqrt(50), 2)} ⇒ <b>k ≈ 56</b>`],
      ])}
      ${UI.steps('Nov 2024 (22 batch) · Q1 b, d, e · 17 marks', `1000 seeds are planted. In the 1st week 496 grew successfully. (b) Find P(more than 500 healthy seeds in a lot of 1000). (d) 14 plants died on day 6 or 7; find P(10 to 20 plants die). (e) Find P(the proportion of healthy seeds > 0.75).`, [
        ['(b) Binomial with p̂ = 0.496', `X ~ Bin(1000, 0.496) ≈ N(496, 1000×0.496×0.504) ⇒ σ = ${f(Math.sqrt(1000 * 0.496 * 0.504), 3)}`],
        ['Continuity correction: X > 500 ⇒ X ≥ 501 ⇒ Y > 500.5', `P(Z > ${F('500.5 − 496', f(Math.sqrt(1000 * 0.496 * 0.504), 3))}) = P(Z > ${f(4.5 / Math.sqrt(1000 * 0.496 * 0.504), 3)}) = <b>${f(1 - S.normCdf(4.5 / Math.sqrt(1000 * 0.496 * 0.504)))}</b>`],
        ['(d) Deaths are rare → Poisson(λ = 14), approximated by N(14, 14)', `P(10 ≤ X ≤ 20) ≈ P(9.5 < Y < 20.5) = Φ(${f(6.5 / Math.sqrt(14), 3)}) − Φ(${f(-4.5 / Math.sqrt(14), 3)}) = <b>${f(S.normCdf(6.5 / Math.sqrt(14)) - S.normCdf(-4.5 / Math.sqrt(14)))}</b> (exact Poisson: ${f(S.poisCdf(20, 14) - S.poisCdf(9, 14))})`],
        ['(e) Sampling distribution of a proportion', `p̂ ~ N(0.496, 0.496×0.504/1000), SE = ${f(Math.sqrt(0.496 * 0.504 / 1000))}. z = (0.75 − 0.496)/${f(Math.sqrt(0.496 * 0.504 / 1000))} = ${f((0.75 - 0.496) / Math.sqrt(0.496 * 0.504 / 1000), 1)} ⇒ P ≈ <b>0</b>`],
        ['(a, c) Theory marks', `Poisson variables: the number of seeds that fail to grow in a lot; the number of plants that die on day 6–7. (c ii) Better estimate of λ: repeat the experiment on many lots and use the average count.`],
      ])}
      ${UI.steps('Tutorial · Jane vs Ama', `A true/false exam has 48 questions. Jane answers each correctly with probability 3/4; Ama guesses (p = ½). The pass mark is 30. Compare their chances of passing.`, [
        ['Jane: Bin(48, 0.75) ≈ N(36, 9)', `P(X ≥ 30) ≈ P(Z > (29.5 − 36)/3) = P(Z > −2.167) = <b>${f(1 - S.normCdf(-6.5 / 3))}</b> (exact ${f(1 - S.binomCdf(29, 48, 0.75))})`],
        ['Ama: Bin(48, 0.5) ≈ N(24, 12)', `P(X ≥ 30) ≈ P(Z > (29.5 − 24)/√12) = P(Z > ${f(5.5 / Math.sqrt(12), 3)}) = <b>${f(1 - S.normCdf(5.5 / Math.sqrt(12)))}</b>`],
      ])}`,
    init(root) {
      let mode = 'b', v = {};
      const evf = UI.bindSeg(root, 'aev', () => upd());
      UI.bindSeg(root, 'apd', m => { mode = m; ['an', 'ap'].forEach(id => root.querySelector('#' + id).closest('.ctl').style.display = m === 'b' ? '' : 'none'); root.querySelector('#apLamWrap').style.display = m === 'p' ? '' : 'none'; upd(); });
      const upd = () => {
        const n = v.an, p = v.ap, lam = v.alam;
        const mu = mode === 'b' ? n * p : lam, sd = Math.sqrt(mode === 'b' ? n * p * (1 - p) : lam);
        const pmf = x => mode === 'b' ? S.binomPmf(x, n, p) : S.poisPmf(x, lam);
        const lo = Math.max(0, Math.floor(mu - 4.2 * sd)), hi = mode === 'b' ? Math.min(n, Math.ceil(mu + 4.2 * sd)) : Math.ceil(mu + 4.2 * sd);
        const kEl = root.querySelector('#ak'); kEl.min = lo; kEl.max = hi; if (+kEl.value > hi || +kEl.value < lo) kEl.value = Math.round(mu); root.querySelector('#ak_o').textContent = kEl.value;
        const k = +kEl.value, e = evf();
        const inEv = x => ({ ge: x >= k, le: x <= k, eq: x === k, gt: x > k, lt: x < k })[e];
        const [A, B] = ({ ge: [k - 0.5, Infinity], le: [-Infinity, k + 0.5], eq: [k - 0.5, k + 0.5], gt: [k + 0.5, Infinity], lt: [-Infinity, k - 0.5] })[e];
        const xs = S.range(lo, hi), ps = xs.map(pmf), ym = Math.max(...ps, S.normPdf(mu, mu, sd)) * 1.15;
        const pl = Plot.make(root.querySelector('#apChart'), { x: [lo - 1, hi + 1], y: [0, ym], h: 250, xlab: 'x', ylab: 'probability' });
        pl.bars(xs.map((x, i) => ({ x, y: ps[i], color: inEv(x) ? 'var(--s1)' : 'var(--text-muted)', opacity: inEv(x) ? 0.85 : 0.3 })), { width: 1, tip: b => `P(X = ${b.x}) = <b>${f(b.y)}</b><br>bar covers ${b.x - 0.5} to ${b.x + 0.5}` });
        pl.area(x => S.normPdf(x, mu, sd), Math.max(A, lo - 1), Math.min(B, hi + 1), { color: 'var(--s2)', opacity: 0.3 });
        pl.curve(x => S.normPdf(x, mu, sd), { color: 'var(--s2)', width: 2.5, top: true });
        if (isFinite(A)) pl.vline(A, { color: 'var(--s2)', label: String(A), ly: ym, bold: true });
        if (isFinite(B)) pl.vline(B, { color: 'var(--s2)', label: String(B), ly: ym, bold: true });
        const exact = xs.reduce((s, x, i) => s + (inEv(x) ? ps[i] : 0), 0) + (e === 'ge' || e === 'gt' ? (mode === 'p' ? 1 - S.poisCdf(hi, lam) : 0) : 0);
        const approx = (isFinite(B) ? S.normCdf(B, mu, sd) : 1) - (isFinite(A) ? S.normCdf(A, mu, sd) : 0);
        const kk = e === 'ge' || e === 'gt' ? k : k; const noCC = ({ ge: 1 - S.normCdf(k, mu, sd), gt: 1 - S.normCdf(k, mu, sd), le: S.normCdf(k, mu, sd), lt: S.normCdf(k, mu, sd), eq: 0 })[e];
        root.querySelector('#apOut').innerHTML = `<div class="stat"><div class="k">exact ${mode === 'b' ? 'binomial' : 'Poisson'}</div><div class="v">${f(exact)}</div></div>
          <div class="stat big"><div class="k">normal with ±0.5</div><div class="v">${f(approx)}</div></div>
          <div class="stat"><div class="k">normal WITHOUT correction</div><div class="v">${f(noCC)}</div></div>
          <div class="stat"><div class="k">μ, σ</div><div class="v">${f(mu, 2)}, ${f(sd, 3)}</div></div>`;
        const lab = ({ ge: `P(X ≥ ${k}) ≈ P(Y > ${k - 0.5})`, le: `P(X ≤ ${k}) ≈ P(Y < ${k + 0.5})`, eq: `P(X = ${k}) ≈ P(${k - 0.5} < Y < ${k + 0.5})`, gt: `P(X > ${k}) ≈ P(Y > ${k + 0.5})`, lt: `P(X < ${k}) ≈ P(Y < ${k - 0.5})` })[e];
        root.querySelector('#apWork').innerHTML = `${lab} = ${isFinite(A) && isFinite(B) ? `Φ(${f((B - mu) / sd, 3)}) − Φ(${f((A - mu) / sd, 3)})` : isFinite(A) ? `1 − Φ(${F(`${A} − ${f(mu, 2)}`, f(sd, 3))}) = 1 − Φ(${f((A - mu) / sd, 3)})` : `Φ(${F(`${B} − ${f(mu, 2)}`, f(sd, 3))}) = Φ(${f((B - mu) / sd, 3)})`} = <b>${f(approx)}</b>`;
        const ok = mode === 'b' ? (n * p >= 5 && n * (1 - p) >= 5) : lam >= 10;
        root.querySelector('#apRule').innerHTML = mode === 'b' ? `<p>${ok ? '✅ <b>OK to approximate</b>' : '⚠️ <b>Approximation is poor</b>'}: np = ${f(n * p, 2)}, nq = ${f(n * (1 - p), 2)} (both need ≥ 5)</p>` : `<p>${ok ? '✅ <b>OK</b>' : '⚠️ <b>λ is small, so the approximation is poor</b>'}: λ = ${lam} (want ≳ 10)</p>`;
      };
      UI.bind(root, ['an', 'ap', 'alam', 'ak'], x => { v = x; upd(); });
    }
  });
})();
