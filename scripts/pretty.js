/* scripts/pretty.js
   josie's archive — visual polish layer (monochrome)

   does:
   - updates CSS vars --orb-x / --orb-y for the radial "orb" background
   - smooth cursor follow + subtle drift
   - respects prefers-reduced-motion
*/

(() => {
  const root = document.documentElement;

  // if user prefers reduced motion, keep a static but nice position
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function dedentCodeBlocks(){
    const blocks = document.querySelectorAll('pre code');
    blocks.forEach(code => {
      const raw = code.textContent.replace(/\t/g, '  ');
      const lines = raw.split(/\r?\n/);

      // trim leading/trailing blank lines
      while(lines.length && lines[0].trim()==='') lines.shift();
      while(lines.length && lines[lines.length-1].trim()==='') lines.pop();

      // find common indent
      let min = Infinity;
      for(const line of lines){
        if(!line.trim()) continue;
        const m = line.match(/^\s+/);
        if(!m) { min = 0; break; }
        min = Math.min(min, m[0].length);
      }
      const out = lines.map(l => min ? l.slice(min) : l).join('\n');
      code.textContent = out;
    });
  }

  // default position (top-right-ish, matches your ref vibe)
  let x = 72, y = 28;
  let tx = x, ty = y;

  // smoothing (lower = slower / more floaty)
  const ease = 0.1;

  // drift strength in percentage points
  const driftAmpX = 1.1;
  const driftAmpY = 0.9;

  // drift speeds (radians/sec-ish)
  const driftSpeedX = 0.99;
  const driftSpeedY = 0.99;

  // clamp orb so it stays in a nice "presentation" zone
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // utility: set vars
  function setOrb(px, py) {
    root.style.setProperty("--orb-x", `${px.toFixed(2)}%`);
    root.style.setProperty("--orb-y", `${py.toFixed(2)}%`);
  }

  // initial set
  setOrb(x, y);

  // if reduced motion, don't animate or follow
  if (reduceMotion) return;

  // pointer target updates
  function onMove(e) {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;

    const px = (e.clientX / w) * 100;
    const py = (e.clientY / h) * 100;

    // keep it mostly top-right / upper-mid
    tx = clamp(px, 45, 92);
    ty = clamp(py, 8, 70);
  }

  window.addEventListener("pointermove", onMove, { passive: true });

  // subtle “engaged” vibe when interacting (optional but nice)
  let engagedTimer = 0;
  function engage() {
    // very small change; relies on your CSS vars existing
    root.style.setProperty("--bloom", "0.18");
    root.style.setProperty("--grain", "0.10");

    clearTimeout(engagedTimer);
    engagedTimer = setTimeout(() => {
      root.style.setProperty("--bloom", "0.16");
      root.style.setProperty("--grain", "0.09");
    }, 900);
  }

  window.addEventListener("pointerdown", engage, { passive: true });
  window.addEventListener("keydown", engage, { passive: true });

  // animation loop
  const t0 = performance.now();
  let raf = 0;

  function tick(now) {
    const dt = (now - t0) / 1000;

    // tiny drift so it feels alive even when cursor is still
    const dx = Math.sin(dt * driftSpeedX) * driftAmpX;
    const dy = Math.cos(dt * driftSpeedY) * driftAmpY;

    // smooth follow
    x += (tx - x) * ease;
    y += (ty - y) * ease;

    setOrb(x + dx, y + dy);

    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);

  // optional cleanup hook if you ever need it
  window.__prettyCleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", engage);
    window.removeEventListener("keydown", engage);
  };
  window.addEventListener('DOMContentLoaded', dedentCodeBlocks);
})();


// -------------------- github repo loader --------------------
(async () => {
  const root = document.getElementById('ghRepos');
  if (!root) return;

  const note = root.querySelector('.repoMeta .muted');
  const listProjects = root.querySelector('.repoList[data-kind="projects"]');
  const listAssignments = root.querySelector('.repoList[data-kind="assignments"]');

  const isAssignmentRepo = (name) => {
    const n = name.toLowerCase();
    return n.includes('programming') || n.includes('assignments') || n.includes('homework') || n.includes('labs');
  };

  const fmtDate = (iso) => {
    try{
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { year:'numeric', month:'short' });
    }catch{ return ''; }
  };

  const mkItem = (r) => {
    const div = document.createElement('div');
    div.className = 'repoItem';

    const tags = [];
    if (r.language) tags.push(r.language);
    if (r.archived) tags.push('archived');
    if (r.private) tags.push('private');
    tags.push('updated ' + fmtDate(r.pushed_at || r.updated_at));

    div.innerHTML = `
      <div class="top">
        <div class="name"><a href="${r.html_url}" target="_blank" rel="noreferrer">${r.name}</a></div>
        <div class="stars k">★ ${r.stargazers_count}</div>
      </div>
      <div class="desc">${(r.description || '').replace(/</g,'&lt;')}</div>
      <div class="tags">${tags.map(t => `<span>${t}</span>`).join('')}</div>
    `;
    return div;
  };

  try{
    note.textContent = 'fetching…';
    const resp = await fetch('https://api.github.com/users/josieisnotarat/repos?per_page=100&sort=updated');
    if (!resp.ok) throw new Error('github api error: ' + resp.status);
    const repos = await resp.json();

    const projects = [];
    const assignments = [];

    for (const r of repos){
      if (isAssignmentRepo(r.name)) assignments.push(r);
      else projects.push(r);
    }

    note.textContent = `loaded ${repos.length} repos`;
    (projects.slice(0, 16)).forEach(r => listProjects.appendChild(mkItem(r)));
    (assignments.slice(0, 16)).forEach(r => listAssignments.appendChild(mkItem(r)));

    // if there are more, show a link
    const more = document.createElement('p');
    more.className = 'subhead';
    more.style.marginTop = '10px';
    more.innerHTML = `want all of them? <a href="https://github.com/josieisnotarat?tab=repositories" target="_blank" rel="noreferrer">view full repo list</a>`;
    root.appendChild(more);
  }catch(err){
    note.textContent = 'could not load repos (offline / rate-limit). open github link instead.';
    console.warn(err);
  }
})();


/* --------------------------------------------------------------------------------
   Gallery: grid -> lightbox
   usage:
   - put images in:
       <div class="galleryGrid">
         <button class="galleryItem" data-full="assets/photos/01.jpg">
           <img src="assets/photos/01_thumb.jpg" alt="caption">
         </button>
       </div>
   - no extra markup required; lightbox is injected once
-------------------------------------------------------------------------------- */
(() => {
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ensureLightbox(){
    let lb = document.getElementById("lightbox");
    if (lb) return lb;

    lb = document.createElement("div");
    lb.className = "lightbox";
    lb.id = "lightbox";
    lb.setAttribute("aria-hidden", "true");

    lb.innerHTML = `
      <div class="lightboxBackdrop" data-close></div>
      <div class="lightboxShell" role="dialog" aria-modal="true" aria-label="Image viewer">
        <button class="lightboxBtn lightboxClose" type="button" aria-label="Close" data-close>✕</button>
        <button class="lightboxBtn lightboxNav lightboxPrev" type="button" aria-label="Previous image" data-prev>‹</button>
        <figure class="lightboxFigure">
          <img class="lightboxImg" id="lightboxImg" alt="">
          <figcaption class="lightboxCap" id="lightboxCap"></figcaption>
        </figure>
        <button class="lightboxBtn lightboxNav lightboxNext" type="button" aria-label="Next image" data-next>›</button>
      </div>
    `;
    document.body.appendChild(lb);
    return lb;
  }

  function initGalleries(){
    const grids = Array.from(document.querySelectorAll(".galleryGrid"));
    if (!grids.length) return;

    const lb = ensureLightbox();
    const lbImg = lb.querySelector("#lightboxImg");
    const lbCap = lb.querySelector("#lightboxCap");

    let items = [];
    let idx = -1;
    let lastFocusEl = null;

    function collectItems(){
      items = [];
      grids.forEach(g => {
        const these = Array.from(g.querySelectorAll(".galleryItem"));
        these.forEach(btn => items.push(btn));
      });
    }

    function getFullSrc(i){
      const btn = items[i];
      return (btn && btn.dataset && btn.dataset.full) ? btn.dataset.full : (btn ? btn.querySelector("img")?.src : "");
    }

    function getCaption(i){
      const img = items[i]?.querySelector("img");
      return img?.alt || "";
    }

    function render(){
      const src = getFullSrc(idx);
      if (!src) return;

      lbImg.src = src;
      const cap = getCaption(idx);
      lbCap.textContent = cap;
      lbImg.alt = cap || "Gallery image";

      const hasMany = items.length > 1;
      const prevBtn = lb.querySelector("[data-prev]");
      const nextBtn = lb.querySelector("[data-next]");
      if (prevBtn) prevBtn.style.display = hasMany ? "" : "none";
      if (nextBtn) nextBtn.style.display = hasMany ? "" : "none";
    }

    function openAt(i){
      collectItems();
      if (!items.length) return;

      idx = Math.max(0, Math.min(i, items.length - 1));
      lastFocusEl = document.activeElement;

      render();

      lb.classList.add("isOpen");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      const closeBtn = lb.querySelector("[data-close]");
      closeBtn && closeBtn.focus && closeBtn.focus();
    }

    function close(){
      lb.classList.remove("isOpen");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";

      // clear image to free memory
      lbImg.src = "";
      lbCap.textContent = "";

      if (lastFocusEl && lastFocusEl.focus) lastFocusEl.focus();
    }

    function prev(){
      if (items.length < 2) return;
      idx = (idx - 1 + items.length) % items.length;
      render();
    }

    function next(){
      if (items.length < 2) return;
      idx = (idx + 1) % items.length;
      render();
    }

    // attach click handlers once per item
    grids.forEach(g => {
      if (g.dataset.galleryBound === "1") return;
      g.dataset.galleryBound = "1";

      g.addEventListener("click", (e) => {
        const btn = e.target.closest(".galleryItem");
        if (!btn) return;

        collectItems();
        const i = items.indexOf(btn);
        if (i >= 0) openAt(i);
      });
    });

    // lightbox buttons + backdrop
    if (!lb.dataset.galleryBound){
      lb.dataset.galleryBound = "1";

      lb.addEventListener("click", (e) => {
        if (e.target.matches("[data-close]") || e.target.closest("[data-close]")) close();
        if (e.target.matches("[data-prev]") || e.target.closest("[data-prev]")) prev();
        if (e.target.matches("[data-next]") || e.target.closest("[data-next]")) next();
      });

      // optional: click image to go next
      lbImg.addEventListener("click", () => next());

      window.addEventListener("keydown", (e) => {
        if (!lb.classList.contains("isOpen")) return;

        if (e.key === "Escape"){
          e.preventDefault();
          close();
          return;
        }
        if (e.key === "ArrowLeft"){
          e.preventDefault();
          prev();
          return;
        }
        if (e.key === "ArrowRight"){
          e.preventDefault();
          next();
          return;
        }

        // small focus trap
        if (e.key === "Tab"){
          const focusables = Array.from(lb.querySelectorAll("button"))
            .filter(b => b.offsetParent !== null);

          if (!focusables.length) return;

          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          const active = document.activeElement;

          if (e.shiftKey && active === first){
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && active === last){
            e.preventDefault();
            first.focus();
          }
        }
      });
    }
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initGalleries);
  } else {
    initGalleries();
  }

  // in case routes are toggled / content is swapped later
  window.addEventListener("hashchange", () => {
    if (!reduceMotion){
      // tiny delay so layout is stable
      setTimeout(initGalleries, 30);
    } else {
      initGalleries();
    }
  });
})();
