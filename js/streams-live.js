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

  function formatStartedAt(startedAt) {
    if (!startedAt) return "—";
    const date = new Date(startedAt);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
  }

  function setOfflineState(message = "currently offline", description = "no live session detected right now, but this panel updates automatically when the stream goes live.") {
    if (liveBadge) {
      liveBadge.textContent = "offline";
      liveBadge.classList.remove("live");
      liveBadge.classList.add("offline");
    }

    if (streamStatusText) {
      streamStatusText.textContent = "stream is currently offline";
    }

    if (streamStatusTitle) {
      streamStatusTitle.textContent = message;
    }

    if (streamStatusDescription) {
      streamStatusDescription.textContent = description;
    }

    if (streamViewerText) {
      streamViewerText.textContent = "viewer info unavailable";
    }

    if (streamGameText) {
      streamGameText.textContent = "not live";
    }

    if (streamStartedText) {
      streamStartedText.textContent = "—";
    }

    if (streamThumbnail) {
      streamThumbnail.src = "../images/stream-placeholder.png";
    }

    if (streamEmbed) {
      streamEmbed.src = "https://player.twitch.tv/?channel=pinkydevi&parent=bigdaddylumberjaker-create.github.io&muted=true";
    }

    if (mainMonitorCard) {
      mainMonitorCard.classList.remove("liveMode");
    }
  }

  function setLiveState(data) {
    if (liveBadge) {
      liveBadge.textContent = "live";
      liveBadge.classList.remove("offline");
      liveBadge.classList.add("live");
    }

    if (streamStatusText) {
      streamStatusText.textContent = "stream is live right now!";
    }

    if (streamStatusTitle) {
      streamStatusTitle.textContent = data.title || "currently live";
    }

    if (streamStatusDescription) {
      const gamePart = data.game_name ? `Streaming ${data.game_name}. ` : "";
      const startedPart = data.started_at ? `Started at ${formatStartedAt(data.started_at)}.` : "";
      streamStatusDescription.textContent = `${gamePart}${startedPart}`.trim() || "live stream detected.";
    }

    if (streamViewerText) {
      if (typeof data.viewer_count === "number") {
        streamViewerText.textContent = `${data.viewer_count} viewers`;
      } else {
        streamViewerText.textContent = "live now";
      }
    }

    if (streamGameText) {
      streamGameText.textContent = data.game_name || "live";
    }

    if (streamStartedText) {
      streamStartedText.textContent = formatStartedAt(data.started_at);
    }

    if (streamThumbnail && data.thumbnail_url) {
      const cacheBust = Date.now();
      streamThumbnail.src =
        data.thumbnail_url
          .replace("{width}", "1280")
          .replace("{height}", "720") + `?t=${cacheBust}`;
    }

    if (streamEmbed) {
      streamEmbed.src = "https://player.twitch.tv/?channel=pinkydevi&parent=bigdaddylumberjaker-create.github.io&muted=false";
    }

    if (mainMonitorCard) {
      mainMonitorCard.classList.add("liveMode");
    }
  }

  async function tryEndpoint(url) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Status endpoint failed: ${response.status}`);
    }

    return response.json();
  }

  async function loadStreamStatus() {
    let lastError = null;

    for (const endpoint of STATUS_ENDPOINTS) {
      try {
        const data = await tryEndpoint(endpoint);

        if (data && data.live) {
          setLiveState(data);
          return;
        }

        setOfflineState();
        return;
      } catch (error) {
        lastError = error;
      }
    }

    console.error("Could not load stream status.", lastError);

    setOfflineState(
      "status unavailable",
      "the live status service could not be reached right now. the page still works, but the automatic Twitch status check failed."
    );

    if (streamStatusText) {
      streamStatusText.textContent = "stream status unavailable";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadStreamStatus);
  } else {
    loadStreamStatus();
  }

  setInterval(loadStreamStatus, 120000);
})();
