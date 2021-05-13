import express from "express";
import {
  getJoin,
  getLogin,
  logout,
  postJoin,
  userDetail,
  postLogin,
  getUserEdit,
  postUserEdit,
} from "../controllers/userController";
import { onlyPrivate, onlyPublic, uploadAvatarPath } from "../middleware";
import routes from "../routes";

const userRouter = express.Router();

userRouter.get(routes.userDetail, onlyPrivate, userDetail);

userRouter.get(routes.userEdit, onlyPrivate, getUserEdit);
userRouter.post(routes.userEdit, onlyPrivate, uploadAvatarPath, postUserEdit);

userRouter.get(routes.join, onlyPublic, getJoin);
userRouter.post(routes.join, onlyPublic, postJoin, postLogin);

userRouter.get(routes.login, onlyPublic, getLogin);
userRouter.post(routes.login, onlyPublic, postLogin);

userRouter.get(routes.logout, onlyPrivate, logout);

export default userRouter;
