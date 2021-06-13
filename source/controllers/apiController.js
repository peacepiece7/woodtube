import CommentModel from "../models/Comment.js";
import VideoModel from "../models/Video.js";

export const registerView = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await VideoModel.findById(id);
  if (video) {
    video.views = video.views + 1;
    video.save();
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
};

export const createComment = async (req, res) => {
  const parsingBody = JSON.parse(req.body);
  const { id } = req.params;
  const { text } = parsingBody;
  const { user } = req.session.passport;
  const video = await VideoModel.findById(id);
  if (!video) {
    req.flash("error", "video is not exsist");
    res.sendStatus(404);
  }
  const comment = await CommentModel.create({
    text,
    creator: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
};

export const deleteComment = async (req, res) => {
  let currentUrl = req.headers.referer;
  currentUrl = currentUrl.split("/");
  const { id } = req.params;
  await CommentModel.findByIdAndDelete(id);
  res.sendStatus(201);
};
