import express from "express";
import {
  createTweets,
  getByPost,
  getFollowingUserPost,
  getLikedTweets,
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
router.get("/liked", errorCatch(getLikedTweets));
router.get("/following", errorCatch(getFollowingUserPost));
router.get("/:postId", errorCatch(getByPost));
router.get("/user/:userId", errorCatch(userTweets));
router.post("/likes/:postId", errorCatch(likedPost));
router.post("/saved/:postId", errorCatch(savedPost));

export default router;
