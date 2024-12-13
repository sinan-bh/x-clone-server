import type { Request, Response } from "express";
import { User } from "../models/userModel";
import { CustomError } from "../utils/error/customError";
import { StandardResponse } from "../utils/standardResponse";
import { CustomRequest } from "../types/interfaces";

export const userProfile = async (req: Request, res: Response) => {
  const { userName } = req.params;

  const user = await User.findOne({ userName: userName });

  if (!user) {
    throw new CustomError("User not found.!", 404);
  }

  res
    .status(200)
    .json(new StandardResponse("Succefully fetched logined User", user));
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const { userName } = req.params;
  const { name, uName, email, profilePicture, bio } = req.body;

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
    { name, userName, email, profilePicture, bio },
    { new: true }
  );

  res
    .status(200)
    .json(new StandardResponse("User Updated successfully", updatedProfile));
};
