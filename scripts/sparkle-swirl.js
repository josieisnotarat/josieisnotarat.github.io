/* scripts/sparkle-swirl.js
   josie's archive — sparkle swirl (sleek + fast)

   goals:
   - cleaner sparkles (crisper glyph sprites, less smear)
   - faster (sprite cache + fewer state changes + capped DPR)
   - sleeker motion (lead orbit + low-noise drift)
   - more random/blobby (jittered grid + thresholded metaball field)
*/
(() => {
  const canvas = document.getElementById("bg");
  if (!canvas) return;

  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ctx = canvas.getContext("2d", { alpha: true });

  const symbols = ["✦","✧","⋆","✶"];

  // ---- knobs (feel free to tweak) ----
  const cfg = {
    blobCount: 6,        // 1 lead + 5 passive
    grid: 26,            // avg spacing (bigger = fewer)
    jitter: 0.42,        // 0..1 (fraction of grid) -> more random
    baseSize: 5,         // smallest sprite size
    sizeSteps: 6,        // how many size buckets (reduces cache size changes)
    speed: 0.34,         // passive drift
    dprCap: 1.25,        // perf
    // blobby feel
    threshold: 0.20,     // hide most of the "empty" space (blobby clusters)
    fog: 0.06,           // tiny ambient sparkles even outside blobs
    // alpha tuning (keep faint)
    aMin: 0.006,
    aMax: 0.20,
    // glow baked into sprite
    glow: 0.22,
    glowBlur: 6
  };

  let w = 0, h = 0, dpr = 1;
  const blobs = [];
  const cursor = { x: 0, y: 0, hasMoved: false };

  // jittered grid points (stable)
  let points = [];
  let step = cfg.grid;

  // simple deterministic hash -> [0,1)
  function hash01(ix, iy, salt) {
    let n = (ix * 374761393) ^ (iy * 668265263) ^ (salt * 2147483647);
    n = (n ^ (n >> 13)) * 1274126177;
    n = (n ^ (n >> 16)) >>> 0;
    return n / 4294967295;
  }

  const rand = (a,b)=>a+Math.random()*(b-a);

  function setCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.max(1, Math.min(cfg.dprCap, window.devicePixelRatio || 1));
    w = Math.floor(rect.width);
    h = Math.floor(rect.height);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initBlobs() {
    blobs.length = 0;
    const m = Math.min(w, h);

    for (let i = 0; i < cfg.blobCount; i++) {
      blobs.push({
        x: rand(0, w),

        y: rand(0, h),
        r: rand(m * 0.18, m * 0.32),
        vx: rand(-cfg.speed, cfg.speed),
        vy: rand(-cfg.speed, cfg.speed),
        phase: rand(0, Math.PI * 2),
        life: Math.random() * 8000,
        maxLife: 8000 + Math.random() * 6000,
        fade: 1500
      });
    }
  }

  function buildPoints() {
    points = [];
    step = cfg.grid;

    const cols = Math.ceil(w / step);
    const rows = Math.ceil(h / step);

    for (let iy = 0; iy < rows; iy++) {
      for (let ix = 0; ix < cols; ix++) {
        const baseX = ix * step;
        const baseY = iy * step;

        const jx = (hash01(ix, iy, 1) - 0.5) * step * cfg.jitter;
        const jy = (hash01(ix, iy, 2) - 0.5) * step * cfg.jitter;

        const gx = baseX + jx;
        const gy = baseY + jy;

        const sym = symbols[Math.floor(hash01(ix, iy, 3) * symbols.length)];

        // ambient chance makes random sparse sparkles everywhere
        const ambient = hash01(ix, iy, 4) < cfg.fog;

        points.push({ gx, gy, sym, ambient });
      }
    }
  }

  function resizeAll() {
    setCanvasSize();
    initBlobs();
    buildPoints();
    buildSpriteCache();
  }

  // metaball field
  function field(x, y, t) {
    let sum = 0;
    for (const b of blobs) {
      // blob lifecycle alpha multiplier
      const lifeRatio = b.life / b.maxLife;
      let lifeAlpha = 1;
      if (lifeRatio < 0.15) lifeAlpha = lifeRatio / 0.15;                // fade in
      else if (lifeRatio > 0.85) lifeAlpha = (1 - lifeRatio) / 0.15;    // fade out

      const breathe = (1 + 0.05 * Math.sin(t * 0.00075 + b.phase)) * lifeAlpha;
      const r = b.r * breathe;
      const dx = x - b.x;
      const dy = y - b.y;
      sum += (r * r) / (dx * dx + dy * dy + 260);
    }
    return sum;
  }

  // ---- sprite cache (fast + clean) ----
  const sprite = new Map(); // key: `${sym}:${size}` -> canvas
  let sizes = [];

  function buildSpriteCache() {
    sprite.clear();
    sizes = [];

    // bucket sizes
    for (let i = 0; i < cfg.sizeSteps; i++) {
      sizes.push(cfg.baseSize + i); // 5..(5+steps-1)
    }

    // build canvases
    for (const s of sizes) {
      for (const sym of symbols) {
        sprite.set(sym + ":" + s, makeGlyph(sym, s));
      }
    }
  }

  function makeGlyph(sym, sizePx) {
    const pad = cfg.glowBlur + 6;
    const w = Math.ceil(sizePx + pad * 2);
    const h = Math.ceil(sizePx + pad * 2);

    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;

    const g = c.getContext("2d", { alpha: true });

    g.clearRect(0, 0, w, h);

    // glow baked in
    g.shadowBlur = cfg.glowBlur;
    g.shadowColor = `rgba(255,255,255,${cfg.glow})`;

    g.fillStyle = "rgba(255,255,255,1)";
    g.font = `${sizePx}px ui-sans-serif, system-ui`;
    g.textBaseline = "middle";
    g.textAlign = "center";

    g.fillText(sym, w / 2, h / 2);

    return c;
  }

  // cursor
  window.addEventListener("pointermove", (e) => {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
    cursor.hasMoved = true;
  }, { passive: true });

  // resize observers
  const ro = window.ResizeObserver ? new ResizeObserver(() => resizeAll()) : null;
  if (ro) ro.observe(document.documentElement);
  window.addEventListener("resize", resizeAll, { passive: true });

  // init
  resizeAll();

  function bucketSize(strength) {
    // strength 0..1 -> sizes bucketed
    const idx = Math.max(0, Math.min(cfg.sizeSteps - 1, Math.round(strength * (cfg.sizeSteps - 1))));
    return sizes[idx];
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);

    // move passive blobs + lifecycle
    for (let i = 1; i < blobs.length; i++) {
      const b = blobs[i];

      // age blob
      b.life += 16;
      if (b.life >= b.maxLife) {
        // respawn with smooth fade
        b.x = Math.random() * w;
        b.y = Math.random() * h;
        b.vx = (Math.random() - 0.5) * 0.3;
        b.vy = (Math.random() - 0.5) * 0.3;
        b.phase = Math.random() * Math.PI * 2;
        b.life = 0;
        b.maxLife = 8000 + Math.random() * 6000;
      }

      b.x += b.vx;
      b.y += b.vy;

      if (b.x < -b.r) b.x = w + b.r;
      if (b.x > w + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = h + b.r;
      if (b.y > h + b.r) b.y = -b.r;
    }
    }

    // subtle cursor influence (weak gravity near blob edges)
    // - only nudges blobs when cursor is nearby
    // - no orbit / no persistent following
    if (!reduceMotion && cursor.hasMoved && blobs.length) {
      const influenceR = Math.min(w, h) * 0.22;  // radius where cursor has any effect
      const maxAccel   = 0.012;                  // keep tiny to avoid obvious "tracking"
      const soften     = 90;                     // prevents spikes when very close

      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const dx = cursor.x - b.x;
        const dy = cursor.y - b.y;
        const dist = Math.hypot(dx, dy);

        if (dist > influenceR) continue;

        // falloff: strongest near edge, fades out smoothly
        const t = 1 - (dist / influenceR);
        const pull = maxAccel * (t * t);

        const ax = (dx / (dist + soften)) * pull;
        const ay = (dy / (dist + soften)) * pull;

        // nudge velocity slightly, then natural drift takes over
        b.vx = (b.vx * 0.985) + ax;
        b.vy = (b.vy * 0.985) + ay;

        // clamp velocities so it never becomes chasey
        const vcap = 0.55;
        b.vx = Math.max(-vcap, Math.min(vcap, b.vx));
        b.vy = Math.max(-vcap, Math.min(vcap, b.vy));
      }
    }
// draw sprites with minimal state changes
    let lastAlpha = -1;

    for (const p of points) {
      const f = field(p.gx, p.gy, t);

      let strength = Math.min(f / 2.55, 1);
      strength = Math.pow(strength, 2.05);

      // blobby: only show where field is strong,
      // but allow a tiny ambient sparkle population
      if (!p.ambient && strength < cfg.threshold) continue;

      const size = bucketSize(strength);
      const img = sprite.get(p.sym + ":" + size);

      // alpha curve (faint, but pops inside blobs)
      let a = cfg.aMin + strength * cfg.aMax;

      // ambient sparkles: super faint regardless
      if (p.ambient && strength < cfg.threshold) a = cfg.aMin * 1.8;

      // reduce globalAlpha churn a bit
      if (Math.abs(a - lastAlpha) > 0.01) {
        ctx.globalAlpha = a;
        lastAlpha = a;
      }

      // center sprite on point
      ctx.drawImage(img, p.gx - img.width / 2, p.gy - img.height / 2);
    }

    ctx.globalAlpha = 1;
  }

  function tick(t) {
    draw(t);
    if (!reduceMotion) requestAnimationFrame(tick);
  }

  // first paint (and animate if allowed)
  requestAnimationFrame(tick);
})();
