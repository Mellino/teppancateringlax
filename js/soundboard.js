let currentAudio = null;
let currentlyPlayingBtn = null;

const pads = document.querySelectorAll(".pad");
const stopBtn = document.getElementById("stopBtn");

function setPlayingUI(btn) {
  if (currentlyPlayingBtn) currentlyPlayingBtn.classList.remove("playing");
  currentlyPlayingBtn = btn;
  if (currentlyPlayingBtn) currentlyPlayingBtn.classList.add("playing");
}

function clearPlayingUI() {
  if (currentlyPlayingBtn) currentlyPlayingBtn.classList.remove("playing");
  currentlyPlayingBtn = null;
}

function stopAudio() {
  if (!currentAudio) {
    clearPlayingUI();
    return;
  }
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
  clearPlayingUI();

  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = "none";
  }
}

async function playSound(url, title, btn) {
  try {
    // stop previous
    stopAudio();

    setPlayingUI(btn);

    const audio = new Audio(url);
    audio.preload = "auto";
    audio.playsInline = true;

    currentAudio = audio;

    audio.addEventListener("ended", () => {
      if (currentAudio === audio) {
        currentAudio = null;
        clearPlayingUI();
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "none";
      }
    });

    // Media Session
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: "Julio's Teppan Catering",
        album: "Employee Soundboard"
      });
      navigator.mediaSession.playbackState = "playing";
      navigator.mediaSession.setActionHandler("stop", stopAudio);
      navigator.mediaSession.setActionHandler("pause", () => currentAudio?.pause());
      navigator.mediaSession.setActionHandler("play", async () => {
        if (currentAudio) await currentAudio.play();
      });
    }

    await audio.play();
  } catch (err) {
    console.error("Audio play failed:", err);
    clearPlayingUI();
  }
}

// Pad clicks
pads.forEach((btn) => {
  btn.addEventListener("click", () => {
    const url = btn.getAttribute("data-sound");
    const title = btn.innerText || "Sound";
    playSound(url, title, btn);
  });
});

// ✅ Stop button
if (stopBtn) {
  stopBtn.addEventListener("click", stopAudio);
}
