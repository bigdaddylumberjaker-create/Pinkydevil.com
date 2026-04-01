(() => {
  const badge = document.getElementById("homeLiveBadge");
  const text = document.getElementById("homeLiveText");
  const channel = "pinkydevii";

  async function checkLiveStatus() {
    if (!badge || !text) return;

    try {
      text.textContent = "checking live status...";

      const response = await fetch(`https://decapi.me/twitch/uptime/${channel}`, {
        cache: "no-store"
      });

      const result = (await response.text()).trim();

      if (!result || /offline/i.test(result)) {
        badge.classList.remove("live");
        badge.classList.add("offline");
        badge.textContent = "offline";
        text.textContent = "currently offline";
        return;
      }

      badge.classList.remove("offline");
      badge.classList.add("live");
      badge.textContent = "live";
      text.textContent = `live now ✦ uptime: ${result}`;
    } catch (error) {
      badge.classList.remove("live");
      badge.classList.add("offline");
      badge.textContent = "offline";
      text.textContent = "status unavailable right now";
      console.error("Home live status check failed:", error);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    checkLiveStatus();
    setInterval(checkLiveStatus, 60000);
  });
})();
