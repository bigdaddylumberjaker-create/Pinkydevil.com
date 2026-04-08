// upgraded streams-live.js

(() => {
  const STATUS_ENDPOINTS = [
    "https://pinky-twitch-status.bigdaddylumberjaker.workers.dev/"
  ];

  const liveBadge = document.getElementById("liveBadge");
  const streamStatusText = document.getElementById("streamStatusText");
  const streamStatusTitle = document.getElementById("streamStatusTitle");
  const streamStatusDescription = document.getElementById("streamStatusDescription");
  const streamViewerText = document.getElementById("streamViewerText");
  const streamGameText = document.getElementById("streamGameText");
  const streamStartedText = document.getElementById("streamStartedText");
  const streamThumbnail = document.getElementById("streamThumbnail");
  const streamEmbed = document.getElementById("streamEmbed");
  const mainMonitorCard = document.getElementById("mainMonitorCard");

  let uptimeInterval = null;

  function formatStartedAt(startedAt) {
    if (!startedAt) return "—";
    const date = new Date(startedAt);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
  }

  function startUptimeTimer(startedAt) {
    if (!startedAt) return;

    const startTime = new Date(startedAt).getTime();

    if (uptimeInterval) clearInterval(uptimeInterval);

    uptimeInterval = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;

      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      const formatted = `${hrs}h ${mins}m ${secs}s`;

      if (streamStatusText) {
        streamStatusText.textContent = `live ✦ uptime: ${formatted}`;
      }
    }, 1000);
  }

  function setOfflineState(
    message = "currently offline",
    description = "no live session detected right now."
  ) {
    if (uptimeInterval) clearInterval(uptimeInterval);

    liveBadge.textContent = "offline";
    liveBadge.classList.remove("live");
    liveBadge.classList.add("offline");

    streamStatusText.textContent = "stream is currently offline";
    streamStatusTitle.textContent = message;
    streamStatusDescription.textContent = description;

    streamViewerText.textContent = "viewer info unavailable";
    streamGameText.textContent = "not live";
    streamStartedText.textContent = "—";

    streamThumbnail.src = "../images/stream-placeholder.png";

    streamEmbed.src =
      "https://player.twitch.tv/?channel=pinkydevii&parent=bigdaddylumberjaker-create.github.io&muted=true";

    mainMonitorCard.classList.remove("liveMode");

    // AUTO CHAT SWITCH
    if (window.streamsChatAuto) {
      window.streamsChatAuto.applyAutoChatMode(false);
    }
  }

  function setLiveState(data) {
    liveBadge.textContent = "live";
    liveBadge.classList.remove("offline");
    liveBadge.classList.add("live");

    streamStatusTitle.textContent = data.title || "currently live";

    // VIEWERS
    if (typeof data.viewer_count === "number") {
      streamViewerText.textContent = `${data.viewer_count} viewers`;
    } else {
      streamViewerText.textContent = "live now";
    }

    // GAME
    streamGameText.textContent = data.game_name || "live";

    // START TIME
    streamStartedText.textContent = formatStartedAt(data.started_at);

    // UPTIME TIMER
    startUptimeTimer(data.started_at);

    // THUMBNAIL (REAL)
    if (data.thumbnail_url) {
      streamThumbnail.src =
        data.thumbnail_url
          .replace("{width}", "1280")
          .replace("{height}", "720") +
        `?t=${Date.now()}`;
    }

    // EMBED UNMUTED WHEN LIVE
    streamEmbed.src =
      "https://player.twitch.tv/?channel=pinkydevii&parent=bigdaddylumberjaker-create.github.io&muted=false";

    // STREAM MODE VISUAL
    mainMonitorCard.classList.add("liveMode");

    // DESCRIPTION
    streamStatusDescription.textContent =
      `Streaming ${data.game_name || "something cute"} ✦ join in!`;

    // AUTO CHAT SWITCH
    if (window.streamsChatAuto) {
      window.streamsChatAuto.applyAutoChatMode(true);
    }
  }

  async function tryEndpoint(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error();
    return response.json();
  }

  async function loadStreamStatus() {
    for (const endpoint of STATUS_ENDPOINTS) {
      try {
        const data = await tryEndpoint(endpoint);

        if (data && data.live) {
          setLiveState(data);
          return;
        }

        setOfflineState();
        return;
      } catch (err) {}
    }

    setOfflineState("status unavailable", "could not reach stream server.");
  }

  loadStreamStatus();
  setInterval(loadStreamStatus, 120000);
})();
