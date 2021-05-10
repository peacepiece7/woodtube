import express from "express";
import { home, search } from "../controllers/globalController";
import routes from "../routes";

const globalRouter = express.Router();

globalRouter.get(routes.home, home);

// search router
globalRouter.post(routes.search, search);

export default globalRouter;
