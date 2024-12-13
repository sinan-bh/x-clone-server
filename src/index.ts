import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

dotenv.config();

const port = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello World!");
});
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
