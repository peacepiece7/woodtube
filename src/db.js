import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.once("open", () => console.log("🛢  Conneted to DB", process.env.MONGO_URL));

db.on("error", (error) => console.log("🛢 🛢 🛢 DB Error", error));
