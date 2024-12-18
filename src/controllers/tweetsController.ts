import type { Request, Response } from "express";
import { User } from "../models/userModel";
import { CustomError } from "../utils/error/customError";
import { StandardResponse } from "../utils/standardResponse";
import { Tweet } from "../models/tweetModel";

export const createTweets = async (req: Request, res: Response) => {
  const { text, userId } = req.body;

  if (!userId) {
    throw new CustomError("User not authenticated.");
  }

  let media: string[] = [];

  if (req.files) {
    media = (req.files as Express.Multer.File[]).map((file) => {
      return file.path;
    });
  }
  const tweet = await Tweet.create({ user: userId, text, media });

  const user = await User.findByIdAndUpdate(
    userId,
    { $push: { post: tweet._id } },
    { new: true }
  );

  res
    .status(201)
    .json(new StandardResponse("Tweet created Successfully", tweet));
};

export const getTweets = async (req: Request, res: Response) => {
  const tweets = await Tweet.find().populate("user").sort({ createdAt: -1 });

  if (!tweets || tweets.length < 1) {
    throw new CustomError("tweets not found", 404);
  }

  res.status(200).json(new StandardResponse("get all tweets", tweets));
};

export const userTweets = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new CustomError("user not logined or token expaired", 404);
  }

  const user = await User.findById(userId).populate({
    path: "post",
    populate: {
      path: "user",
      model: "User",
    },
    options: { sort: { createdAt: -1 } },
  });
  if (!user) {
    throw new CustomError("users not found", 404);
  }

  res
    .status(200)
    .json(new StandardResponse("successfully fetched tweets", user.post));
};
