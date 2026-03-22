(() => {
  const liveStatus = document.getElementById("liveStatus");
  const channel = "pinkydevii";

  async function checkLiveStatus() {
    if (!liveStatus) return;

    try {
      liveStatus.textContent = "checking if live...";

      const response = await fetch(`https://decapi.me/twitch/uptime/${channel}`, {
        cache: "no-store"
      });

      const text = (await response.text()).trim();

      if (!text || /offline/i.test(text)) {
        liveStatus.textContent = "currently offline 💗";
        return;
      }

      liveStatus.textContent = `live now ✨ uptime: ${text}`;
    } catch (error) {
      liveStatus.textContent = "could not check live status right now";
      console.error("Live status check failed:", error);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    checkLiveStatus();
    setInterval(checkLiveStatus, 60000);
  });
})();
