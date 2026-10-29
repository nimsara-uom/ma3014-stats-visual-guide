# MA3014 Applied Statistics: Visual Exam Guide

An interactive, offline study site for MA3014 Applied Statistics (University of Moratuwa). Every theory point from the Week 1–8 tutorials is turned into something you can play with, and every question from the 2022–2025 past papers is worked step by step.

## Use it

Open `index.html` in any modern browser. There is nothing to install and it needs no internet.

## What's inside

- **Distributions:** discrete (Binomial, Poisson, Geometric, Negative Binomial, Hypergeometric), Normal, Exponential, Gamma, normal approximation, and a family tree linking them.
- **Sampling & estimation:** CLT simulator, t / χ² / F with a table-lookup tool, confidence intervals.
- **Hypothesis testing:** Type I/II errors and power, p-values, a test lab with past-paper presets, variance tests.
- **χ² tests:** independence and goodness of fit.
- **Regression:** correlation, least squares with draggable points, ANOVA.
- **Extras:** E(X)/V(X), mean vs median, Latin square, sampling techniques.
- **Revision:** past-paper index, 32-question quiz, printable formula sheet.

Each page has sliders and simulations, "Big idea" and "Exam trap" boxes, and worked solutions you reveal one step at a time. Progress is saved in your browser, and there is a dark mode.

## Files

```
index.html        page shell
css/style.css     styles (light and dark themes)
js/stats.js       statistics engine (pdf/cdf/inverse for Z, t, χ², F, etc.)
js/plot.js        small SVG chart helper
js/app.js         router, navigation, shared widgets
js/t_*.js         the topic pages
```

Plain HTML, CSS and JavaScript with no build step and no dependencies.
