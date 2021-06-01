import express from "express";
import { registerView, createComment } from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.get("/apis", (req, res) => {
  res.send("hello!!");
});

apiRouter.post("/videos/:id/view", registerView);
apiRouter.post("/videos/:id/comment", createComment);

export default apiRouter;
