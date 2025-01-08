import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import dotenv from "dotenv";
import { Message } from "../models/messageModel";
import { Tweet } from "../models/tweetModel";
import { Notification } from "../models/notification";
import { User } from "../models/userModel";

dotenv.config();
export const app = express();

export const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  //chat
  socket.on("joinRoom", async ({ chatId }: { chatId: string }) => {
    socket.join(chatId);
    console.log(`User joined room: ${chatId}`);

    const chat = await Message.find({chat: chatId})

    io.to(chatId).emit("previousMessages", chat);
  });

  socket.on(
    "sendMessage",
    async ({
      chatId,
      sender,
      content,
    }: {
      chatId: string;
      sender: string;
      content: string;
    }) => {
      try {
        const message = new Message({
          sender,
          content,
          chat: chatId,
          timestamp: new Date(),
        });
        
        const newMessage = await message.save();

        io.to(chatId).emit("receiveMessage", { newMessage, socketId: chatId });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  );

  //likes
  socket.on("likes", async ({ postId, userId }) => {
    const tweet = await Tweet.findById(postId);
    const updatedLikes = tweet?.likes.length;
    io.emit("updatedLikes", { updatedLikes, postId });

    const notification = new Notification({
      sender: userId,
      receiver: tweet?.user._id,
      type: "like",
      message: "liked your post",
      reference: postId,
      isRead: false,
    });
    const createdNotification = await (
      await notification.save()
    ).populate("sender");

    io.emit("receiveNotification", { createdNotification, userId: createdNotification.receiver });
  });

  //comments
  socket.on("comment", async ({ postId, userId }) => {
    const tweet = await Tweet.findById(postId);
    const updatedComment = tweet?.comments.length && tweet?.comments.length + 1;
    io.emit("updatedComments", { updatedComment, postId });

    const notification = new Notification({
      sender: userId,
      receiver: tweet?.user._id,
      type: "comment",
      message: "commented your post",
      reference: postId,
      isRead: false,
    });
    const createdNotification = await (
      await notification.save()
    ).populate("sender");

    io.emit("receiveNotification", { createdNotification, userId });
  });

  //following and followers

  socket.on(
    "joinProfile",
    async ({
      userName,
      likedUserId,
    }: {
      userName: string;
      likedUserId: string;
    }) => {
      console.log(`User joined profile room: ${userName}`);

      const user = await User.findOne({ userName });
      const isFollow = user?.followers.some(
        (f) => f._id.toString() === likedUserId
      );

      io.emit("previousFollowComment", { isFollow });
    }
  );

  socket.on("followCount", async ({ userId, likedUserId }) => {
    const user = await User.findById(userId);
    const isFollow = user?.followers.some(
      (f) => f._id.toString() === likedUserId
    );

    io.emit("updatedFollowCount", {
      isFollow,
    });
  });

  //notification
  socket.on("joinNotification", async ({ userId }) => {
    socket.join(userId);

    const notification = await Notification.find({ receiver: userId })
      .populate("sender")
      .sort({ createdAt: -1 });
    io.emit("previouseNotification", { notification, userId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
