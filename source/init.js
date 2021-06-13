import "regenerator-runtime";
import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

function handleListen() {
  console.log(`🍎 connedted localhost ${process.env.PORT} PORT`);
}

app.listen(process.env.PORT, handleListen);
