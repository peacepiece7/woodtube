import routes from "./routes";
import multer from "multer";

export const localMiddleWare = (req, res, next) => {
  res.locals.siteName = "🪚 Wood Tube";
  res.locals.routes = routes;
  next();
};

const multerVideoPath = multer({ dest: "uploads/videos/" });
export const uploadVideoPath = multerVideoPath.single("file");
