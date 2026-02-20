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

    function addLine(t){
      const el = document.createElement("div");
      el.className = "line";
      el.textContent = t;
      bootlines.appendChild(el);
      requestAnimationFrame(() => el.classList.add("show"));
    }
 
 // ----------------------------
    // router + boot orchestration
    // ----------------------------
    function routeTo(hash){
      const id = (hash || "#root").replace("#", "");

      document.querySelectorAll(".route").forEach(r => {
        r.classList.toggle("active", r.id === id);
      });

      document.querySelectorAll("[data-route]").forEach(a => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + id);
      });

      // auto-open parents for deep links
      const active = document.querySelector('[data-route].active');
      if (active){
        let node = active.parentElement;
        while (node){
          if (node.tagName === "DETAILS") node.open = true;
          node = node.parentElement;
        }
      }

      if (id === "resume"){
        onEnterResumeRoute();
      }
    }

    window.addEventListener("hashchange", () => routeTo(location.hash));

    async function runBoot(){
      for (const t of bootText){
        addLine(t);
        await new Promise(r => setTimeout(r, 220 + Math.random() * 170));
      }

      // phase 1: swipe sidebar in + push boot text right
      document.body.classList.add("shifted");

      // after swipe completes, swap boot -> routes, then route
      setTimeout(() => {
        document.body.classList.add("ready");
        routeTo(location.hash || "#root");
      }, 540);
    }

    runBoot();