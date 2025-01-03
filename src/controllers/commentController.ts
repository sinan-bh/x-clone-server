import { Response } from "express";
import { Tweet } from "../models/tweetModel";
import { User } from "../models/userModel";
import { CustomRequest } from "../types/interfaces";
import { CustomError } from "../utils/error/customError";
import { StandardResponse } from "../utils/standardResponse";
import { Comment } from "../models/commentModel";

export const createComment = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.id;
  const { postId } = req.params;
  const { text } = req.body;

  if (!userId) {
    throw new CustomError("user not found", 404);
  }

  if (!postId) {
    throw new CustomError("postId not found", 404);
  }

  const comment = await Comment.create({
    user: userId,
    tweet: postId,
    text: text,
  });

  await comment.save();

  await User.findByIdAndUpdate(
    userId,
    {
      $push: { comments: comment._id },
    },
    { new: true }
  );

  await Tweet.findByIdAndUpdate(
    postId,
    {
      $push: { comments: comment._id },
    },
    { new: true }
  );

  res.status(201).json(new StandardResponse("comment created", comment));
};

export const getComments = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.id;

  const comments = await Comment.find({ user: userId })
    .populate({
      path: "user",
      model: "User",
    })
    .populate({
      path: "tweet",
      populate: {
        path: "user",
        model: "User",
      },
      options: { sort: { createdAt: -1 } },
    });

  res
    .status(200)
    .json(new StandardResponse("successfully fetched comments", comments));
};
