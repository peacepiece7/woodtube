const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeLine = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeOut = null;
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
const handleMuteClick = () => {
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  } else {
    video.muted = true;
    muteBtn.innerText = "Unmute";
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

// Cunrrent Time & Total Time
const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substr(11, 8);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeLine.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
  timeLine.value = Math.floor(video.currentTime);
};

// Time Line
const handleTimeLineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

/*
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
*/

// Full Screen
const handleFullScreen = () => {
  const fullScreen = document.fullscreenElement;
  if (fullScreen) {
    document.exitFullscreen();
    fullScreenBtn.innerText = "Enter Full Screen";
  } else {
    videoContainer.requestFullscreen();
    fullScreenBtn.innerText = "Exit Full Screen";
  }
};

// controls events  (화면에 마우스를 넣었다 뺏을 때 일어나는 이벤트)
const hideControls = () => {
  if (controlsTimeOut) {
    setTimeout(() => {
      videoControls.classList.remove("showing");
    }, 1000);
  }
};

const handleMouseMove = () => {
  if (controlsTimeOut) {
    clearTimeout(controlsTimeOut);
  }
  videoControls.classList.add("showing");
  controlsTimeOut = setTimeout(() => {
    hideControls();
  }, 1000);
};

const handleMouseLeave = () => {
  controlsTimeOut = setTimeout(() => {
    hideControls();
  }, 1000);
};

const handleEnded = () => {
  const id = videoContainer.dataset.videoid;
  fetch(`/api/videos/${id}/view`, { method: "POST" });
};

playBtn.addEventListener("click", hadlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
timeLine.addEventListener("input", handleTimeLineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
