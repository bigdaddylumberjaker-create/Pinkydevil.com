let musicPlayers = {};
let currentTrackId = null;
let clipWatchers = {};

const TRACKS = {
  track1: {
    type: "youtube",
    videoId: "YsGjFh1ke44",
    start: 0,
    end: 0
  },
  track2: {
    type: "youtube",
    videoId: "DopBUv0ZV2w",
    start: 0,
    end: 0
  },
  track3: {
    type: "youtube",
    videoId: "vzo-2zQQ3dA",
    start: 452,
    end: 597
  },
  track4: {
    type: "local"
  }
};

function clearClipWatcher(trackId) {
  if (clipWatchers[trackId]) {
    clearInterval(clipWatchers[trackId]);
    clipWatchers[trackId] = null;
  }
}

function stopLocalTrack4() {
  const video = document.getElementById("track4-local-video");

  if (video) {
    video.pause();
    video.currentTime = 0;
  }
}

function playLocalTrack4() {
  const video = document.getElementById("track4-local-video");

  if (video) {
    video.currentTime = 0;
    video.play().catch(() => {});
  }
}

function stopAllTracks() {
  Object.keys(TRACKS).forEach((id) => {
    clearClipWatcher(id);

    if (TRACKS[id].type === "youtube") {
      const player = musicPlayers[id];
      if (player && typeof player.stopVideo === "function") {
        player.stopVideo();
      }
    }

    if (id === "track4") {
      stopLocalTrack4();
    }

    const card = document.querySelector(`.videoRevealCard[data-player="${id}"]`);
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
  if (!config) return;

  stopAllTracks();

  const card = document.querySelector(`.videoRevealCard[data-player="${trackId}"]`);
  const button = document.querySelector(`.js-track-toggle[data-target="${trackId}"]`);

  if (card) card.classList.add("is-playing");
  if (button) {
    button.classList.add("is-playing");
    button.textContent = "stop";
  }

  currentTrackId = trackId;

  if (config.type === "youtube") {
    const player = musicPlayers[trackId];
    if (!player) return;

    player.seekTo(config.start || 0, true);
    player.playVideo();

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

  if (config.type === "local" && trackId === "track4") {
    playLocalTrack4();
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
  if (!config || config.type !== "youtube") return;

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
      },
      onError: (event) => {
        console.warn(`YouTube player error on ${trackId}:`, event.data);
      }
    }
  });
}

window.onYouTubeIframeAPIReady = function () {
  Object.keys(TRACKS).forEach(createPlayer);
  bindTrackButtons();

  const localTrack4Video = document.getElementById("track4-local-video");
  if (localTrack4Video) {
    localTrack4Video.addEventListener("ended", () => {
      stopAllTracks();
    });
  }
};
