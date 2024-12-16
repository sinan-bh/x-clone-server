import type { Request, Response } from "express";
import { User } from "../models/userModel";
import { CustomError } from "../utils/error/customError";
import { StandardResponse } from "../utils/standardResponse";
import { Tweet } from "../models/tweetModel";
import { CustomRequest } from "../types/interfaces";

export const createTweets = async (req: Request, res: Response) => {
  const { text, userId } = req.body;

  console.log(userId);

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
