(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function revealElements() {
    const items = document.querySelectorAll(".reveal");

    if (!items.length) return;

    if (prefersReducedMotion.matches) {
      items.forEach((item) => item.classList.add("show"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    items.forEach((item) => observer.observe(item));
  }

  function addExternalLinkSafety() {
    const links = document.querySelectorAll('a[target="_blank"]');
    links.forEach((link) => {
      const rel = link.getAttribute("rel") || "";
      const parts = new Set(rel.split(/\s+/).filter(Boolean));
      parts.add("noopener");
      parts.add("noreferrer");
      link.setAttribute("rel", Array.from(parts).join(" "));
    });
  }

  function softenHashJump() {
    if (!window.location.hash) return;

    const target = document.querySelector(window.location.hash);
    if (!target) return;

    setTimeout(() => {
      target.scrollIntoView({
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
        block: "start"
      });
    }, 80);
  }

  function setupButtonHoverTilt() {
    if (prefersReducedMotion.matches) return;

    const selectors = [
      ".projectButton",
      ".deskBtn",
      ".musicBtn",
      ".musicCardBtn",
      ".quickBtn",
      ".donationBtn",
      ".navButton"
    ];

    const buttons = document.querySelectorAll(selectors.join(","));
    buttons.forEach((button) => {
      button.addEventListener("mousemove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        button.style.transform = `translateY(-2px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
      });

      button.addEventListener("mouseleave", () => {
        button.style.transform = "";
      });
    });
  }

  function init() {
    revealElements();
    addExternalLinkSafety();
    softenHashJump();
    setupButtonHoverTilt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
