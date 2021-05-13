import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import passport from "passport";
import session from "express-session";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import path from "path";

import routes from "./routes";
import globalRouter from "./routers/globalRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import "./db";
import { localMiddleWare } from "./middleware";

import "./passport";

const app = express();

// SETTING
app.set("views", process.cwd() + "/source/views");
app.set("view engin", "pug");
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));

// MORGAN
const looger = morgan("combined");

// HELMET
/*
app.use((req, res, next) => {
  res.setHeader(
    "ContentSeculityPolicy",
    "scriptSrc 'self' https://archive.org"
  );
  next();
});
*/
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "'unsafe-eval'"],
      "object-src": "'self'",
    },
  })
);

// BODY PARSER
app.use(bodyParser.urlencoded({ extended: false }));
// COOKIE PARSER
app.use(cookieParser(process.env.COOKIE_SECRET));
// SESSION

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  })
);
// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// MIDDLEWARE
app.use(localMiddleWare);

app.use(routes.home, globalRouter);
app.use(routes.users, userRouter);
app.use(routes.videos, videoRouter);

function handleListen() {
  console.log(`🍎 connedted localhost ${process.env.PORT} PORT`);
}

app.listen(process.env.PORT, handleListen);
