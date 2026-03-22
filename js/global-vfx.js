(() => {
  function spawnSparkles() {
    const container = document.querySelector(".vfxBg");
    if (!container || container.dataset.sparklesReady === "1") return;

    container.dataset.sparklesReady = "1";

    for (let i = 0; i < 12; i++) {
      const sparkle = document.createElement("div");
      sparkle.className = "vfxSparkle";
      sparkle.textContent = "✦";
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.fontSize = `${12 + Math.random() * 10}px`;
      sparkle.style.animationDelay = `${Math.random() * 6}s`;
      container.appendChild(sparkle);
    }
  }

  function pageFadeIn() {
    const page = document.querySelector(".pageFade");
    if (!page) return;

    requestAnimationFrame(() => {
      page.classList.add("show");
    });
  }

  function setupHoverSound() {
    const buttons = document.querySelectorAll(".vfxBtn");
    if (!buttons.length) return;

    const audio = new Audio("assets/sounds/hover.mp3");
    audio.volume = 0.28;

    const play = () => {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } catch (_) {}
    };

    buttons.forEach((button) => {
      button.addEventListener("mouseenter", play);
      button.addEventListener("focus", play);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    spawnSparkles();
    pageFadeIn();
    setupHoverSound();
  });
})();
