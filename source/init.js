import "regenerator-runtime";
import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

// 포트를 아래와 같이 지정, heroku로 빌디 시 PORT를 random하게 뿌리고, localhost일 경우 4000으로 접속 함
// const PORT = process.env.PORT || 4000

function handleListen() {
  console.log(`🍎 connedted localhost ${process.env.PORT} PORT`);
}

app.listen(process.env.PORT, handleListen);
