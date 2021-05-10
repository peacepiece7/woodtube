import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema({
  text: {
    type: String,
    required: "Text is required",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const CommentModel = mongoose.model("Comment", commentSchema);
export default CommentModel;
