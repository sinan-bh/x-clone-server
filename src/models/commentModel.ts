import mongoose, { type Document, Schema } from "mongoose";

export interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  tweet: mongoose.Types.ObjectId;
  text: string;
}

const CommentSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tweet: { type: Schema.Types.ObjectId, ref: "Tweet", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
