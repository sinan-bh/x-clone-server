import { Request, Response } from "express";
import { Chat } from "../models/messageModel";
import { StandardResponse } from "../utils/standardResponse";
import { CustomError } from "../utils/error/customError";
import { CustomRequest } from "../types/interfaces";

export const getChatMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId).populate("messages");

  res
    .status(200)
    .json(new StandardResponse("successfully get Message", chat?.messages));
};

export const createChat = async (req: Request, res: Response) => {
  const { user1, user2 }: { user1: string; user2: string } = req.body;

  const chat = new Chat({
    participants: [user1, user2],
    messages: [],
  });
  await chat.save();
  res
    .status(201)
    .json(new StandardResponse("created Chat Room", { chatId: chat._id }));
};

export const getChat = async (req: Request, res: Response) => {
  const { user1, user2 } = req.params;

  const chat = await Chat.findOne({
    participants: { $all: [user1, user2] },
  });

  if (!chat) {
    throw new CustomError("Chat not found", 404);
  }

  res
    .status(200)
    .json(
      new StandardResponse("Chat fetched successfully", { chatId: chat._id })
    );
};

export const getParticipants = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.id;

  const chat = await Chat.find({ participants: userId }).populate(
    "participants"
  );

  if (!chat) {
    throw new CustomError("Chat not found");
  }

  const participants = chat.flatMap((p) =>
    p.participants.filter((f) => f._id.toString() !== userId)
  );

  res.status(200).json(
    new StandardResponse("Participants fetched successfully", {
      participants,
    })
  );
};
