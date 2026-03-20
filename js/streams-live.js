(() => {
  const STATUS_ENDPOINTS = [
    "../api/twitch-status",
    "https://pinkydevi-status.your-worker-subdomain.workers.dev"
  ];

  const liveBadge = document.getElementById("liveBadge");
  const streamStatusText = document.getElementById("streamStatusText");
  const streamStatusTitle = document.getElementById("streamStatusTitle");
  const streamStatusDescription = document.getElementById("streamStatusDescription");
  const streamViewerText = document.getElementById("streamViewerText");
  const streamEmbed = document.getElementById("streamEmbed");

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
      const startedPart = data.started_at ? `Started at ${new Date(data.started_at).toLocaleString()}.` : "";
      streamStatusDescription.textContent = `${gamePart}${startedPart}`.trim() || "live stream detected.";
    }

    if (streamViewerText) {
      if (typeof data.viewer_count === "number") {
        streamViewerText.textContent = `${data.viewer_count} viewers`;
      } else {
        streamViewerText.textContent = "live now";
      }
    }

    if (streamEmbed) {
      streamEmbed.src = "https://player.twitch.tv/?channel=pinkydevi&parent=bigdaddylumberjaker-create.github.io&muted=false";
    }
  }

  async function tryEndpoint(url) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json"
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
      "the live status service could not be reached right now. the page itself is still working, but the automatic status check failed."
    );

    if (streamStatusText) {
      streamStatusText.textContent = "stream status unavailable";
    }
  }

  function init() {
    loadStreamStatus();
    setInterval(loadStreamStatus, 120000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
