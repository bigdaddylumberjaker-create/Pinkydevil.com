(() => {
  const STORAGE_KEY = "pinkydevil-hover-sound-enabled";
  let audio = null;
  let soundEnabled = true;

  function makeAudio() {
    if (audio) return audio;
    audio = new Audio("../assets/sounds/hover.mp3");

    const path = window.location.pathname.toLowerCase();
    if (path.endsWith("/index.html") || path === "/" || path.endsWith("/pinkydevil.com/")) {
      audio = new Audio("assets/sounds/hover.mp3");
    }

    audio.volume = 0.28;
    audio.preload = "auto";
    return audio;
  }

  function loadPreference() {
    const saved = localStorage.getItem(STORAGE_KEY);
    soundEnabled = saved !== "false";
  }

  function playHoverSound() {
    if (!soundEnabled) return;
    const a = makeAudio();
    try {
      a.pause();
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch (_) {}
  }

  function bindHoverSound() {
    const selectors = [
      ".navButton",
      ".deskBtn",
      ".musicBtn",
      ".musicCardBtn",
      ".donationBtn",
      ".streamBtn",
      ".btn",
      ".quickBtn"
    ];

    const buttons = document.querySelectorAll(selectors.join(","));
    buttons.forEach((button) => {
      button.classList.add("hoverSoundReady");
      button.addEventListener("mouseenter", playHoverSound);
      button.addEventListener("focus", playHoverSound);
    });
  }

  function addHoverGlowClass() {
    const selectors = [
      ".navButton",
      ".deskBtn",
      ".musicBtn",
      ".musicCardBtn",
      ".donationBtn",
      ".streamBtn",
      ".btn",
      ".quickBtn"
    ];

    const buttons = document.querySelectorAll(selectors.join(","));
    buttons.forEach((button) => {
      button.classList.add("sitePolishBtn");
    });
  }

  function exposeSoundToggle() {
    window.PinkyDevilHoverSound = {
      enable() {
        soundEnabled = true;
        localStorage.setItem(STORAGE_KEY, "true");
      },
      disable() {
        soundEnabled = false;
        localStorage.setItem(STORAGE_KEY, "false");
      },
      toggle() {
        soundEnabled = !soundEnabled;
        localStorage.setItem(STORAGE_KEY, String(soundEnabled));
        return soundEnabled;
      },
      isEnabled() {
        return soundEnabled;
      }
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadPreference();
    bindHoverSound();
    addHoverGlowClass();
    exposeSoundToggle();
  });
})();
