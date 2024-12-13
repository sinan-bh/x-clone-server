import mongoose, { type Document, Schema } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: string;
  message: string;
  reference: mongoose.Types.ObjectId;
  isRead: boolean;
}

const NotificationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // e.g., "like", "comment", "repost", "chat"
    message: { type: String, required: true },
    reference: { type: Schema.Types.ObjectId, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
