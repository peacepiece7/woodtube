import express from "express";
import {
  videoDelete,
  getEditVideo,
  getUpload,
  getVideoDetail,
  postEditVideo,
  postUpload,
} from "../controllers/videoController";
import { onlyPrivate, uploadVideoPath } from "../middleware";
import routes from "../routes";

const videoRouter = express.Router();

videoRouter.get(routes.videoDetail(), getVideoDetail);

videoRouter.get(routes.upload, onlyPrivate, getUpload);
videoRouter.post(routes.upload, onlyPrivate, uploadVideoPath, postUpload);

videoRouter.get(routes.videoEdit(), onlyPrivate, getEditVideo);
videoRouter.post(routes.videoEdit(), onlyPrivate, postEditVideo);

videoRouter.get(routes.videoDelete(), onlyPrivate, videoDelete);

// videoRouter.post(routes.videoDelete(), PostdeleteVideoController);

export default videoRouter;
