"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var commentSchema = new _mongoose["default"].Schema({
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    "default": Date.now
  },
  creator: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "User"
  },
  video: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Video"
  }
});

var CommentModel = _mongoose["default"].model("Comment", commentSchema);

var _default = CommentModel;
exports["default"] = _default;