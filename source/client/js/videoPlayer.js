const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");

let volumeValue = 0.5;
video.volume = volumeValue;

// play & pause button
const hadlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.paused ? "play" : "pause";
};

// Mute botton
const handleMuteClick = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  volumeRange.value = video.muted ? 0 : volumeValue;
};

// volume range
const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (value == 0) {
    muteBtn.innerText = "Unmute";
  } else {
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
};

// Video Time
const handleLoadedMetadata = () => {
  let Time = Math.floor(video.duration);
  if (Time < 10) {
    totalTime.innerText = `00:0${Time}`;
  } else if (Time >= 10 && Time < 60) {
    totalTime.innerText = `00:${Time}`;
  } else {
    totalTime.innerText = Time;
  }
};

const handleTimeUpdate = () => {
  let Time = Math.floor(video.currentTime);
  if (Time < 10) {
    currenTime.innerText = `00:0${Time}`;
  } else if (Time >= 10 && Time < 60) {
    currenTime.innerText = `00:${Time}`;
  } else {
    currenTime.innerText = Time;
  }
};

playBtn.addEventListener("click", hadlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
