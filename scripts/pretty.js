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
})();