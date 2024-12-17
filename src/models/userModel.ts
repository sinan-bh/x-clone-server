import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import { boolean } from "zod";

export interface IUser extends Document {
  name: string;
  userName: string;
  email: string;
  password: string;
  bio?: string;
  profilePicture?: string;
  bgImage?: string;
  web?: string;
  location?: string;
  followStatus: boolean;
  post: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String },
    profilePicture: { type: String },
    bgImage: { type: String },
    web: { type: String },
    location: { type: String },
    followStatus: { type: String, default: false },
    post: [{ type: Schema.Types.ObjectId, ref: "Tweet" }],
    rePost: [{ type: Schema.Types.ObjectId, ref: "Tweet" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "Tweet" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User = mongoose.model<IUser>("User", UserSchema);
