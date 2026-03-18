window.addEventListener("DOMContentLoaded", () => {
  const workerUrl = "https://pinky-twitch-status.bigdaddylumberjaker.workers.dev/";

  const liveWrap = document.getElementById("liveBadgeWrap");
  const liveDot = document.getElementById("liveDot");
  const badgeDot = document.getElementById("badgeDot");
  const liveText = document.getElementById("liveText");

  const banner = document.getElementById("liveHeroBanner");
  const bannerStatus = document.getElementById("bannerStatus");
  const bannerTitle = document.getElementById("bannerTitle");
  const bannerGame = document.getElementById("bannerGame");
  const bannerViewers = document.getElementById("bannerViewers");

  const metaStatus = document.getElementById("metaStatus");
  const metaTitle = document.getElementById("metaTitle");
  const metaGame = document.getElementById("metaGame");
  const metaViewers = document.getElementById("metaViewers");

  const streamStatusPill = document.getElementById("streamStatusPill");
  const streamPlayerCard = document.getElementById("streamPlayerCard");
  const streamPlayerWrap = document.getElementById("streamPlayerWrap");
  const chatCard = document.getElementById("chatCard");
  const chatEmbedWrap = document.getElementById("chatEmbedWrap");
  const overlayCard = document.getElementById("overlayCard");
  const overlayLiveTag = document.getElementById("overlayLiveTag");
  const overlayTitlePill = document.getElementById("overlayTitlePill");
  const overlayGamePill = document.getElementById("overlayGamePill");
  const chatGlowBox = document.getElementById("chatGlowBox");

  if (
    !liveWrap || !liveDot || !badgeDot || !liveText ||
    !banner || !bannerStatus || !bannerTitle || !bannerGame || !bannerViewers ||
    !metaStatus || !metaTitle || !metaGame || !metaViewers ||
    !streamStatusPill || !streamPlayerCard || !streamPlayerWrap ||
    !chatCard || !chatEmbedWrap || !overlayCard || !overlayLiveTag ||
    !overlayTitlePill || !overlayGamePill || !chatGlowBox
  ) {
    return;
  }

  let pulseInterval = null;

  function clearLiveState() {
    liveWrap.classList.remove("isLive");
    liveWrap.classList.add("isOffline");

    liveDot.classList.remove("liveNow");
    liveDot.classList.add("offlineNow");

    badgeDot.classList.remove("liveNow");
    badgeDot.classList.add("offlineNow");

    banner.classList.remove("liveBanner");
    banner.classList.add("offlineBanner");

    streamStatusPill.classList.remove("livePill");
    streamPlayerCard.classList.remove("liveCardGlow");
    streamPlayerWrap.classList.remove("streamCardLive");
    chatCard.classList.remove("liveCardGlow");
    chatEmbedWrap.classList.remove("chatCardLive");
    overlayCard.classList.remove("liveCardGlow");
    overlayLiveTag.classList.remove("overlayLiveNow");
    chatGlowBox.classList.remove("chatGlowPulse");

    if (pulseInterval) {
      clearInterval(pulseInterval);
      pulseInterval = null;
    }
  }

  function setErrorState() {
    clearLiveState();

    liveText.textContent = "status unavailable";

    bannerStatus.textContent = "unknown";
    bannerTitle.textContent = "could not load stream status";
    bannerGame.textContent = "try again later 💗";
    bannerViewers.textContent = "— viewers";

    metaStatus.textContent = "unknown";
    metaTitle.textContent = "could not load stream status";
    metaGame.textContent = "—";
    metaViewers.textContent = "—";

    streamStatusPill.textContent = "status error";
    overlayTitlePill.textContent = "latest supporter";
    overlayGamePill.textContent = "music now playing";
  }

  function setOfflineState() {
    clearLiveState();

    liveText.textContent = "currently offline";

    bannerStatus.textContent = "offline";
    bannerTitle.textContent = "not live right now";
    bannerGame.textContent = "come back later for cozy chaos 💗";
    bannerViewers.textContent = "— viewers";

    metaStatus.textContent = "offline";
    metaTitle.textContent = "not live right now";
    metaGame.textContent = "—";
    metaViewers.textContent = "—";

    streamStatusPill.textContent = "offline";
    overlayTitlePill.textContent = "latest supporter";
    overlayGamePill.textContent = "music now playing";
  }

  function setLiveState(data) {
    clearLiveState();

    liveWrap.classList.remove("isOffline");
    liveWrap.classList.add("isLive");

    liveDot.classList.remove("offlineNow");
    liveDot.classList.add("liveNow");

    badgeDot.classList.remove("offlineNow");
    badgeDot.classList.add("liveNow");

    banner.classList.remove("offlineBanner");
    banner.classList.add("liveBanner");

    liveText.textContent = "LIVE now on Twitch";

    bannerStatus.textContent = "live";
    bannerTitle.textContent = data.title || "live now";
    bannerGame.textContent = data.game_name ? `playing ${data.game_name}` : "live on twitch";
    bannerViewers.textContent = typeof data.viewer_count === "number"
      ? `${data.viewer_count} viewers`
      : "live now";

    metaStatus.textContent = "live";
    metaTitle.textContent = data.title || "live now";
    metaGame.textContent = data.game_name || "—";
    metaViewers.textContent = typeof data.viewer_count === "number"
      ? String(data.viewer_count)
      : "—";

    streamStatusPill.textContent = "live";
    streamStatusPill.classList.add("livePill");

    streamPlayerCard.classList.add("liveCardGlow");
    streamPlayerWrap.classList.add("streamCardLive");
    chatCard.classList.add("liveCardGlow");
    chatEmbedWrap.classList.add("chatCardLive");
    overlayCard.classList.add("liveCardGlow");
    overlayLiveTag.classList.add("overlayLiveNow");

    overlayTitlePill.textContent = data.title
      ? data.title.slice(0, 34) + (data.title.length > 34 ? "..." : "")
      : "live now";
    overlayGamePill.textContent = data.game_name || "twitch";

    chatGlowBox.classList.add("chatGlowPulse");

    pulseInterval = setInterval(() => {
      chatGlowBox.classList.remove("chatGlowPulse");
      void chatGlowBox.offsetWidth;
      chatGlowBox.classList.add("chatGlowPulse");
    }, 5000);
  }

  async function refreshLiveStatus() {
    try {
      const response = await fetch(workerUrl + "?t=" + Date.now(), { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to fetch live status");
      }

      const data = await response.json();

      if (data.live) {
        setLiveState(data);
      } else {
        setOfflineState();
      }
    } catch (error) {
      console.error(error);
      setErrorState();
    }
  }

  refreshLiveStatus();
  setInterval(refreshLiveStatus, 30000);
});
