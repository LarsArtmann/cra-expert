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
    en: {
      done: "CRA fully applicable since 11 Dec 2027",
      locale: "en-US",
      copied: "Copied",
    },
    de: {
      done: "CRA seit 11. Dezember 2027 vollständig anwendbar",
      locale: "de-DE",
      copied: "Kopiert",
    },
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

  var navLinks = document.querySelectorAll('.topbar nav a[href^="#"]');
  if (navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    Array.prototype.forEach.call(navLinks, function (a) {
      byId[a.getAttribute("href").slice(1)] = a;
    });
    var visible = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var link = byId[entry.target.id];
          if (!link) return;
          Array.prototype.forEach.call(navLinks, function (a) {
            a.removeAttribute("aria-current");
          });
          link.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    Array.prototype.forEach.call(
      document.querySelectorAll("section[id], footer[id]"),
      function (section) {
        if (byId[section.id]) visible.observe(section);
      }
    );
  }

  var copyBtn = document.querySelector(".copy-mail");
  if (copyBtn) {
    copyBtn.hidden = false;
    copyBtn.addEventListener("click", function () {
      var text = copyBtn.dataset.copy || "";
      var original = copyBtn.textContent;
      function done() {
        copyBtn.textContent = L10N[lang].copied;
        setTimeout(function () {
          copyBtn.textContent = original;
        }, 1600);
      }
      function fallback() {
        var area = document.createElement("textarea");
        area.value = text;
        document.body.appendChild(area);
        area.select();
        try {
          document.execCommand("copy");
          done();
        } catch (e) {
          /* copy unavailable; address remains visible and selectable */
        }
        document.body.removeChild(area);
      }
      if (navigator.clipboard && navigator.clipboard.writeText)
        navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    });
  }
})();
