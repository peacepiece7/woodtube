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

/***/ "./source/client/js/commentSection.js":
/*!********************************************!*\
  !*** ./source/client/js/commentSection.js ***!
  \********************************************/
/***/ (() => {

eval("var videoContainer = document.querySelector(\"#videoContainer\");\nvar form = document.querySelector(\".video-comments-form\");\nvar createCommentBtn = form.querySelector(\"button\");\nvar deleteCommentBtn = document.querySelector(\"#video-comment__delete-btn\");\n\nvar handleSubmit = function handleSubmit(event) {\n  event.preventDefault();\n  var textarea = form.querySelector(\"textarea\");\n  var videoId = videoContainer.dataset.videoid;\n  var text = textarea.value;\n\n  if (text === \"\") {\n    return;\n  }\n\n  fetch(\"/api/videos/\".concat(videoId, \"/comment\"), {\n    method: \"POST\",\n    body: JSON.stringify({\n      text: text\n    })\n  }).then(function (response) {\n    console.log(response);\n  });\n  var commentTag = document.querySelector(\".video-comments__list\");\n  var newElement = document.createElement(\"li\");\n  newElement.innerHTML = \"\".concat(text);\n  commentTag.appendChild(newElement);\n  textarea.value = \"\"; // window.location.reload();\n};\n\nvar handleCommentDelete = function handleCommentDelete() {\n  var commentId = deleteCommentBtn.dataset.commentid;\n  fetch(\"/api/videos/\".concat(commentId, \"/comment/delete\"), {\n    method: \"POST\"\n  }).then(function (response) {\n    window.location.reload();\n  });\n};\n\ncreateCommentBtn.addEventListener(\"click\", handleSubmit);\n\nif (deleteCommentBtn === null) {} else {\n  deleteCommentBtn.addEventListener(\"click\", handleCommentDelete);\n}\n\n//# sourceURL=webpack://woodtube/./source/client/js/commentSection.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./source/client/js/commentSection.js"]();
/******/ 	
/******/ })()
;