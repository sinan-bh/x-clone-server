import express from "express";
import { errorCatch } from "../utils/error/errorCatch";
import { createComment, getComments } from "../controllers/commentController";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.get("/", verifyToken, errorCatch(getComments));
router.post("/create/:postId", verifyToken, errorCatch(createComment));

export default router;
