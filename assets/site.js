// Progressive enhancement only: the page is accurate without JS.
// Timeline marker + countdown from the statute's own dates.
// __craTimeline.compute(nowMs) is pure and exposed for the DOM-QA
// harness (scripts/qa.js), which fake-clock tests every statutory
// state: pre, running (incl. day 0), and fully applicable.
(function () {
  var START = Date.UTC(2024, 11, 10); // in force
  var END = Date.UTC(2027, 11, 11); // full application
  var lang = document.documentElement.lang === "de" ? "de" : "en";
  var L10N = {
    en: { done: "CRA fully applicable since 11 Dec 2027", locale: "en-US" },
    de: { done: "CRA seit 11. Dezember 2027 vollständig anwendbar", locale: "de-DE" },
  };

  function compute(nowMs) {
    if (nowMs < START)
      return { state: "pre", pct: 0, days: Math.round((END - nowMs) / 86400000) };
    if (nowMs >= END) return { state: "applicable", pct: 100, days: 0 };
    var pct = ((nowMs - START) / (END - START)) * 100;
    return { state: "running", pct: pct, days: Math.round((END - nowMs) / 86400000) };
  }
  window.__craTimeline = { compute: compute };

  var today = new Date();
  var now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  var t = compute(now);

  if (t.state === "applicable") {
    var count = document.querySelector(".tl-count");
    if (count) {
      count.classList.add("done");
      count.textContent = L10N[lang].done;
    }
    var dot = document.getElementById("tl-today");
    if (dot) dot.hidden = true;
    var elapsedDone = document.querySelector(".tl-elapsed");
    if (elapsedDone) elapsedDone.style.width = "100%";
    return;
  }
  if (t.state === "pre") return;

  var marker = document.getElementById("tl-today");
  if (marker) {
    marker.style.insetInlineStart = t.pct.toFixed(2) + "%";
    var tag = marker.querySelector(".tag");
    if (tag && t.pct > 78) tag.hidden = true; // keep clear of the deadline label
  }
  var elapsed = document.querySelector(".tl-elapsed");
  if (elapsed) elapsed.style.width = t.pct.toFixed(2) + "%";
  var days = document.getElementById("tl-days");
  if (days) days.textContent = t.days.toLocaleString(L10N[lang].locale);
})();
