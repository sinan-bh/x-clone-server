import express from "express";
import { createTweets, getTweets } from "../controllers/tweetsController";
import { errorCatch } from "../utils/error/errorCatch";
import { validateData } from "../middlewares/zodValidation";
import { editUserDetails, postTweet } from "../utils/zodSchemas";
import upload from "../middlewares/imageUploader/cluodinary";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.use(verifyToken);

router.post(
  "/",
  validateData(postTweet),
  upload.array("media"),
  errorCatch(createTweets)
);

router.get("/", errorCatch(getTweets));

export default router;
