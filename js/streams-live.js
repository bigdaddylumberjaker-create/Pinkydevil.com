(async () => {

  const ENDPOINT = "https://REPLACE-WITH-YOUR-WORKER.workers.dev";

  const liveBadge = document.getElementById("liveBadge");
  const statusText = document.getElementById("streamStatusText");
  const title = document.getElementById("streamStatusTitle");
  const desc = document.getElementById("streamStatusDescription");
  const viewers = document.getElementById("streamViewerText");
  const thumb = document.getElementById("streamThumbnail");

  try {
    const res = await fetch(ENDPOINT);
    const data = await res.json();

    if (data.live) {

      liveBadge.textContent = "LIVE";
      liveBadge.classList.add("live");

      statusText.textContent = "stream is live!";
      title.textContent = data.title || "Live now";

      desc.textContent = data.game_name || "";

      viewers.textContent = data.viewer_count + " viewers";

      if (data.thumbnail_url) {
        thumb.src = data.thumbnail_url
          .replace("{width}", "1280")
          .replace("{height}", "720");
      }

    } else {
      statusText.textContent = "offline";
    }

  } catch (e) {
    console.error(e);
    statusText.textContent = "status failed (worker issue)";
  }

})();
