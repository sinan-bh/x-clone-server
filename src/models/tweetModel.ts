import mongoose, { type Document, Schema } from "mongoose";

export interface ITweet extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  text?: string;
  media?: string[];
  likes: mongoose.Types.ObjectId[];
  reposts: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
}

const TweetSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    media: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reposts: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export const Tweet = mongoose.model<ITweet>("Tweet", TweetSchema);
