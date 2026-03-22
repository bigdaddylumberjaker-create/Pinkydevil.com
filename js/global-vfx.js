// =========================
// 🌌 background sparkles
// =========================

function spawnSparkles() {
  const container = document.querySelector(".vfxBg");
  if (!container) return;

  for (let i = 0; i < 10; i++) {
    const s = document.createElement("div");
    s.className = "vfxSparkle";
    s.textContent = "✦";

    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.fontSize = 12 + Math.random() * 10 + "px";
    s.style.animationDelay = Math.random() * 5 + "s";

    container.appendChild(s);
  }
}

// =========================
// 🎬 page fade
// =========================

function pageFadeIn() {
  const el = document.querySelector(".pageFade");
  if (!el) return;

  requestAnimationFrame(() => {
    el.classList.add("show");
  });
}

// =========================
// 🎵 hover sound
// =========================

function setupHoverSound() {
  const audio = new Audio("assets/sounds/hover.mp3");
  audio.volume = 0.3;

  document.querySelectorAll(".vfxBtn").forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    });
  });
}

// =========================
// init
// =========================

document.addEventListener("DOMContentLoaded", () => {
  spawnSparkles();
  pageFadeIn();
  setupHoverSound();
});
