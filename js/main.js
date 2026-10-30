/* ============================================================
   Rvs3 .k1k — Portfolio · interacciones
   ============================================================ */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Año dinámico en el footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Estado del nav al hacer scroll ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menú móvil ---------- */
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");

  const closeMenu = () => {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    menu.classList.remove("is-open");
  };

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Abrir menú" : "Cerrar menú");
      menu.classList.toggle("is-open", !open);
    });

    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  /* ---------- Revelar elementos al hacer scroll ---------- */
  const revealEls = Array.from(document.querySelectorAll(".reveal"));

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    // Retardo escalonado dentro del mismo grupo (grid)
    const groups = new Map();
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      const list = groups.get(parent) || [];
      list.push(el);
      groups.set(parent, list);
    });
    groups.forEach((list) => {
      list.forEach((el, i) => el.style.setProperty("--d", `${Math.min(i * 70, 420)}ms`));
    });

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Contadores animados ---------- */
  const counters = Array.from(document.querySelectorAll("[data-count]"));

  const runCounter = (el) => {
    const target = parseInt(el.dataset.count || "0", 10);
    if (prefersReducedMotion || isNaN(target)) {
      el.textContent = String(target);
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cúbico
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const counterIO = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterIO.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Lightbox de proyectos ---------- */
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbTitle = document.getElementById("lightbox-title");
  const lbLink = document.getElementById("lightbox-link");
  let lastFocused = null;

  const openLightbox = (src, title, href, alt) => {
    if (!lightbox || !lbImg || !lbTitle || !lbLink) return;
    lastFocused = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || title;
    lbTitle.textContent = title;
    lbLink.href = href;
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    const closeBtn = lightbox.querySelector(".lightbox__close");
    if (closeBtn) closeBtn.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    if (lbImg) lbImg.removeAttribute("src");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  };

  document.querySelectorAll("[data-lightbox]").forEach((link) => {
    link.addEventListener("click", (e) => {
      // Si el usuario pulsa con teclado modificador (nueva pestaña), respetar el enlace
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      openLightbox(
        link.dataset.lightbox,
        link.dataset.title || "Proyecto",
        link.href,
        link.querySelector("img") ? link.querySelector("img").alt : ""
      );
    });
  });

  if (lightbox) {
    lightbox.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", closeLightbox);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }
})();
