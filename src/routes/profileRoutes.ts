import express from "express";
import {
  userProfile,
  updateUserProfile,
  followUser,
  followingFollowers,
  getAllUsers,
  searchUsers,
} from "../controllers/profileController";
import { errorCatch } from "../utils/error/errorCatch";
import { validateData } from "../middlewares/zodValidation";
import { editUserDetails } from "../utils/zodSchemas";
import upload from "../middlewares/imageUploader/cluodinary";

const router = express.Router();

router.get("/", errorCatch(getAllUsers));
router.get("/search", errorCatch(searchUsers));
router.get("/:userName", errorCatch(userProfile));
router.put(
  "/:userName",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "bgImage", maxCount: 1 },
  ]),
  validateData(editUserDetails),
  errorCatch(updateUserProfile)
);

router.post("/:id", errorCatch(followUser));
router.get("/:userName", errorCatch(followingFollowers));

export default router;
