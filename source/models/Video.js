"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Schema = _mongoose["default"].Schema;
var VideoSchema = new Schema({
  fileUrl: {
    type: String
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  views: {
    type: Number,
    "default": 0
  },
  genre: {
    type: String
  },
  createdAt: {
    type: Date,
    "default": Date.now
  },
  comments: [{
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Comment"
  }],
  creator: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "User"
  }
});

var VideoModel = _mongoose["default"].model("Video", VideoSchema);

var _default = VideoModel;
/* 
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
*/

exports["default"] = _default;