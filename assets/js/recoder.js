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

/***/ "./source/client/js/recoder.js":
/*!*************************************!*\
  !*** ./source/client/js/recoder.js ***!
  \*************************************/
/***/ (() => {

eval("function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }\n\nfunction _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"next\", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"throw\", err); } _next(undefined); }); }; }\n\nvar startBtn = document.getElementById(\"startBtn\");\nvar video = document.getElementById(\"preview\");\nvar stream;\n\nvar handleStart = function handleStart() {\n  startBtn.innerText = \"Stop Recording\";\n  startBtn.removeEventListener(\"click\", handleStart);\n  startBtn.addEventListener(\"click\", handleStop);\n  var recorder = new MediaRecorder(stream);\n\n  recorder.ondataavailable = function (e) {\n    console.log(\"recording done\");\n    console.log(e);\n    console.log(e.data);\n  };\n\n  console.log(recorder);\n  recorder.start();\n  console.log(recorder);\n  setTimeout(function () {\n    recorder.stop();\n  }, 10000);\n};\n\nvar handleStop = function handleStop() {\n  startBtn.innerText = \"Start Recording\";\n  startBtn.removeEventListener(\"click\", handleStop);\n  startBtn.addEventListener(\"click\", handleStart);\n};\n\nvar init = /*#__PURE__*/function () {\n  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {\n    return regeneratorRuntime.wrap(function _callee$(_context) {\n      while (1) {\n        switch (_context.prev = _context.next) {\n          case 0:\n            _context.next = 2;\n            return navigator.mediaDevices.getUserMedia({\n              audio: true,\n              video: {\n                width: 500,\n                height: 500\n              }\n            });\n\n          case 2:\n            stream = _context.sent;\n            video.srcObject = stream;\n            video.play();\n\n          case 5:\n          case \"end\":\n            return _context.stop();\n        }\n      }\n    }, _callee);\n  }));\n\n  return function init() {\n    return _ref.apply(this, arguments);\n  };\n}();\n\ninit();\nstartBtn.addEventListener(\"click\", handleStart);\n\n//# sourceURL=webpack://woodtube/./source/client/js/recoder.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./source/client/js/recoder.js"]();
/******/ 	
/******/ })()
;