import VideoModel from "../models/Video";
import routes from "../routes";

// Video DETAIL Controller
export const getVideoDetail = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const VIDEO = await VideoModel.findById(id);
    res.render("videoDetail.pug", { pageTitle: "VIDEO DETAIL", VIDEO });
  } catch (error) {
    console.log(error);
  }
};
// UPLOAD contorller
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
    console.log(req);
    res.redirect(`/videos${routes.videoDetail(newVideo.id)}`);
  } catch (error) {
    console.log(`postUploadController errer by ${error}`);
    res.redirect(routes.home);
  }
};

// EDIT Video Controller

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

// EDLETE Video Controller

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
