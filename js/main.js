(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function detectPageType() {
    const path = window.location.pathname.toLowerCase();

    if (path.endsWith("/") || path.endsWith("/index.html")) return "home";
    if (path.includes("about")) return "about";
    if (path.includes("projects")) return "projects";
    if (path.includes("streams")) return "streams";
    if (path.includes("music")) return "music";
    if (path.includes("fursona")) return "fursona";
    if (path.includes("art")) return "art";
    if (path.includes("chat")) return "chat";
    if (path.includes("donated")) return "donated";

    return "default";
  }

  function applyBodyPageClass() {
    const pageType = detectPageType();
    document.body.classList.add(`page-${pageType}`);
    return pageType;
  }

  function injectDreamBackground() {
    if (document.querySelector(".siteDreamBg")) return;

    const bg = document.createElement("div");
    bg.className = "siteDreamBg";
    bg.setAttribute("aria-hidden", "true");

    bg.innerHTML = `
      <div class="siteDreamNebula n1"></div>
      <div class="siteDreamNebula n2"></div>
      <div class="siteDreamNebula n3"></div>
      <div class="siteDreamNebula n4"></div>

      <div class="siteDreamGrid"></div>

      <div class="siteDreamStars">
        <span class="siteDreamStar s1">✦</span>
        <span class="siteDreamStar s2">✦</span>
        <span class="siteDreamStar s3">✦</span>
        <span class="siteDreamStar s4">✦</span>
        <span class="siteDreamStar s5">✦</span>
        <span class="siteDreamStar s6">✦</span>
        <span class="siteDreamStar s7">✦</span>
        <span class="siteDreamStar s8">✦</span>
        <span class="siteDreamStar s9">✦</span>
        <span class="siteDreamStar s10">✦</span>
        <span class="siteDreamStar s11">✦</span>
        <span class="siteDreamStar s12">✦</span>
        <span class="siteDreamStar s13">✦</span>
        <span class="siteDreamStar s14">✦</span>
      </div>

      <div class="siteDreamClouds">
        <div class="siteDreamCloud c1"></div>
        <div class="siteDreamCloud c2"></div>
        <div class="siteDreamCloud c3"></div>
        <div class="siteDreamCloud c4"></div>
      </div>

      <div class="siteDreamDust">
        <span class="siteDreamDustDot d1"></span>
        <span class="siteDreamDustDot d2"></span>
        <span class="siteDreamDustDot d3"></span>
        <span class="siteDreamDustDot d4"></span>
        <span class="siteDreamDustDot d5"></span>
      </div>
    `;

    document.body.prepend(bg);
  }

  function getIntroLabel(pageType) {
    const labels = {
      home: "entering home",
      about: "opening memory room",
      projects: "loading magic desktop",
      streams: "warming up live room",
      music: "tuning dreamy audio",
      fursona: "opening shrine",
      art: "entering gallery",
      chat: "opening community room",
      donated: "opening support shrine",
      default: "opening page"
    };

    return labels[pageType] || labels.default;
  }

  function createPageIntro(pageType) {
    if (prefersReducedMotion.matches) return;
    if (document.querySelector(".pageIntroOverlay")) return;

    const overlay = document.createElement("div");
    overlay.className = `pageIntroOverlay page-${pageType}`;

    overlay.innerHTML = `
      <div class="pageIntroCore">
        <div class="pageIntroGlow"></div>
        <div class="pageIntroShape">
          <div class="pageIntroLabel">${getIntroLabel(pageType)}</div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add("page-intro-lock");

    window.requestAnimationFrame(() => {
      setTimeout(() => {
        overlay.classList.add("is-hidden");
        document.body.classList.remove("page-intro-lock");

        setTimeout(() => {
          overlay.remove();
        }, 800);
      }, 580);
    });
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
      ".navButton",
      ".heroButtons .btn"
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

  function createHoverAudioSystem() {
    if (window.__pinkyHoverAudioReady) return;
    window.__pinkyHoverAudioReady = true;

    let audioContext = null;
    let unlocked = false;
    let lastPlay = 0;

    function getContext() {
      if (!audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        audioContext = new AudioCtx();
      }
      return audioContext;
    }

    function unlock() {
      const ctx = getContext();
      if (!ctx) return;

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      unlocked = true;
    }

    function playCuteHover() {
      const now = performance.now();
      if (now - lastPlay < 55) return;
      lastPlay = now;

      const ctx = getContext();
      if (!ctx) return;
      if (!unlocked) return;

      const t = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = "sine";
      osc2.type = "triangle";
      osc1.frequency.setValueAtTime(1260, t);
      osc2.frequency.setValueAtTime(1680, t);

      osc1.frequency.exponentialRampToValueAtTime(980, t + 0.06);
      osc2.frequency.exponentialRampToValueAtTime(1320, t + 0.06);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.018, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2600, t);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.09);
      osc2.stop(t + 0.09);
    }

    window.addEventListener("pointerdown", unlock, { passive: true, once: false });
    window.addEventListener("keydown", unlock, { passive: true, once: false });

    const selectors = [
      ".navButton",
      ".heroButtons .btn",
      ".deskBtn",
      ".musicBtn",
      ".musicCardBtn",
      ".quickBtn",
      ".donationBtn",
      ".projectButton"
    ];

    const buttons = document.querySelectorAll(selectors.join(","));
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", playCuteHover);
      button.addEventListener("focus", playCuteHover);
    });
  }

  function decorateArtCreditTargets() {
    const candidates = document.querySelectorAll("[data-art-credit]");
    candidates.forEach((item) => {
      if (item.classList.contains("artCreditWrap")) return;

      item.classList.add("artCreditWrap");

      const badge = document.createElement("div");
      badge.className = "artCreditBadge";
      badge.textContent = `art by: ${item.getAttribute("data-art-credit") || "fill in credit"}`;
      item.appendChild(badge);
    });
  }

  function init() {
    const pageType = applyBodyPageClass();
    injectDreamBackground();
    createPageIntro(pageType);
    addExternalLinkSafety();
    softenHashJump();
    setupButtonHoverTilt();
    createHoverAudioSystem();
    decorateArtCreditTargets();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
