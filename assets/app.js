(function () {
  document.documentElement.classList.add("has-js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const dialog = document.querySelector("#ficha");
  const dialogBody = document.querySelector("#ficha-body");
  const live = document.querySelector("#copy-live");
  const hrVideo = document.querySelector("#hr-video");
  const hrStatus = document.querySelector("#hr-status");
  const email = "lautarodemiannunez32@gmail.com";
  const english = (document.documentElement.lang || "").toLowerCase().startsWith("en");
  const ui = english
    ? {
        imageError: "This image could not be shown. Check that the file is still in media/.",
        videoError: "This video could not be played in this browser.",
        caseFallback: "Project",
        viewImage: (n) => `View image ${n}`,
        zoom: "Enlarge image",
        gallery: "Browse images",
        prev: "Previous image",
        next: "Next image",
        prevLabel: "← Previous",
        nextLabel: "Next →",
        back: "Back to the project",
        selected: "Selected: ",
        preparing: "Copying the email…",
        copied: "Email copied.",
        copyFail: "Select the email and copy it with Ctrl+C or Cmd+C.",
      }
    : {
        imageError: "No se pudo mostrar esta imagen. Revisá que el archivo siga en media/.",
        videoError: "Este video no se pudo reproducir en este navegador.",
        caseFallback: "Caso",
        viewImage: (n) => `Ver imagen ${n}`,
        zoom: "Ampliar imagen",
        gallery: "Recorrer imágenes",
        prev: "Imagen anterior",
        next: "Imagen siguiente",
        prevLabel: "← Anterior",
        nextLabel: "Siguiente →",
        back: "Volver a la ficha",
        selected: "Seleccionado: ",
        preparing: "Preparando el correo…",
        copied: "Correo copiado.",
        copyFail: "Seleccioná el correo y copialo con Ctrl+C o Cmd+C.",
      };
  let lastOpener = null;
  let gallery = [];
  let galleryIndex = 0;

  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      img.classList.add("is-broken");
      const host = img.closest("figure, .card-media, .hr-player") || img.parentElement;
      if (!host) return;
      let note = host.querySelector(".media-error");
      if (!note) {
        note = document.createElement("p");
        note.className = "media-error";
        host.appendChild(note);
      }
      note.textContent = ui.imageError;
    });
  });

  document.querySelectorAll("video").forEach((video) => {
    video.addEventListener("error", () => {
      const host = video.closest(".hr-player, .ficha-body, article") || video.parentElement;
      if (!host) return;
      host.classList.add("media-fail");
      let note = host.querySelector(".media-error");
      if (!note) {
        note = document.createElement("p");
        note.className = "media-error";
        host.appendChild(note);
      }
      note.textContent = ui.videoError;
    });
  });

  function pauseVideos(root) {
    (root || document).querySelectorAll("video").forEach((video) => {
      video.pause();
    });
  }

  function setPressed(group, active) {
    group.querySelectorAll("[aria-pressed]").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn === active ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-filter-group]").forEach((group) => {
    group.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-filter]");
      if (!btn) return;
      const filter = btn.getAttribute("data-filter");
      setPressed(group, btn);
      document.querySelectorAll("[data-cats]").forEach((item) => {
        const cats = (item.getAttribute("data-cats") || "").split(/\s+/);
        item.classList.toggle("is-hidden", filter !== "all" && !cats.includes(filter));
      });
      const archiveCards = [...document.querySelectorAll(".archive [data-cats]")];
      const archiveVisible = archiveCards.some((card) => !card.classList.contains("is-hidden"));
      document.querySelector(".archive-title")?.classList.toggle("is-hidden", !archiveVisible);
    });
  });

  function currentShot() {
    return gallery[galleryIndex] || null;
  }

  function renderStage() {
    const shot = currentShot();
    const stage = dialogBody.querySelector(".ficha-stage");
    if (!shot || !stage) return;
    const img = stage.querySelector("img");
    const cap = stage.querySelector("figcaption");
    img.src = shot.src;
    img.alt = shot.alt;
    img.width = shot.width || 1440;
    img.height = shot.height || 860;
    if (cap) cap.textContent = shot.caption || "";
    const count = dialogBody.querySelector(".gallery-count");
    if (count) count.textContent = `${galleryIndex + 1} / ${gallery.length}`;
    dialogBody.querySelectorAll(".thumbs button").forEach((btn, i) => {
      btn.setAttribute("aria-current", i === galleryIndex ? "true" : "false");
    });
  }

  function collectGallery(source) {
    return [...source.querySelectorAll("[data-shot]")].map((node) => ({
      src: node.getAttribute("src"),
      alt: node.getAttribute("alt") || "",
      caption: node.getAttribute("data-caption") || "",
      width: Number(node.getAttribute("width")) || 1440,
      height: Number(node.getAttribute("height")) || 860,
    }));
  }

  function openCase(article, opener) {
    if (!dialog || !dialogBody || !article) return;
    const full = article.querySelector(".case-full");
    if (!full) return;
    pauseVideos(document);
    dialogBody.classList.remove("media-fail");
    lastOpener = opener || null;
    gallery = collectGallery(full);
    galleryIndex = 0;
    dialog.classList.remove("is-zoomed");

    const title = full.querySelector("h3")?.textContent || article.querySelector("h3")?.textContent || ui.caseFallback;
    const copy = full.querySelector(".ficha-copy")?.innerHTML || "";
    const chips = full.querySelector(".chip-row")?.outerHTML || "";
    const video = full.querySelector("[data-case-video]");
    const href = full.querySelector("[data-ext]")?.outerHTML || "";

    const thumbs = gallery
      .map(
        (shot, i) => `
        <button type="button" data-thumb="${i}" aria-label="${ui.viewImage(i + 1)}" aria-current="${i === 0 ? "true" : "false"}">
          <img src="${shot.src}" alt="" width="160" height="100" />
        </button>`
      )
      .join("");

    const first = gallery[0];
    const stage = first
      ? `<figure class="ficha-stage">
          <button type="button" class="zoom-open" aria-label="${ui.zoom}">
            <img src="${first.src}" alt="${first.alt}" width="${first.width}" height="${first.height}" />
          </button>
          <figcaption>${first.caption || ""}</figcaption>
        </figure>
        <div class="thumbs">${thumbs}</div>
        ${gallery.length > 1 ? `<div class="gallery-controls" aria-label="${ui.gallery}">
          <button type="button" class="btn-ghost" data-gallery-step="-1" aria-label="${ui.prev}">${ui.prevLabel}</button>
          <span class="gallery-count" role="status" aria-live="polite">1 / ${gallery.length}</span>
          <button type="button" class="btn-ghost" data-gallery-step="1" aria-label="${ui.next}">${ui.nextLabel}</button>
        </div>` : ""}`
      : "";

    const videoBlock = video
      ? `<video class="ficha-video" controls playsinline preload="none" poster="${video.getAttribute("data-poster") || ""}" width="1280" height="720">
          <source src="${video.getAttribute("data-case-video")}" type="${video.getAttribute("data-type") || "video/webm"}" />
        </video>
        <p class="media-error">${ui.videoError}</p>`
      : "";

    dialogBody.innerHTML = `
      <p class="kicker">${full.querySelector(".kicker")?.textContent || ""}</p>
      <h2 id="ficha-title">${title}</h2>
      ${href}
      <div class="ficha-copy">${copy}</div>
      ${chips}
      ${stage}
      ${videoBlock}
      <button type="button" class="btn-ghost zoom-back" hidden>${ui.back}</button>
    `;

    dialogBody.querySelector("video")?.addEventListener("error", () => {
      dialogBody.classList.add("media-fail");
    });
    dialogBody.querySelector("video source")?.addEventListener("error", () => {
      dialogBody.classList.add("media-fail");
    });

    dialog.showModal();
    dialog.querySelector(".close")?.focus({ preventScroll: true });
    dialog.scrollTop = 0;
  }

  document.addEventListener("click", (event) => {
    const openBtn = event.target.closest("[data-open]");
    if (openBtn) {
      event.preventDefault();
      const article = document.querySelector(`[data-case="${openBtn.getAttribute("data-open")}"]`);
      openCase(article, openBtn);
      return;
    }

    const summary = event.target.closest(".has-js [data-case] summary.btn");
    if (summary) {
      event.preventDefault();
      openCase(summary.closest("[data-case]"), summary);
    }
  });

  dialogBody?.addEventListener("click", (event) => {
    const step = event.target.closest("[data-gallery-step]");
    if (step && gallery.length > 1) {
      galleryIndex = (galleryIndex + Number(step.dataset.galleryStep) + gallery.length) % gallery.length;
      renderStage();
      return;
    }
    const thumb = event.target.closest("[data-thumb]");
    if (thumb) {
      galleryIndex = Number(thumb.getAttribute("data-thumb"));
      renderStage();
      return;
    }
    if (event.target.closest(".zoom-open") && gallery.length) {
      dialog.classList.add("is-zoomed");
      const back = dialogBody.querySelector(".zoom-back");
      if (back) {
        back.hidden = false;
        back.focus();
      }
      return;
    }
    if (event.target.closest(".zoom-back")) {
      dialog.classList.remove("is-zoomed");
      event.target.closest(".zoom-back").hidden = true;
      dialogBody.querySelector(".zoom-open")?.focus();
    }
  });

  function onDialogClose() {
    pauseVideos(dialog);
    dialog.classList.remove("is-zoomed");
    dialogBody.innerHTML = "";
    if (lastOpener && typeof lastOpener.focus === "function") {
      lastOpener.focus();
    }
    lastOpener = null;
  }

  dialog?.addEventListener("close", onDialogClose);

  if (dialog && !("closedBy" in HTMLDialogElement.prototype)) {
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!inside) dialog.close();
    });
  }

  document.querySelectorAll("[data-hr-src]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!hrVideo) return;
      const src = btn.getAttribute("data-hr-src");
      const label = btn.getAttribute("data-hr-label") || "Video";
      const source = hrVideo.querySelector("source");
      if (source && source.getAttribute("src") !== src) {
        source.setAttribute("src", src);
        hrVideo.load();
      }
      document.querySelectorAll("[data-hr-src]").forEach((other) => {
        other.setAttribute("aria-pressed", other === btn ? "true" : "false");
      });
      if (hrStatus) hrStatus.textContent = ui.selected + label;
      hrVideo.play().catch(() => {});
    });
  });

  document.querySelector("[data-copy-email]")?.addEventListener("click", async () => {
    const fallback = document.querySelector("#email-fallback");
    if (live) live.textContent = ui.preparing;
    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(email);
        copied = true;
      } catch {
        copied = false;
      }
    }
    if (!copied && fallback) {
      fallback.hidden = false;
      fallback.value = email;
      fallback.focus();
      fallback.select();
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }
    }
    if (live) {
      live.textContent = copied ? ui.copied : ui.copyFail;
    }
  });

  document.querySelectorAll(".nav-mob-list a").forEach((link) => {
    link.addEventListener("click", () => {
      const menu = document.querySelector(".nav-mob");
      if (menu) menu.open = false;
    });
  });

  if (reduceMotion.matches && hrVideo) {
    hrVideo.removeAttribute("autoplay");
  }

  const mast = document.querySelector(".mast");
  if (mast) {
    const onScroll = () => {
      mast.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const meetNav = document.querySelector(".meet-nav");
  if (meetNav) {
    const links = [...meetNav.querySelectorAll('a[href^="#"]')];
    const mark = (active) => {
      links.forEach((link) => {
        const on = link === active;
        link.classList.toggle("is-current", on);
        if (on) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };
    const nativeSpy = window.CSS && CSS.supports("scroll-target-group", "auto");
    if (nativeSpy && "onscrollend" in window) {
      const paint = () => {
        let current = null;
        try {
          current = meetNav.querySelector("a:target-current");
        } catch {
          current = null;
        }
        mark(current);
      };
      paint();
      window.addEventListener("scrollend", paint);
    } else {
      const sections = links
        .map((link) => document.querySelector(link.hash))
        .filter(Boolean);
      const io = new IntersectionObserver(
        (entries) => {
          const hit = entries.find((entry) => entry.isIntersecting);
          if (!hit) return;
          mark(links.find((link) => link.hash === "#" + hit.target.id) || null);
        },
        { rootMargin: "-42% 0px -48% 0px", threshold: 0.05 }
      );
      sections.forEach((section) => io.observe(section));
    }
  }
})();
