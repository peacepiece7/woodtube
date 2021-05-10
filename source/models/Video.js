import mongoose from "mongoose";

const { Schema } = mongoose;

const VideoSchema = new Schema({
  fileUrl: {
    type: String,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  views: {
    type: Number,
    default: 0,
  },
  genre: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

const VideoModel = mongoose.model("Video", VideoSchema);
export default VideoModel;

/* 
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
*/
