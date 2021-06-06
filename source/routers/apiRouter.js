import express from "express";
import {
  registerView,
  createComment,
  deleteComment,
} from "../controllers/apiController.js";

const apiRouter = express.Router();

apiRouter.post("/videos/:id/comment", createComment);
apiRouter.post("/videos/:id/view", registerView);
apiRouter.post("/videos/:id/comment/delete", deleteComment);

export default apiRouter;
