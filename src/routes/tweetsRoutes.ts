import express from "express";
import {
  createTweets,
  getFollowingUserPost,
  getTweets,
  likedPost,
  savedPost,
  userTweets,
} from "../controllers/tweetsController";
import { errorCatch } from "../utils/error/errorCatch";
import upload from "../middlewares/imageUploader/cluodinary";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.use(verifyToken);

router.post("/", upload.array("media"), errorCatch(createTweets));

router.get("/", errorCatch(getTweets));
router.get("/following", errorCatch(getFollowingUserPost));
router.get("/:userId", errorCatch(userTweets));

router.post("/:postId", errorCatch(likedPost));
router.post("/saved/:postId", errorCatch(savedPost));

export default router;
