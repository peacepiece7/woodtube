/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./source/client/js/videoPlayer.js":
/*!*****************************************!*\
  !*** ./source/client/js/videoPlayer.js ***!
  \*****************************************/
/***/ (() => {

eval("var video = document.querySelector(\"video\");\nvar playBtn = document.getElementById(\"play\");\nvar muteBtn = document.getElementById(\"mute\");\nvar volumeRange = document.getElementById(\"volume\");\nvar currenTime = document.getElementById(\"currenTime\");\nvar totalTime = document.getElementById(\"totalTime\");\nvar timeLine = document.getElementById(\"timeline\");\nconsole.log(\"test git commit line\");\nconsole.log(\"test git commit line\");\nvar volumeValue = 0.5;\nvideo.volume = volumeValue; // play & pause button\n\nvar hadlePlayClick = function hadlePlayClick() {\n  if (video.paused) {\n    video.play();\n  } else {\n    video.pause();\n  }\n\n  playBtn.innerText = video.paused ? \"play\" : \"pause\";\n}; // Mute botton\n\n\nvar handleMuteClick = function handleMuteClick() {\n  if (video.muted) {\n    video.muted = false;\n    muteBtn.innerText = \"Mute\";\n  } else {\n    video.muted = true;\n    muteBtn.innerText = \"Unmute\";\n  }\n\n  volumeRange.value = video.muted ? 0 : volumeValue;\n}; // volume range\n\n\nvar handleVolumeChange = function handleVolumeChange(event) {\n  var value = event.target.value;\n\n  if (value == 0) {\n    muteBtn.innerText = \"Unmute\";\n  } else {\n    muteBtn.innerText = \"Mute\";\n  }\n\n  volumeValue = value;\n  video.volume = value;\n}; // Cunrrent Time & Total Time\n\n\nvar formatTime = function formatTime(seconds) {\n  return new Date(seconds * 1000).toISOString().substr(11, 8);\n};\n\nvar handleLoadedMetadata = function handleLoadedMetadata() {\n  totalTime.innerText = formatTime(Math.floor(video.duration));\n  timeLine.max = Math.floor(video.duration);\n};\n\nvar handleTimeUpdate = function handleTimeUpdate() {\n  currenTime.innerText = formatTime(Math.floor(video.currentTime));\n  timeLine.value = Math.floor(video.currentTime);\n}; // Time Line\n\n\nvar handleTimeLineChange = function handleTimeLineChange(event) {\n  var value = event.target.value;\n  video.currentTime = value;\n};\n/*\nconst handleLoadedMetadata = () => {\n  let Time = Math.floor(video.duration);\n  if (Time < 10) {\n    totalTime.innerText = `00:0${Time}`;\n  } else if (Time >= 10 && Time < 60) {\n    totalTime.innerText = `00:${Time}`;\n  } else {\n    totalTime.innerText = Time;\n  }\n};\n\n\nconst handleTimeUpdate = () => {\n  let Time = Math.floor(video.currentTime);\n  if (Time < 10) {\n    currenTime.innerText = `00:0${Time}`;\n  } else if (Time >= 10 && Time < 60) {\n    currenTime.innerText = `00:${Time}`;\n  } else {\n    currenTime.innerText = Time;\n  }\n};\n*/\n\n\nplayBtn.addEventListener(\"click\", hadlePlayClick);\nmuteBtn.addEventListener(\"click\", handleMuteClick);\nvolumeRange.addEventListener(\"input\", handleVolumeChange);\nvideo.addEventListener(\"loadedmetadata\", handleLoadedMetadata);\nvideo.addEventListener(\"timeupdate\", handleTimeUpdate);\ntimeLine.addEventListener(\"input\", handleTimeLineChange);\n\n//# sourceURL=webpack://woodtube/./source/client/js/videoPlayer.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./source/client/js/videoPlayer.js"]();
/******/ 	
/******/ })()
;