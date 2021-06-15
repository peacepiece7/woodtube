import routes from "./routes";
import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import path from "path";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const multerUploader = multerS3({
  s3: s3,
  bucket: "wetubeeee",
});

export const localMiddleWare = (req, res, next) => {
  res.locals.siteName = "🪚 Wood Tube";
  res.locals.routes = routes;
  if (req.user) {
    res.locals.loggedUser = req.user;
  } else {
    res.locals.loggedUser = null;
  }
  next();
};

export const onlyPrivate = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    req.flash("error", "Not authorized");
    res.status(400);
    res.redirect(routes.home);
  }
};

export const onlyPublic = (req, res, next) => {
  if (req.user) {
    req.flash("error", "Not authorized");
    res.status(400);
    res.redirect(routes.home);
  } else {
    next();
  }
};
/*
const multerVideoPath = multer({ dest: "uploads/videos/" });

const multerAvaterPath = multer({
  storage: multer.diskStorage({
    // cb는 callback, cb대신 원하는 function 이름을 넣어도 된다. ex) done
    destination(req, file, cb) {
      cb(null, "uploads/avatars/");
    },
    filename(req, file, cb) {
      const extention = path.extname(file.originalname); // 확장자 얻기
      const basename = path.basename(file.originalname, extention);
      cb(null, basename + Date.now() + extention);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 바이러스때문에 크기를 설정해주는 것이 좋다.
});
*/
const multerAvaterPath = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 10000000,
  },
  storage: multerUploader,
});

const multerVideoPath = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 10000000,
  },
  storage: multerUploader,
});

export const uploadAvatarPath = multerAvaterPath.single("image");

export const uploadVideoPath = multerVideoPath.single("file");
