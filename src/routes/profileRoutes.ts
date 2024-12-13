import express from "express";
import {
  userProfile,
  updateUserProfile,
} from "../controllers/profileController";
import { errorCatch } from "../utils/error/errorCatch";
import { validateData } from "../middlewares/zodValidation";
import { editUserDetails } from "../utils/zodSchemas";

const router = express.Router();

router.get("/:userName", errorCatch(userProfile));
router.put(
  "/:userName",
  validateData(editUserDetails),
  errorCatch(updateUserProfile)
);

export default router;
