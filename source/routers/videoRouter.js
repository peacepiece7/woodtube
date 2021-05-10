import express from "express";
import {
  videoDelete,
  getEditVideo,
  getUpload,
  getVideoDetail,
  postEditVideo,
  postUPload,
} from "../controllers/videoController";
import { uploadVideoPath } from "../middleware";
import routes from "../routes";

const videoRouter = express.Router();

videoRouter.get(routes.videoDetail(), getVideoDetail);

videoRouter.get(routes.upload, getUpload);
videoRouter.post(routes.upload, uploadVideoPath, postUPload);

videoRouter.get(routes.videoEdit(), getEditVideo);
videoRouter.post(routes.videoEdit(), postEditVideo);

videoRouter.get(routes.videoDelete(), videoDelete);

// videoRouter.post(routes.videoDelete(), PostdeleteVideoController);

export default videoRouter;
