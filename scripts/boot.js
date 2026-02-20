// ----------------------------
// boot
// ----------------------------
const bootText = [
  "boot: initializing…",
  "boot: mounting /users",
  "boot: mounting /projects",
  "boot: mounting /languages",
  "boot: mounting /academics",
  "boot: mounting /workinfo",
  "",
  "scan: rooting directories…",
  "ok: /users/josieisnotarat",
  "ok: /users/josephine",
  "ok: /projects/current",
  "ok: /projects/completed",
  "ok: /workinfo/resume.pdf",
  "",
  "ready."
];

const bootlines = document.getElementById("bootlines");
const mobileQuery = window.matchMedia("(max-width: 860px)");
const mobileNavToggle = document.getElementById("mobileNavToggle");

function addLine(t) {
  const el = document.createElement("div");
  el.className = "line";
  el.textContent = t;
  bootlines.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
}

function setMobileView(view) {
  document.body.classList.remove("mobile-nav-content", "mobile-nav-directory");
  if (!mobileQuery.matches) {
    document.body.classList.add("shifted");
    if (mobileNavToggle) mobileNavToggle.setAttribute("aria-expanded", "false");
    return;
  }

  const nextView = view === "directory" ? "directory" : "content";
  document.body.classList.remove("shifted");
  document.body.classList.add(nextView === "directory" ? "mobile-nav-directory" : "mobile-nav-content");

  if (mobileNavToggle) {
    const inDirectory = nextView === "directory";
    mobileNavToggle.textContent = inDirectory ? "view content" : "open directory";
    mobileNavToggle.setAttribute("aria-expanded", String(inDirectory));
  }
}

function bindMobileSwipe() {
  let startX = 0;
  let startY = 0;

  document.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  }, { passive: true });

  document.addEventListener("touchend", (event) => {
    if (!mobileQuery.matches) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.25) return;

    if (dx > 0) setMobileView("directory");
    else setMobileView("content");
  }, { passive: true });
}

if (mobileNavToggle) {
  mobileNavToggle.addEventListener("click", () => {
    const isDirectory = document.body.classList.contains("mobile-nav-directory");
    setMobileView(isDirectory ? "content" : "directory");
  });
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-route]");
  if (!link || !mobileQuery.matches) return;
  setMobileView("content");
});

mobileQuery.addEventListener("change", () => {
  setMobileView("content");
});

bindMobileSwipe();

// ----------------------------
// router + boot orchestration
// ----------------------------
function routeTo(hash) {
  const id = (hash || "#root").replace("#", "");

  document.querySelectorAll(".route").forEach(r => {
    r.classList.toggle("active", r.id === id);
  });

  document.querySelectorAll("[data-route]").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + id);
  });

  // auto-open parents for deep links
  const active = document.querySelector('[data-route].active');
  if (active) {
    let node = active.parentElement;
    while (node) {
      if (node.tagName === "DETAILS") node.open = true;
      node = node.parentElement;
    }
  }

  if (id === "resume") {
    onEnterResumeRoute();
  }
}

window.addEventListener("hashchange", () => routeTo(location.hash));

async function runBoot() {
  for (const t of bootText) {
    addLine(t);
    await new Promise(r => setTimeout(r, 220 + Math.random() * 170));
  }

  // phase 1: show directory state for desktop, content state for mobile
  if (mobileQuery.matches) setMobileView("content");
  else document.body.classList.add("shifted");

  // after swipe completes, swap boot -> routes, then route
  setTimeout(() => {
    document.body.classList.add("ready");
    routeTo(location.hash || "#root");
  }, 540);
}

runBoot();
