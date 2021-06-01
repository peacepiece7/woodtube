import VideoModel from "../models/Video";
import UserModel from "../models/User";
import routes from "../routes";

// VIDEO DETAIL CONTROLLER
export const getVideoDetail = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const videoInfo = await VideoModel.findById(id);
    const userInfo = await UserModel.findById(videoInfo.creator);
    res.render("videoDetail.pug", {
      pageTitle: "VIDEO DETAIL",
      videoInfo,
      userInfo,
    });
  } catch (error) {
    console.log(error);
  }
};

// VIDEO UPLOAD CONTROLLER
export const getUpload = (req, res) => {
  res.render("upload.pug", { pageTitle: "UPLOAD" });
};
export const postUpload = async (req, res) => {
  const {
    body: { title, description, genre },
    file: { path: fileUrl },
  } = req;
  try {
    const newVideo = await VideoModel.create({
      fileUrl,
      title,
      description,
      genre,
      creator: req.user._id,
    });
    req.user.videos.push(newVideo.id);
    req.user.save();
    res.redirect(`/videos${routes.videoDetail(newVideo.id)}`);
  } catch (error) {
    console.log(`postUploadController errer by ${error}`);
    res.redirect(routes.home);
  }
};

// VIDEO EDIT CONTROLLER
export const getEditVideo = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const VIDEO = await VideoModel.findById(id);
    res.render("videoEdit.pug", { pageTitle: "VIDEO EDIT", VIDEO });
  } catch (error) {
    console.log(`getEditVideoController error :  ${error}`);
    res.redirect(routes.home);
  }
};

export const postEditVideo = async (req, res) => {
  const obj = JSON.parse(JSON.stringify(req.body));
  const {
    params: { id },
  } = req;
  try {
    const VIDEO = await VideoModel.findByIdAndUpdate(
      { _id: id },
      {
        title: obj.title,
        description: obj.description,
        genre: obj.genre,
      }
    );
    res.redirect(`/videos${routes.videoDetail(id)}`);
  } catch (error) {
    console.log(error, "please check Post edit video controller");
    res.redirect(routes.home);
  }
};

// EDLETE VIDEO CONTROLLER
export const videoDelete = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    await VideoModel.findByIdAndRemove({ _id: id });
  } catch (error) {
    console.log(error, "check video delete controller");
  }
  res.redirect(routes.home);
};

/*

export const PostdeleteVideoController = async (req, res) => {
  const {
    params: { id },
  } = req;
  console.log(id);
  try {
    await VideoModel.findByIdAndRemove({ _id: id });
  } catch (error) {
    console.log(error);
  }
  res.redirect(routes.home);
};
*/

export const registerView = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await VideoModel.findById(id);
  if (video) {
    video.views = video.views + 1;
    await video.save();
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
};

export const createComment = (req, res) => {
  console.log(req.params);
  let parsingRequest = JSON.parse(req.body);
  console.log(parsingRequest.text);
  res.end();
};
