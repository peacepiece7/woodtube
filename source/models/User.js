"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _passportLocalMongoose = _interopRequireDefault(require("passport-local-mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var UserSchema = new _mongoose["default"].Schema({
  name: String,
  email: String,
  avatarUrl: String,
  githubId: Number,
  password: Number,
  comments: [{
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Comment"
  }],
  videos: [{
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Video"
  }]
});
UserSchema.plugin(_passportLocalMongoose["default"], {
  usernameField: "email",
  errorMessages: {
    UserExistsError: "A user with the given email is already registered."
  }
});

var UserModel = _mongoose["default"].model("User", UserSchema);

var _default = UserModel;
exports["default"] = _default;