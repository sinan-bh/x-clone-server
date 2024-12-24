import type { Request, Response } from "express";
import { User } from "../models/userModel";
import { CustomError } from "../utils/error/customError";
import { StandardResponse } from "../utils/standardResponse";
import { Tweet } from "../models/tweetModel";
import { CustomRequest } from "../types/interfaces";
import { model, Types } from "mongoose";
import { Comment } from "../models/commentModel";

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

export const getTweets = async (req: CustomRequest, res: Response) => {
  const tweets = await Tweet.find().populate("user").sort({ createdAt: -1 });

  if (!tweets || tweets.length < 1) {
    throw new CustomError("tweets not found", 404);
  }

  res.status(200).json(new StandardResponse("get all tweets", tweets));
};

export const getFollowingUserPost = async (
  req: CustomRequest,
  res: Response
) => {
  const userId = req.user?.id;

  const user = await User.findById(userId);

  if (!user) {
    throw new CustomError("User not found.", 404);
  }

  const followingIds = user.following;

  const posts = await Tweet.find({ user: { $in: followingIds } })
    .populate("user", "name userName profilePicture")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new StandardResponse("Successfully fetched tweets.", posts));
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

export const likedPost = async (req: CustomRequest, res: Response) => {
  const id = req.user?.id;
  const { postId } = req.params;
  const userId = new Types.ObjectId(id);

  const post = await Tweet.findById(postId);
  const user = await User.findById(userId);

  if (!post) {
    throw new CustomError("Post not found", 404);
  }
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const isLiked = post.likes.some((like) => like.equals(userId));

  if (isLiked) {
    post.likes = post.likes.filter((like) => !like.equals(userId));
    user.likes = user.post.filter((p) => p.toString() !== postId);
  } else {
    post.likes.push(userId);
    user.likes.push(new Types.ObjectId(postId));
  }

  await post.save();
  await user.save();

  res.status(200).json(
    new StandardResponse("Post like status updated successfully", {
      post,
    })
  );
};

export const savedPost = async (req: CustomRequest, res: Response) => {
  console.log("aaaa");

  const id = req.user?.id;
  const { postId } = req.params;

  if (typeof postId !== "string") {
    throw new CustomError("Invalid postId", 400);
  }

  const userId = new Types.ObjectId(id);

  console.log(id);

  const post = await Tweet.findById(new Types.ObjectId(postId));
  const user = await User.findById(userId);

  if (!post) {
    throw new CustomError("Post not found", 404);
  }
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const isSaved = post.saved.some((like) => like.equals(userId));

  if (isSaved) {
    post.saved = post.saved.filter((like) => !like.equals(userId));
    user.saved = user.saved.filter((p) => p.toString() !== postId);
  } else {
    post.saved.push(userId);
    user.saved.push(new Types.ObjectId(postId));
  }

  await post.save();
  await user.save();

  res.status(200).json(
    new StandardResponse("Post saved status updated successfully", {
      post,
    })
  );
};

export const getLikedTweets = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.id;

  const user = await User.findById(userId).populate("likes");

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  res
    .status(200)
    .json(
      new StandardResponse("Successfully fetched user liked tweets", user.likes)
    );
};

export const getByPost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  const post = await Tweet.findById(postId).populate("user");

  if (!post) {
    throw new CustomError("Post not found", 404);
  }

  res
    .status(200)
    .json(new StandardResponse("Successfully fetched Tweet", post));
};

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

  comment.save();

  await User.findByIdAndUpdate(
    userId,
    {
      comments: comment._id,
    },
    { new: true }
  );

  await Tweet.findByIdAndUpdate(
    postId,
    {
      comments: comment._id,
    },
    { new: true }
  );

  res.status(201).json(new StandardResponse("comment created", comment));
};
