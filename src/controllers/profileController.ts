import type { Request, Response } from "express";
import { User } from "../models/userModel";
import { CustomError } from "../utils/error/customError";
import { StandardResponse } from "../utils/standardResponse";
import { Types } from "mongoose";

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await User.find();

  if (!users || users.length < 1) {
    throw new CustomError("users not found", 404);
  }

  res
    .status(200)
    .json(new StandardResponse("successfully fetched users", users));
};

export const userProfile = async (req: Request, res: Response) => {
  const { userName } = req.params;

  const user = await User.findOne({ userName })
    .populate("following")
    .populate("followers");

  if (!user) {
    throw new CustomError("User not found.!", 404);
  }

  res
    .status(200)
    .json(new StandardResponse("Succefully fetched logined User", user));
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const { userName } = req.params;
  const { name, uName, email, bio } = req.body;

  const files = req.files as {
    profilePicture?: Express.Multer.File[];
    bgImage?: Express.Multer.File[];
  };

  const user = await User.findOne({ userName });
  if (!user) {
    throw new CustomError("User not found");
  }

  const existingUser = await User.findOne({
    $or: [{ userName: uName }, { email: email }],
  });

  if (existingUser) {
    throw new CustomError("Email or UserName already exists", 400);
  }

  const updatedProfile = await User.findByIdAndUpdate(
    user._id,
    { name, userName, email, bio },
    { new: true }
  );

  if (!updatedProfile) {
    throw new CustomError("User update failed", 400);
  }

  if (files.profilePicture && files.profilePicture[0]) {
    const profilePictureUrl = files.profilePicture[0].path;
    updatedProfile.profilePicture = profilePictureUrl;
  }

  if (files.bgImage && files.bgImage[0]) {
    const bgImageUrl = files.bgImage[0].path;
    updatedProfile.bgImage = bgImageUrl;
  }

  await updatedProfile.save();

  res
    .status(200)
    .json(new StandardResponse("User Updated successfully", updatedProfile));
};

export const followUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!id || !userId) {
    throw new CustomError("User ID or Followed User ID is missing", 400);
  }

  const user = await User.findById(id);
  const followedUser = await User.findById(userId);

  if (!user) throw new CustomError("User not found", 404);
  if (!followedUser) throw new CustomError("Followed User not found", 404);

  user.followers = user.followers ?? [];
  user.following = user.following ?? [];
  followedUser.followers = followedUser.followers ?? [];
  followedUser.following = followedUser.following ?? [];

  const isFollowing = user.following.includes(userId);

  if (isFollowing) {
    user.following = user.following.filter(
      (follower) => follower.toString() !== userId
    );
    followedUser.followers = followedUser.followers.filter(
      (follower) => follower.toString() !== id
    );
  } else {
    user.following.push(userId);
    followedUser.followers.push(new Types.ObjectId(id));
  }

  await user.save();
  await followedUser.save();

  res.status(200).json(
    new StandardResponse("Successfully unfollowed or followed", {
      followedUser,
      user,
    })
  );
};

export const followingFollowers = async (req: Request, res: Response) => {
  const { status } = req.query;
  const { userName } = req.params;

  const user = await User.findOne({ userName })
    .populate("followers")
    .populate("following");

  if (!user) {
    throw new CustomError("User not found!", 404);
  }

  res.status(200).json(
    new StandardResponse("Successfully fetched followers or following", {
      followUsers: status === "followers" ? user.followers : user.following,
    })
  );
};

export const searchUsers = async (req: Request, res: Response) => {
  const { query } = req.query;
  console.log(query);
  
  const users = await User.find({
    userName: { $regex: query, $options: "i" },
  });

  if (!users || users.length < 1) {
    throw new CustomError("Error searching users", 404);
  }
  res
    .status(200)
    .json(new StandardResponse("successfully fetched users", users));
};
