(() => {
  let lastSparkleTime = 0;
  let parallaxFrame = null;
  let pointerX = 0;
  let pointerY = 0;

  function spawnClickHeart(x, y) {
    const heart = document.createElement("span");
    heart.className = "clickHeart";
    heart.textContent = Math.random() > 0.4 ? "♡" : "♥";
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 900);
  }

  function spawnCursorSparkle(x, y) {
    const sparkle = document.createElement("span");
    sparkle.className = "cursorSparkle";
    sparkle.textContent = Math.random() > 0.5 ? "✦" : "✧";
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    document.body.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 700);
  }

  function updateHomeParallax() {
    parallaxFrame = null;

    const homeBg = document.querySelector(".homeBg");
    if (!homeBg) return;

    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;

    const offsetX = (pointerX / width - 0.5) * 2;
    const offsetY = (pointerY / height - 0.5) * 2;

    const nebulae = document.querySelectorAll(".homeNebula");
    const clouds = document.querySelectorAll(".homeCloud");
    const stars = document.querySelectorAll(".homeStar");
    const hearts = document.querySelectorAll(".miniHeart");

    nebulae.forEach((el, index) => {
      const strength = 10 + index * 3;
      el.style.transform = `translate(${offsetX * strength}px, ${offsetY * strength}px)`;
    });

    clouds.forEach((el, index) => {
      const strength = 16 + index * 4;
      el.style.transform = `translate(${offsetX * strength}px, ${offsetY * strength}px)`;
    });

    stars.forEach((el, index) => {
      const strength = 5 + (index % 4);
      el.style.transform = `translate(${offsetX * strength}px, ${offsetY * strength}px)`;
    });

    hearts.forEach((el, index) => {
      const strength = 7 + (index % 3) * 2;
      el.style.transform = `translate(${offsetX * strength}px, ${offsetY * strength}px)`;
    });
  }

  function queueParallaxUpdate() {
    if (parallaxFrame) return;
    parallaxFrame = window.requestAnimationFrame(updateHomeParallax);
  }

  function createAuraToggle() {
    if (document.querySelector(".auraToggle")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "auraToggle";
    button.setAttribute("aria-label", "Toggle Aura Mode");
    button.innerHTML = `<span class="auraDot"></span><span class="auraLabel">aura mode</span>`;

    const saved = localStorage.getItem("pinky_aura_mode") === "on";
    if (saved) {
      document.body.classList.add("auraMode");
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      const enabled = document.body.classList.toggle("auraMode");
      button.classList.toggle("active", enabled);
      localStorage.setItem("pinky_aura_mode", enabled ? "on" : "off");
    });

    document.body.appendChild(button);
  }

  document.addEventListener("click", (event) => {
    spawnClickHeart(event.clientX, event.clientY);
  });

  document.addEventListener("mousemove", (event) => {
    const now = Date.now();

    pointerX = event.clientX;
    pointerY = event.clientY;
    queueParallaxUpdate();

    if (now - lastSparkleTime < 55) return;
    lastSparkleTime = now;
    spawnCursorSparkle(event.clientX, event.clientY);
  });

  window.addEventListener("resize", queueParallaxUpdate);
  window.addEventListener("load", () => {
    queueParallaxUpdate();
    createAuraToggle();
  });

  const enterButton = document.getElementById("enterButton");
  if (enterButton) {
    enterButton.addEventListener("click", () => {
      try {
        const audio = new Audio("audio/enter-soft.mp3");
        audio.volume = 0.18;
        audio.play().catch(() => {});
      } catch (e) {
        console.log("sound skipped");
      }
    });
  }

  console.log("site-magic.js loaded");
})();
