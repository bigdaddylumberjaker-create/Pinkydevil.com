let musicPlayers = {};
let currentTrackId = null;
let clipWatchers = {};

const TRACKS = {
  track1: {
    videoId: "YsGjFh1ke44",
    start: 0,
    end: 0
  },
  track2: {
    videoId: "DopBUv0ZV2w",
    start: 0,
    end: 0
  },
  track3: {
    videoId: "vzo-2zQQ3dA",
    start: 452,
    end: 597
  },
  track4: {
    videoId: "WW6R8xDjBKA",
    start: 0,
    end: 0
  }
};

function clearClipWatcher(trackId) {
  if (clipWatchers[trackId]) {
    clearInterval(clipWatchers[trackId]);
    clipWatchers[trackId] = null;
  }
}

function stopAllTracks() {
  Object.keys(musicPlayers).forEach((id) => {
    const player = musicPlayers[id];
    if (player && typeof player.stopVideo === "function") {
      player.stopVideo();
    }

    clearClipWatcher(id);

    const card = document.querySelector(`.premiumFoldCard[data-player="${id}"]`);
    const button = document.querySelector(`.js-track-toggle[data-target="${id}"]`);

    if (card) card.classList.remove("is-playing");
    if (button) {
      button.classList.remove("is-playing");
      button.textContent = "play";
    }
  });

  currentTrackId = null;
}

function playTrack(trackId) {
  const config = TRACKS[trackId];
  const player = musicPlayers[trackId];
  if (!config || !player) return;

  stopAllTracks();

  const card = document.querySelector(`.premiumFoldCard[data-player="${trackId}"]`);
  const button = document.querySelector(`.js-track-toggle[data-target="${trackId}"]`);

  if (card) card.classList.add("is-playing");
  if (button) {
    button.classList.add("is-playing");
    button.textContent = "stop";
  }

  player.seekTo(config.start || 0, true);
  player.playVideo();
  currentTrackId = trackId;

  if (config.end && config.end > config.start) {
    clipWatchers[trackId] = setInterval(() => {
      if (currentTrackId !== trackId) {
        clearClipWatcher(trackId);
        return;
      }

      const time = player.getCurrentTime();
      if (time >= config.end) {
        stopAllTracks();
        clearClipWatcher(trackId);
      }
    }, 350);
  }
}

function toggleTrack(trackId) {
  if (currentTrackId === trackId) {
    stopAllTracks();
    return;
  }
  playTrack(trackId);
}

function bindTrackButtons() {
  document.querySelectorAll(".js-track-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const trackId = button.dataset.target;
      toggleTrack(trackId);
    });
  });
}

function createPlayer(trackId) {
  const config = TRACKS[trackId];
  if (!config) return;

  musicPlayers[trackId] = new YT.Player(`${trackId}-player`, {
    videoId: config.videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      start: config.start || 0
    },
    events: {
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.ENDED) {
          stopAllTracks();
        }
      }
    }
  });
}

window.onYouTubeIframeAPIReady = function () {
  Object.keys(TRACKS).forEach(createPlayer);
  bindTrackButtons();
};
