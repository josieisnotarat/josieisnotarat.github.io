// ----------------------------
    // pdf viewer (server + file picker)
    // ----------------------------

    function setDownloadLinkFromBlob(blob){
      const a = document.getElementById("btn-download");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.setAttribute("download", "resume.pdf");
      a.setAttribute("aria-disabled", "false");
    }

    async function renderPDFSource({ url=null, data=null }){
      const statusEl = document.getElementById("pdf-status");
      const container = document.getElementById("pdf-container");

      container.innerHTML = "";
      statusEl.textContent = "loading pdf…";

      if (!window.pdfjsLib){
        statusEl.textContent = "pdf.js not loaded (pdfjsLib missing).";
        return;
      }

      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "http://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      try{
        const loadingTask = window.pdfjsLib.getDocument(
          data ? { data } : { url }
        );
        const pdf = await loadingTask.promise;

        statusEl.textContent = `rendering ${pdf.numPages} page(s)…`;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++){
          const page = await pdf.getPage(pageNum);

          // fit to content width
          const main = document.querySelector(".main");
          const targetWidth = Math.min(760, main.clientWidth - 40);

          const viewport0 = page.getViewport({ scale: 1 });
          const scale = targetWidth / viewport0.width;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { alpha: false });

          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);

          await page.render({ canvasContext: ctx, viewport }).promise;
          container.appendChild(canvas);
        }

        statusEl.textContent = "done.";
      }catch(err){
        console.error(err);
        statusEl.textContent =
          "couldn’t load the pdf.";
      }
    }

    async function tryAutoLoadResume(){
      // works when served; usually fails on file:// (expected)
      try{
        const res = await fetch("assets/resume.pdf", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch failed");
        const blob = await res.blob();
        const ab = await blob.arrayBuffer();
        setDownloadLinkFromBlob(blob);
        await renderPDFSource({ data: ab });
        return true;
      }catch{
        return false;
      }
    }

    async function onEnterResumeRoute(){
      const container = document.getElementById("pdf-container");
      if (container && container.childElementCount > 0) return;

      const ok = await tryAutoLoadResume();
      if (!ok){
        document.getElementById("pdf-status").textContent =
          "file mode detected. ";
      }
    }

    // buttons
    document.addEventListener("click", async (e) => {
      if (e.target && e.target.id === "btn-pick-resume"){
        document.getElementById("pick-resume").click();
      }

      if (e.target && e.target.id === "btn-reload"){
        const ok = await tryAutoLoadResume();
        if (!ok){
          document.getElementById("pdf-status").textContent =
            "reload failed (likely file://). ";
        }
      }
    });

    document.getElementById("pick-resume").addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      setDownloadLinkFromBlob(file);
      const ab = await file.arrayBuffer();
      await renderPDFSource({ data: ab });
    });
  