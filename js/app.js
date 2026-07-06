/* LA GHISA — motore della palestra */
(function () {
  "use strict";

  const MODULES = window.MODULES;
  const app = document.getElementById("app");

  /* ---------- progressi ---------- */
  const STORE_KEY = "la-ghisa-progress-v1";
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) { localStorage.setItem(STORE_KEY, JSON.stringify(p)); }
  let progress = loadProgress();

  function totalKg() {
    let kg = 0;
    for (const m of MODULES) for (const item of m.items) {
      if (item.type === "exercise" && progress[item.id]) kg += item.kg;
    }
    return kg;
  }
  function maxKg() {
    let kg = 0;
    for (const m of MODULES) for (const item of m.items) {
      if (item.type === "exercise") kg += item.kg;
    }
    return kg;
  }
  function moduleStats(m) {
    const exs = m.items.filter(i => i.type === "exercise");
    const done = exs.filter(i => progress[i.id]).length;
    return { done, total: exs.length };
  }
  function levelName(kg) {
    if (kg === 0) return "Nuovo iscritto";
    if (kg < 150) return "Prime serie";
    if (kg < 350) return "Ci stai prendendo gusto";
    if (kg < 600) return "Sollevatore solido";
    if (kg < 850) return "Veterano della sala";
    return "Bestia da palestra";
  }

  /* ---------- util ---------- */
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function discHtml(kg, big) {
    return '<span class="disc p' + kg + (big ? " big" : "") + '" title="' + kg + ' kg"><span>' + kg + "</span></span>";
  }

  /* ---------- bilanciere SVG ---------- */
  function barbellSvg(kg) {
    // dischi per lato, dal piu' pesante
    const perSide = [];
    let side = kg / 2;
    for (const p of [25, 20, 15, 10, 5, 2.5]) {
      while (side >= p && perSide.length < 9) { perSide.push(p); side -= p; }
    }
    const colors = { 25: "#C8102E", 20: "#0057B7", 15: "#FFB81C", 10: "#009A44", 5: "#F8F6F0", 2.5: "#3A3A42" };
    const heights = { 25: 150, 20: 138, 15: 118, 10: 98, 5: 78, 2.5: 60 };
    const W = 1000, H = 190, cy = H / 2;
    let x = 150, discs = "";
    for (const p of perSide) {
      const h = heights[p];
      discs += '<rect x="' + x + '" y="' + (cy - h / 2) + '" width="24" height="' + h +
        '" rx="6" fill="' + colors[p] + '" stroke="#1B1B1E" stroke-width="4"/>';
      x += 30;
    }
    let discsR = "", xr = W - 150 - 24;
    for (const p of perSide) {
      const h = heights[p];
      discsR += '<rect x="' + xr + '" y="' + (cy - h / 2) + '" width="24" height="' + h +
        '" rx="6" fill="' + colors[p] + '" stroke="#1B1B1E" stroke-width="4"/>';
      xr -= 30;
    }
    return '<svg class="barbell-svg" viewBox="0 0 ' + W + " " + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bilanciere caricato con ' + kg + ' chili">' +
      '<rect x="20" y="' + (cy - 7) + '" width="' + (W - 40) + '" height="14" rx="7" fill="#4A4A52" stroke="#1B1B1E" stroke-width="4"/>' +
      '<rect x="120" y="' + (cy - 16) + '" width="18" height="32" rx="4" fill="#4A4A52" stroke="#1B1B1E" stroke-width="4"/>' +
      '<rect x="' + (W - 138) + '" y="' + (cy - 16) + '" width="18" height="32" rx="4" fill="#4A4A52" stroke="#1B1B1E" stroke-width="4"/>' +
      discs + discsR +
      "</svg>";
  }

  /* ---------- Pyodide ---------- */
  let pyodidePromise = null;
  const loadedPkgs = new Set();
  const statusEl = document.createElement("div");
  statusEl.className = "pyodide-status";
  statusEl.innerHTML = '<span class="spin" aria-hidden="true"></span><span class="msg"></span>';
  document.body.appendChild(statusEl);
  function status(msg) {
    if (!msg) { statusEl.classList.remove("show"); return; }
    statusEl.querySelector(".msg").textContent = msg;
    statusEl.classList.add("show");
  }

  async function getPyodide() {
    if (!pyodidePromise) {
      status("Apriamo la palestra: carico Python…");
      pyodidePromise = loadPyodide().then(py => { status(null); return py; });
    }
    return pyodidePromise;
  }
  async function ensurePackages(pkgs) {
    const py = await getPyodide();
    const need = (pkgs || []).filter(p => !loadedPkgs.has(p));
    if (need.length) {
      status("Carico i pesi sul bilanciere: " + need.join(", ") + "…");
      await py.loadPackage(need);
      need.forEach(p => loadedPkgs.add(p));
      status(null);
    }
    return py;
  }
  // pre-riscaldamento in background quando si apre un modulo
  function warmup(pkgs) {
    ensurePackages(pkgs).catch(() => { /* riproveremo alla prima esecuzione */ });
  }

  const DRIVER = [
    "import sys, io, traceback",
    "",
    "def _ghisa_run(setup, code, check):",
    "    ns = {}",
    "    buf = io.StringIO()",
    "    old_out, old_err = sys.stdout, sys.stderr",
    "    sys.stdout = sys.stderr = buf",
    "    user_err = None",
    "    check_err = None",
    "    try:",
    "        try:",
    "            if setup:",
    "                exec(compile(setup, '<setup>', 'exec'), ns)",
    "            exec(compile(code, '<il tuo codice>', 'exec'), ns)",
    "        except Exception:",
    "            _lines = traceback.format_exc().splitlines()",
    "            user_err = '\\n'.join(l for l in _lines if '_ghisa_run' not in l and '<exec>' not in l)",
    "        if user_err is None and check:",
    "            try:",
    "                exec(compile(check, '<verifica>', 'exec'), ns)",
    "            except AssertionError as e:",
    "                check_err = str(e) or 'un controllo non passa. Rileggi la consegna.'",
    "            except Exception:",
    "                _tb = traceback.format_exc().strip().splitlines()",
    "                check_err = (_tb[-1] if _tb else 'errore nella verifica') + ' (errore durante la verifica: controlla nomi e tipi delle variabili richieste)'",
    "    finally:",
    "        sys.stdout, sys.stderr = old_out, old_err",
    "    return [buf.getvalue(), user_err, check_err]"
  ].join("\n");

  let driverReady = false;
  async function runExercise(mod, ex, code) {
    const py = await ensurePackages(mod.packages);
    if (!driverReady) { py.runPython(DRIVER); driverReady = true; }
    const fn = py.globals.get("_ghisa_run");
    const proxy = fn(ex.setup || "", code, ex.check || "");
    const [stdout, userError, checkError] = proxy.toJs();
    proxy.destroy();
    fn.destroy();
    return { stdout, userError, checkError };
  }

  function lastErrorLine(message) {
    const lines = message.trim().split("\n").filter(l => l.trim());
    return lines[lines.length - 1] || "Errore sconosciuto";
  }

  /* ---------- rendering ---------- */
  function topbarHtml() {
    return '<header class="topbar"><div class="wrap">' +
      '<a class="brand" href="#/"><span class="disc" aria-hidden="true"></span>La Ghisa</a>' +
      '<span class="kg" id="kg-counter">carico totale <b>' + totalKg() + " kg</b></span>" +
      "</div></header>";
  }
  function footerHtml() {
    return '<footer><div class="wrap">' +
      "<span>LA GHISA — palestra popolare di data science. Il codice gira nel tuo browser.</span>" +
      '<button type="button" id="reset-progress">Azzera i progressi</button>' +
      "</div></footer>";
  }
  function refreshKg() {
    const el = document.getElementById("kg-counter");
    if (el) el.innerHTML = "carico totale <b>" + totalKg() + " kg</b>";
  }

  function renderHome() {
    const kg = totalKg();
    let rooms = "";
    MODULES.forEach((m, i) => {
      const st = moduleStats(m);
      const pct = st.total ? Math.round(100 * st.done / st.total) : 0;
      const plateSet = [...new Set(m.items.filter(x => x.type === "exercise").map(x => x.kg))].sort((a, b) => a - b);
      rooms += '<a class="room' + (st.done === st.total ? " done" : "") + '" href="#/m/' + m.id + '">' +
        (st.done === st.total ? '<span class="done-stamp">Completa</span>' : "") +
        '<span class="num">Sala ' + (i + 1) + " · " + st.total + " serie</span>" +
        "<h3>" + m.name + "</h3>" +
        "<p>" + m.tagline + "</p>" +
        '<div class="meta"><span class="plates">' + plateSet.map(k => discHtml(k)).join("") + "</span>" +
        '<span class="count">' + st.done + "/" + st.total + "</span></div>" +
        '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
        "</a>";
    });

    app.innerHTML = topbarHtml() +
      '<section class="hero"><div class="wrap">' +
      '<p class="eyebrow">Palestra popolare di data science · Iscrizione gratuita · Si suda</p>' +
      "<h1>La <span class=\"thin\">Ghisa</span></h1>" +
      '<p class="lede">Qui la teoria si legge sulla lavagna e poi <em>si spinge</em>: ogni concetto ha i suoi esercizi, il codice gira nel browser e la verifica è immediata. NumPy, Pandas, scikit-learn — una serie alla volta, aumentando il carico.</p>' +
      '<div class="barbell-panel">' +
      '<div class="label"><span>Il tuo bilanciere · ' + levelName(kg) + "</span><b>" + kg + " / " + maxKg() + " kg</b></div>" +
      barbellSvg(kg) +
      "</div>" +
      "</div></section>" +
      '<section class="rooms"><div class="wrap">' +
      "<h2>Le sale</h2>" +
      '<p class="sub">Parti dal riscaldamento e procedi in ordine: ogni sala usa i muscoli allenati in quella prima. I dischi indicano il carico: bianco 5&nbsp;kg (tecnica), verde 10, giallo 15, blu 20, rosso 25&nbsp;kg (massimale).</p>' +
      '<div class="room-grid">' + rooms + "</div>" +
      "</div></section>" + footerHtml();

    bindFooter();
    window.scrollTo(0, 0);
  }

  function renderModule(mod) {
    const idx = MODULES.indexOf(mod);
    const st = moduleStats(mod);
    let body = "";
    let serie = 0;
    for (const item of mod.items) {
      if (item.type === "theory") {
        const hasMore = !!item.more;
        body += '<div class="theory"><span class="chip">Lavagna del coach</span>' +
          "<h2>" + item.title + "</h2>" + item.html +
          (hasMore
            ? '<button type="button" class="btn ghost theory-toggle">Approfondisci ↓</button>' +
              '<div class="theory-more">' + item.more + "</div>"
            : "") +
          "</div>";
      } else {
        serie += 1;
        const done = !!progress[item.id];
        body += '<article class="exercise' + (done ? " completed" : "") + '" id="' + item.id + '" data-ex="' + item.id + '">' +
          '<div class="ex-head">' + discHtml(item.kg, true) +
          '<div class="titles"><span class="serie">Serie ' + serie + " · " + item.kg + " kg</span>" +
          "<h3>" + item.title + "</h3></div>" +
          '<span class="pr-stamp" style="' + (done ? "" : "display:none") + '">PR ✓</span>' +
          "</div>" +
          '<div class="ex-task">' + item.task + "</div>" +
          '<div class="ex-editor"><textarea aria-label="Editor di codice per ' + esc(item.title) + '">' + esc(item.starter) + "</textarea></div>" +
          '<div class="ex-controls">' +
          '<button type="button" class="btn primary act-run">Esegui e verifica</button>' +
          '<button type="button" class="btn ghost act-hint">Chiedi allo spotter</button>' +
          '<button type="button" class="btn ghost act-sol">Soluzione</button>' +
          '<span class="run-note">Ctrl/Cmd + Invio per eseguire</span>' +
          "</div>" +
          '<div class="hint-box"><span class="tag">Lo spotter dice</span>' + item.hint + "</div>" +
          '<div class="solution-box"><span class="tag">Esecuzione da manuale</span><pre><code>' + esc(item.solution) + "</code></pre></div>" +
          '<div class="ex-output"><div class="verdict"></div><pre class="console"></pre></div>' +
          "</article>";
      }
    }

    app.innerHTML = topbarHtml() +
      '<section class="module-head"><div class="wrap">' +
      '<a class="back" href="#/">&larr; Torna in sala pesi</a>' +
      '<p class="eyebrow">Sala ' + (idx + 1) + " · " + st.total + " serie · pacchetti: " + (mod.packages && mod.packages.length ? mod.packages.join(", ") : "solo Python") + "</p>" +
      "<h1>" + mod.name + "</h1>" +
      '<p class="lede">' + mod.intro + "</p>" +
      '<div class="module-progress"><span id="mod-count">' + st.done + "/" + st.total + "</span>" +
      '<div class="bar"><i id="mod-bar" style="width:' + (st.total ? Math.round(100 * st.done / st.total) : 0) + '%"></i></div></div>' +
      "</div></section>" +
      '<section class="session"><div class="wrap">' + body + "</div></section>" +
      footerHtml();

    bindFooter();

    // editor + azioni
    const exercises = mod.items.filter(i => i.type === "exercise");
    for (const card of app.querySelectorAll(".exercise")) {
      const ex = exercises.find(e => e.id === card.dataset.ex);
      const ta = card.querySelector("textarea");
      const cm = CodeMirror.fromTextArea(ta, {
        mode: "python", lineNumbers: true, indentUnit: 4,
        viewportMargin: Infinity, extraKeys: {
          "Ctrl-Enter": () => run(), "Cmd-Enter": () => run(),
          Tab: (c) => c.somethingSelected() ? c.indentSelection("add") : c.replaceSelection("    ")
        }
      });
      const btnRun = card.querySelector(".act-run");
      const btnHint = card.querySelector(".act-hint");
      const btnSol = card.querySelector(".act-sol");
      const outBox = card.querySelector(".ex-output");
      const verdict = card.querySelector(".verdict");
      const cons = card.querySelector(".console");

      async function run() {
        btnRun.disabled = true;
        btnRun.textContent = "In esecuzione…";
        try {
          const res = await runExercise(mod, ex, cm.getValue());
          outBox.classList.add("show");
          let consText = res.stdout ? res.stdout : "";
          if (res.userError) {
            verdict.className = "verdict err";
            verdict.textContent = "✗ Il codice si è inceppato: " + lastErrorLine(res.userError);
            consText += (consText ? "\n" : "") + res.userError.trim();
          } else if (res.checkError) {
            verdict.className = "verdict fail";
            verdict.textContent = "△ Il carico non sale ancora: " + res.checkError;
          } else {
            verdict.className = "verdict ok";
            verdict.textContent = "✓ PR! Serie completata: +" + ex.kg + " kg sul bilanciere.";
            if (!progress[ex.id]) {
              progress[ex.id] = true;
              saveProgress(progress);
              card.classList.add("completed");
              card.querySelector(".pr-stamp").style.display = "";
              refreshKg();
              const stNow = moduleStats(mod);
              document.getElementById("mod-count").textContent = stNow.done + "/" + stNow.total;
              document.getElementById("mod-bar").style.width = Math.round(100 * stNow.done / stNow.total) + "%";
            }
          }
          cons.textContent = consText || "(nessun output — usa print() se vuoi vedere i valori)";
        } catch (e) {
          outBox.classList.add("show");
          verdict.className = "verdict err";
          verdict.textContent = "✗ Problema nel caricare Python: " + e.message;
          cons.textContent = "Controlla la connessione (Pyodide si scarica da CDN) e riprova.";
        } finally {
          btnRun.disabled = false;
          btnRun.textContent = "Esegui e verifica";
        }
      }
      btnRun.addEventListener("click", run);
      btnHint.addEventListener("click", () => card.querySelector(".hint-box").classList.toggle("show"));
      btnSol.addEventListener("click", () => card.querySelector(".solution-box").classList.toggle("show"));
    }

    for (const btn of app.querySelectorAll(".theory-toggle")) {
      btn.addEventListener("click", () => {
        const box = btn.nextElementSibling;
        const open = box.classList.toggle("show");
        btn.textContent = open ? "Richiudi ↑" : "Approfondisci ↓";
      });
    }

    warmup(mod.packages);
    window.scrollTo(0, 0);
  }

  function bindFooter() {
    const b = document.getElementById("reset-progress");
    if (b) b.addEventListener("click", () => {
      if (confirm("Sicuro? Scarichi tutto il bilanciere e riparti da zero.")) {
        progress = {};
        saveProgress(progress);
        route();
      }
    });
  }

  /* ---------- router ---------- */
  function route() {
    const h = location.hash || "#/";
    const m = h.match(/^#\/m\/([\w-]+)/);
    if (m) {
      const mod = MODULES.find(x => x.id === m[1]);
      if (mod) { renderModule(mod); return; }
    }
    renderHome();
  }
  window.addEventListener("hashchange", route);
  route();
})();
