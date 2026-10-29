/* ============================================================
   S — a tiny statistics engine (pdfs, cdfs, inverse cdfs, helpers)
   Everything the interactive pages need, no external libraries.
   ============================================================ */
(function (root) {
  const S = {};

  // ---------- basic helpers ----------
  S.sum = a => a.reduce((s, v) => s + v, 0);
  S.mean = a => S.sum(a) / a.length;
  S.variance = a => { const m = S.mean(a); return S.sum(a.map(v => (v - m) ** 2)) / (a.length - 1); };
  S.sd = a => Math.sqrt(S.variance(a));
  S.range = (a, b, step = 1) => { const r = []; for (let x = a; x <= b + 1e-9; x += step) r.push(x); return r; };
  S.round = (x, d = 4) => { if (!isFinite(x)) return x; const f = 10 ** d; return Math.round(x * f) / f; };
  S.fmt = (x, d = 4) => {
    if (x === Infinity) return '∞';
    if (!isFinite(x)) return '—';
    if (Math.abs(x) > 0 && Math.abs(x) < 10 ** -d) return x.toExponential(2);
    return (+x.toFixed(d)).toString();
  };

  // ---------- gamma & combinatorics ----------
  const LG = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61503916999185,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  S.lgamma = function lgamma(z) {
    if (z < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * z))) - lgamma(1 - z);
    z -= 1; let x = 0.99999999999980993;
    for (let i = 0; i < 8; i++) x += LG[i] / (z + i + 1);
    const t = z + 7.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  };
  S.gamma = z => {
    if (Number.isInteger(z) && z > 0 && z < 171) { let f = 1; for (let i = 2; i < z; i++) f *= i; return f; }
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * S.gamma(1 - z));
    return Math.exp(S.lgamma(z));
  };
  S.lfact = n => S.lgamma(n + 1);
  S.lchoose = (n, k) => (k < 0 || k > n) ? -Infinity : S.lfact(n) - S.lfact(k) - S.lfact(n - k);
  S.choose = (n, k) => {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k); let r = 1;
    for (let i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r) === r || r > 1e15 ? r : Math.round(r);
  };
  S.fact = n => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };

  // ---------- incomplete gamma (regularised lower P) ----------
  S.gammaP = function (a, x) {
    if (x <= 0) return 0;
    if (x < a + 1) {
      let sum = 1 / a, del = sum, ap = a;
      for (let n = 0; n < 500; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-15) break; }
      return sum * Math.exp(-x + a * Math.log(x) - S.lgamma(a));
    }
    let b = x + 1 - a, c = 1 / 1e-300, d = 1 / b, h = d;
    for (let i = 1; i < 500; i++) {
      const an = -i * (i - a); b += 2;
      d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - S.lgamma(a)) * h;
  };

  // ---------- incomplete beta (regularised I_x(a,b)) ----------
  function betacf(a, b, x) {
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap; if (Math.abs(d) < 1e-300) d = 1e-300; d = 1 / d; let h = d;
    for (let m = 1; m <= 500; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break;
    }
    return h;
  }
  S.betaI = function (x, a, b) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    const bt = Math.exp(S.lgamma(a + b) - S.lgamma(a) - S.lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
    return 1 - bt * betacf(b, a, 1 - x) / b;
  };

  // ---------- generic inverse by bisection ----------
  function invert(cdf, p, lo, hi) {
    while (cdf(hi) < p) hi *= 2;
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (cdf(mid) < p) lo = mid; else hi = mid; if (hi - lo < 1e-12) break; }
    return (lo + hi) / 2;
  }

  // ---------- Normal ----------
  S.normPdf = (x, mu = 0, sd = 1) => Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
  S.normCdf = (x, mu = 0, sd = 1) => {
    const z = (x - mu) / sd;
    if (z < -40) return 0; if (z > 40) return 1;
    // via incomplete gamma: Phi(z) = 0.5*(1+sign*P(1/2, z^2/2))
    const p = S.gammaP(0.5, z * z / 2);
    return z >= 0 ? 0.5 * (1 + p) : 0.5 * (1 - p);
  };
  S.normInv = (p, mu = 0, sd = 1) => {
    if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
    // Acklam approximation + one Newton refinement
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    const pl = 0.02425; let q, r, x;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    else if (p <= 1 - pl) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    const e = S.normCdf(x) - p; x = x - e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    return mu + sd * x;
  };

  // ---------- Student t ----------
  S.tPdf = (t, v) => Math.exp(S.lgamma((v + 1) / 2) - S.lgamma(v / 2)) / Math.sqrt(v * Math.PI) * (1 + t * t / v) ** (-(v + 1) / 2);
  S.tCdf = (t, v) => { const x = v / (v + t * t); const tail = 0.5 * S.betaI(x, v / 2, 0.5); return t >= 0 ? 1 - tail : tail; };
  S.tInv = (p, v) => p === 0.5 ? 0 : (p < 0.5 ? -S.tInv(1 - p, v) : invert(t => S.tCdf(t, v), p, 0, 10));
  /** upper-tail critical value t_{alpha, v}: P(T > t) = alpha */
  S.tCrit = (alpha, v) => S.tInv(1 - alpha, v);

  // ---------- Chi-square ----------
  S.chiPdf = (x, k) => x <= 0 ? (k === 2 ? 0.5 : (k < 2 ? Infinity : 0)) : Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.log(2) - S.lgamma(k / 2));
  S.chiCdf = (x, k) => x <= 0 ? 0 : S.gammaP(k / 2, x / 2);
  S.chiInv = (p, k) => invert(x => S.chiCdf(x, k), p, 0, Math.max(10, 3 * k));
  /** upper-tail: P(X > c) = alpha (this is what the tables print) */
  S.chiCrit = (alpha, k) => S.chiInv(1 - alpha, k);

  // ---------- F ----------
  S.fPdf = (x, d1, d2) => x <= 0 ? 0 : Math.exp(0.5 * (d1 * Math.log(d1 * x) + d2 * Math.log(d2) - (d1 + d2) * Math.log(d1 * x + d2)) - Math.log(x) - (S.lgamma(d1 / 2) + S.lgamma(d2 / 2) - S.lgamma((d1 + d2) / 2)));
  S.fCdf = (x, d1, d2) => x <= 0 ? 0 : S.betaI(d1 * x / (d1 * x + d2), d1 / 2, d2 / 2);
  S.fInv = (p, d1, d2) => invert(x => S.fCdf(x, d1, d2), p, 0, 10);
  S.fCrit = (alpha, d1, d2) => S.fInv(1 - alpha, d1, d2);

  // ---------- Exponential & Gamma ----------
  S.expPdf = (x, lam) => x < 0 ? 0 : lam * Math.exp(-lam * x);
  S.expCdf = (x, lam) => x < 0 ? 0 : 1 - Math.exp(-lam * x);
  S.gammaPdf = (x, a, b) => x <= 0 ? 0 : Math.exp((a - 1) * Math.log(x) - x / b - S.lgamma(a) - a * Math.log(b));
  S.gammaCdf = (x, a, b) => x <= 0 ? 0 : S.gammaP(a, x / b);

  // ---------- Discrete pmfs ----------
  S.binomPmf = (x, n, p) => (x < 0 || x > n) ? 0 : Math.exp(S.lchoose(n, x) + (x ? x * Math.log(p) : 0) + ((n - x) ? (n - x) * Math.log(1 - p) : 0));
  S.binomCdf = (x, n, p) => { let s = 0; for (let k = 0; k <= Math.min(x, n); k++) s += S.binomPmf(k, n, p); return Math.min(1, s); };
  S.poisPmf = (x, lam) => x < 0 ? 0 : Math.exp(-lam + x * Math.log(lam) - S.lfact(x));
  S.poisCdf = (x, lam) => { let s = 0; for (let k = 0; k <= x; k++) s += S.poisPmf(k, lam); return Math.min(1, s); };
  S.geomPmf = (x, p) => x < 1 ? 0 : p * (1 - p) ** (x - 1);
  S.nbPmf = (x, r, p) => x < r ? 0 : Math.exp(S.lchoose(x - 1, r - 1) + r * Math.log(p) + (x - r) * Math.log(1 - p));
  S.hyperPmf = (x, N, n, k) => {
    if (x < Math.max(0, n - (N - k)) || x > Math.min(n, k)) return 0;
    return Math.exp(S.lchoose(k, x) + S.lchoose(N - k, n - x) - S.lchoose(N, n));
  };

  // ---------- random generation ----------
  S.randn = () => { let u = 0, v = 0; while (u === 0) u = Math.random(); while (v === 0) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  S.rexp = lam => -Math.log(1 - Math.random()) / lam;

  // ---------- regression helper ----------
  S.regress = (xs, ys) => {
    const n = xs.length, mx = S.mean(xs), my = S.mean(ys);
    let Sxx = 0, Syy = 0, Sxy = 0;
    for (let i = 0; i < n; i++) { Sxx += (xs[i] - mx) ** 2; Syy += (ys[i] - my) ** 2; Sxy += (xs[i] - mx) * (ys[i] - my); }
    const b = Sxy / Sxx, a = my - b * mx;
    const SST = Syy, SSR = b * Sxy, SSE = SST - SSR;
    const MSE = SSE / (n - 2), r = Sxy / Math.sqrt(Sxx * Syy);
    const seB = Math.sqrt(MSE / Sxx);
    return { n, mx, my, Sxx, Syy, Sxy, b, a, SST, SSR, SSE, MSE, r, R2: SSR / SST, seB,
      sumX: S.sum(xs), sumY: S.sum(ys), sumXY: S.sum(xs.map((x, i) => x * ys[i])), sumX2: S.sum(xs.map(x => x * x)), sumY2: S.sum(ys.map(y => y * y)) };
  };

  root.S = S;
  if (typeof module !== 'undefined') module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
