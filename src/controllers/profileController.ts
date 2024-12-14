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
  const { name, uName, email, bio } = req.body;

  // Handle file uploads correctly by casting req.files
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

  // Check if updatedProfile is null before proceeding
  if (!updatedProfile) {
    throw new CustomError("User update failed", 400);
  }

  console.log(files); // To check if the files are being correctly uploaded

  if (files.profilePicture && files.profilePicture[0]) {
    // Handle profile picture upload logic here
    const profilePictureUrl = files.profilePicture[0].path; // Assuming Cloudinary or another service
    updatedProfile.profilePicture = profilePictureUrl;
  }

  if (files.bgImage && files.bgImage[0]) {
    // Handle background image upload logic here
    const bgImageUrl = files.bgImage[0].path; // Assuming Cloudinary or another service
    updatedProfile.bgImage = bgImageUrl;
  }

  await updatedProfile.save();

  res
    .status(200)
    .json(new StandardResponse("User Updated successfully", updatedProfile));
};
