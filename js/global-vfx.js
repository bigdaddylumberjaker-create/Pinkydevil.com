(() => {
  function spawnSparkles() {
    const container = document.querySelector(".vfxBg");
    if (!container) return;

    if (container.querySelector(".vfxSparkle")) return;

    for (let i = 0; i < 12; i++) {
      const s = document.createElement("div");
      s.className = "vfxSparkle";
      s.textContent = i % 3 === 0 ? "♡" : "✦";
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.fontSize = 10 + Math.random() * 10 + "px";
      s.style.animationDelay = Math.random() * 5 + "s";
      container.appendChild(s);
    }
  }

  function pageFadeIn() {
    const el = document.querySelector(".pageFade");
    if (!el) return;

    requestAnimationFrame(() => {
      el.classList.add("show");
    });
  }

  function setupHoverSound() {
    let ctx;
    let unlocked = false;
    let lastPlay = 0;

    function getCtx() {
      if (!ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        ctx = new AudioCtx();
      }
      return ctx;
    }

    function unlock() {
      const audioCtx = getCtx();
      if (!audioCtx) return;
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
      unlocked = true;
    }

    function playCuteHover() {
      const now = performance.now();
      if (now - lastPlay < 70) return;
      lastPlay = now;

      const audioCtx = getCtx();
      if (!audioCtx || !unlocked) return;

      const t = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc1.type = "sine";
      osc2.type = "triangle";
      osc1.frequency.setValueAtTime(1280, t);
      osc2.frequency.setValueAtTime(1680, t);
      osc1.frequency.exponentialRampToValueAtTime(1020, t + 0.06);
      osc2.frequency.exponentialRampToValueAtTime(1360, t + 0.06);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2600, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.02, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.09);
      osc2.stop(t + 0.09);
    }

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });

    document.querySelectorAll(".vfxBtn").forEach((btn) => {
      btn.addEventListener("mouseenter", playCuteHover);
      btn.addEventListener("focus", playCuteHover);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    spawnSparkles();
    pageFadeIn();
    setupHoverSound();
  });
})();
