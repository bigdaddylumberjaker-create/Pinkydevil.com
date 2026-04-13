(() => {
  const SOUND_ENABLED = true;
  const ENTER_SOUND_PATH = "/audio/enter-soft.mp3";

  let lastSparkleTime = 0;
  let soundPrimed = false;

  function spawnClickHeart(x, y) {
    const heart = document.createElement("span");
    heart.className = "clickHeart";
    heart.textContent = Math.random() > 0.4 ? "♡" : "♥";
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 900);
  }

  function spawnCursorSparkle(x, y) {
    const sparkle = document.createElement("span");
    sparkle.className = "cursorSparkle";
    sparkle.textContent = Math.random() > 0.5 ? "✦" : "✧";
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    document.body.appendChild(sparkle);

    setTimeout(() => {
      sparkle.remove();
    }, 700);
  }

  function playEnterSound() {
    if (!SOUND_ENABLED) return;

    try {
      const audio = new Audio(ENTER_SOUND_PATH);
      audio.volume = 0.18;
      audio.play().catch(() => {});
    } catch (error) {
      console.warn("Enter sound could not play.", error);
    }
  }

  document.addEventListener("click", (event) => {
    spawnClickHeart(event.clientX, event.clientY);
  });

  document.addEventListener("mousemove", (event) => {
    const now = Date.now();
    if (now - lastSparkleTime < 55) return;
    lastSparkleTime = now;

    spawnCursorSparkle(event.clientX, event.clientY);
  });

  document.addEventListener(
    "pointerdown",
    () => {
      soundPrimed = true;
    },
    { once: true }
  );

  window.addEventListener("DOMContentLoaded", () => {
    const enterButton = document.getElementById("enterButton");
    if (!enterButton) return;

    enterButton.addEventListener("click", () => {
      if (soundPrimed || document.visibilityState === "visible") {
        playEnterSound();
      }
    });
  });
})();
