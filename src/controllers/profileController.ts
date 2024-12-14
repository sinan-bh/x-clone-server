import type { Request, Response } from "express";
import { User } from "../models/userModel";
import { CustomError } from "../utils/error/customError";
import { StandardResponse } from "../utils/standardResponse";
import { CustomRequest } from "../types/interfaces";
import { Types } from "mongoose";

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
  try {
    const followedUserId = req.params.followedUserId as string;
    const id = req.params.id as string;
    const isTrue = req.body.isFollow;

    if (!id || !followedUserId) {
      throw new CustomError("User ID or Followed User ID is missing", 400);
    }

    const userId = new Types.ObjectId(id);
    const followedId = new Types.ObjectId(followedUserId);

    const user = await User.findById(userId);
    const followedUser = await User.findById(followedId);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (!followedUser) {
      throw new CustomError("User to follow not found", 404);
    }

    const isFollowing = followedUser.followers.includes(userId);

    if (isFollowing) {
      followedUser.followers = followedUser.followers.filter(
        (f) => !f.equals(userId)
      );
      user.following = user.following.filter((f) => !f.equals(followedId));

      await Promise.all([
        User.updateOne({ _id: followedId }, { $pull: { followers: userId } }),
        User.updateOne({ _id: userId }, { $pull: { following: followedId } }),
      ]);

      res.status(200).json(
        new StandardResponse("User unfollowed successfully", {
          user,
          followedUser,
        })
      );
    } else {
      followedUser.followers.push(userId);
      user.following.push(followedId);

      await Promise.all([
        User.updateOne({ _id: followedId }, { $push: { followers: userId } }),
        User.updateOne({ _id: userId }, { $push: { following: followedId } }),
      ]);

      res.status(200).json(
        new StandardResponse("User followed successfully", {
          user,
          followedUser,
        })
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(new StandardResponse("An error occurred", null));
  }
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
      followers: user.followers,
      following: user.following,
    })
  );
};
