import express from "express";
import { errorCatch } from "../utils/error/errorCatch";
import {
  createChat,
  getChat,
  getChatMessages,
  getParticipants,
} from "../controllers/chatController";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.post("/create", errorCatch(createChat));
router.get("/participants", verifyToken, errorCatch(getParticipants));
router.get("/messages/:chatId", errorCatch(getChatMessages));
router.get("/:user1/:user2", errorCatch(getChat));

export default router;
