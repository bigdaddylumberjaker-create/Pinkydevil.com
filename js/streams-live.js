window.addEventListener("DOMContentLoaded", async () => {
  const liveWrap = document.getElementById("liveBadgeWrap");
  const liveDot = document.getElementById("liveDot");
  const liveText = document.getElementById("liveText");

  const metaStatus = document.getElementById("metaStatus");
  const metaTitle = document.getElementById("metaTitle");
  const metaGame = document.getElementById("metaGame");
  const metaViewers = document.getElementById("metaViewers");

  const streamStatusPill = document.getElementById("streamStatusPill");
  const streamPlayerWrap = document.getElementById("streamPlayerWrap");
  const chatEmbedWrap = document.getElementById("chatEmbedWrap");
  const overlayLiveTag = document.getElementById("overlayLiveTag");

  if (
    !liveWrap || !liveDot || !liveText ||
    !metaStatus || !metaTitle || !metaGame || !metaViewers ||
    !streamStatusPill || !streamPlayerWrap || !chatEmbedWrap || !overlayLiveTag
  ) {
    return;
  }

  try {
    const response = await fetch("pinky-twitch-status.bigdaddylumberjaker.workers.dev");

    if (!response.ok) {
      throw new Error("Failed to fetch live status");
    }

    const data = await response.json();

    if (data.live) {
      liveWrap.classList.remove("isOffline");
      liveWrap.classList.add("isLive");

      liveDot.classList.remove("offlineNow");
      liveDot.classList.add("liveNow");

      liveText.textContent = "LIVE now on Twitch";

      metaStatus.textContent = "live";
      metaTitle.textContent = data.title || "live now";
      metaGame.textContent = data.game_name || "—";
      metaViewers.textContent = typeof data.viewer_count === "number" ? String(data.viewer_count) : "—";

      streamStatusPill.textContent = "live";
      streamStatusPill.classList.add("livePill");

      streamPlayerWrap.classList.add("streamCardLive");
      chatEmbedWrap.classList.add("chatCardLive");
      overlayLiveTag.classList.add("overlayLiveNow");
    } else {
      liveWrap.classList.remove("isLive");
      liveWrap.classList.add("isOffline");

      liveDot.classList.remove("liveNow");
      liveDot.classList.add("offlineNow");

      liveText.textContent = "currently offline";

      metaStatus.textContent = "offline";
      metaTitle.textContent = "not live right now";
      metaGame.textContent = "—";
      metaViewers.textContent = "—";

      streamStatusPill.textContent = "offline";
      streamStatusPill.classList.remove("livePill");

      streamPlayerWrap.classList.remove("streamCardLive");
      chatEmbedWrap.classList.remove("chatCardLive");
      overlayLiveTag.classList.remove("overlayLiveNow");
    }
  } catch (error) {
    console.error(error);

    liveWrap.classList.remove("isLive");
    liveWrap.classList.add("isOffline");

    liveDot.classList.remove("liveNow");
    liveDot.classList.add("offlineNow");

    liveText.textContent = "status unavailable";

    metaStatus.textContent = "unknown";
    metaTitle.textContent = "could not load stream status";
    metaGame.textContent = "—";
    metaViewers.textContent = "—";

    streamStatusPill.textContent = "status error";
    streamStatusPill.classList.remove("livePill");

    streamPlayerWrap.classList.remove("streamCardLive");
    chatEmbedWrap.classList.remove("chatCardLive");
    overlayLiveTag.classList.remove("overlayLiveNow");
  }
});
