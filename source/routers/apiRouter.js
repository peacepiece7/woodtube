import express from "express";
import { registerView } from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.get("/apis", (req, res) => {
  res.send("hellow!!");
});

apiRouter.post("/video/:id/view", registerView);

export default apiRouter;
