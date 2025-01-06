import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import tweetsRoutes from "./routes/tweetsRoutes";
import chatRoutes from "./routes/chatRoutes";
import commentsRoutes from "./routes/commentRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import { app, server } from "./sockets/socket";

dotenv.config();

const port = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello World!");
});
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/user/", profileRoutes);
app.use("/api/tweets/", tweetsRoutes);
app.use("/api/chats/", chatRoutes);
app.use("/api/comments/", commentsRoutes);
app.use("/api/notification/", notificationRoutes);

mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
