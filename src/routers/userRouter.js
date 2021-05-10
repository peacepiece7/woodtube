import express from "express";
import {
  getJoin,
  getLogin,
  logout,
  postJoin,
  userDetail,
  postLogin,
} from "../controllers/userController";
import routes from "../routes";

const userRouter = express.Router();

userRouter.get(routes.userDetail, userDetail);

userRouter.get(routes.join, getJoin);
userRouter.post(routes.join, postJoin, postLogin);

userRouter.get(routes.login, getLogin);
userRouter.post(routes.login, postLogin);

userRouter.get(routes.logout, logout);

export default userRouter;
