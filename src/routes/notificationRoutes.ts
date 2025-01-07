import express from "express";
import { errorCatch } from "../utils/error/errorCatch";
import { getNotification, readedNotification } from "../controllers/notificationController";


const router = express.Router();


router.get("/", errorCatch(getNotification))
router.post("/:notificationId", errorCatch(readedNotification));


export default router;
