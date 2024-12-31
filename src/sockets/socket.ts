import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import dotenv, { populate } from "dotenv";
import { Chat, Message } from "../models/messageModel";
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

    const chat = await Chat.findById(chatId).populate("messages");

    io.to(chatId).emit("previousMessages", chat?.messages);
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
        await message.save();

        await Chat.findByIdAndUpdate(chatId, {
          $push: { messages: message._id },
        });

        io.to(chatId).emit("receiveMessage", message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  );

  //likes
  socket.on("likes", async ({ postId }) => {
    const tweet = await Tweet.findById(postId);
    const updatedLikes = tweet?.likes.length;
    io.emit("updatedLikes", { updatedLikes, postId });
  });

  //comments
  socket.on("comment", async ({ postId }) => {
    console.log(postId);

    const tweet = await Tweet.findById(postId);
    const updatedComment = tweet?.comments.length && tweet?.comments.length + 1;
    console.log(updatedComment);

    io.emit("updatedComments", { updatedComment, postId });
  });

  //notification
  // socket.on("joinNotification", async ({ userId }) => {
  //   socket.join(userId);

  //   const notification = await User.findById(userId).populate("notification");

  //   io.emit("previouseNotification", { notification, userId });
  // });
  // socket.on(
  //   "notification",
  //   async ({ senderId, userId, type, message, reference }) => {
  //     const notification = new Notification({
  //       user: senderId,
  //       type,
  //       message,
  //       reference,
  //       isRead: false,
  //     });
  //     const createdNotification = await notification.save();

  //     const receiveNotification = await User.findByIdAndUpdate(
  //       userId,
  //       {
  //         $push: { notification: createdNotification._id },
  //       },
  //       { new: true }
  //     );
  //     io.emit("receiveNotification", receiveNotification?.notification);
  //   }
  // );

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
