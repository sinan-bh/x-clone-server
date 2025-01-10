import { Request, Response } from "express";
import { Notification } from "../models/notification";
import { CustomError } from "../utils/error/customError";
import { StandardResponse } from "../utils/standardResponse";

export const readedNotification = async (req: Request, res: Response) => {

  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new CustomError("notification not find", 404);
  }

  notification.isRead = true;


  await notification.save();

  res.status(200).json(new StandardResponse("notification readed", {}));
};

export const getNotification = async (req: Request, res: Response) => {
  const notification = await Notification.find()
    .populate("sender")
    .sort({ createdAt: -1 });

  if (!notification || notification.length < 1) {
    throw new CustomError("notification not find", 404);
  }

  res
    .status(200)
    .json(new StandardResponse("notification readed", notification));
};
