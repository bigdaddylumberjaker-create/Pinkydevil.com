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

  function dispatchLiveState(isLive) {
    document.dispatchEvent(
      new CustomEvent("stream-live-state", {
        detail: { isLive }
      })
    );
  }

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
      streamEmbed.src =
        "https://player.twitch.tv/?channel=pinkydevii&parent=bigdaddylumberjaker-create.github.io&muted=true";
    }

    if (mainMonitorCard) {
      mainMonitorCard.classList.remove("liveMode");
    }

    if (window.streamsChatAuto) {
      window.streamsChatAuto.applyAutoChatMode(false);
    }

    dispatchLiveState(false);
  }

  function setLiveState(data) {
    if (liveBadge) {
      liveBadge.textContent = "live";
      liveBadge.classList.remove("offline");
      liveBadge.classList.add("live");
    }

    if (streamStatusTitle) {
      streamStatusTitle.textContent = data.title || "currently live";
    }

    if (typeof data.viewer_count === "number") {
      if (streamViewerText) {
        streamViewerText.textContent = `${data.viewer_count} viewers`;
      }
    } else if (streamViewerText) {
      streamViewerText.textContent = "live now";
    }

    if (streamGameText) {
      streamGameText.textContent = data.game_name || "live";
    }

    if (streamStartedText) {
      streamStartedText.textContent = formatStartedAt(data.started_at);
    }

    startUptimeTimer(data.started_at);

    if (data.thumbnail_url && streamThumbnail) {
      streamThumbnail.src =
        data.thumbnail_url
          .replace("{width}", "1280")
          .replace("{height}", "720") +
        `?t=${Date.now()}`;
    }

    if (streamEmbed) {
      streamEmbed.src =
        "https://player.twitch.tv/?channel=pinkydevii&parent=bigdaddylumberjaker-create.github.io&muted=false";
    }

    if (mainMonitorCard) {
      mainMonitorCard.classList.add("liveMode");
    }

    if (streamStatusDescription) {
      streamStatusDescription.textContent =
        `Streaming ${data.game_name || "something cute"} ✦ join in!`;
    }

    if (window.streamsChatAuto) {
      window.streamsChatAuto.applyAutoChatMode(true);
    }

    dispatchLiveState(true);
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

    dispatchLiveState(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadStreamStatus);
  } else {
    loadStreamStatus();
  }

  setInterval(loadStreamStatus, 120000);
})();
