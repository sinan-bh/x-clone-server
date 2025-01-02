import express from "express";
import {
  finalRegistration,
  googleAuth,
  login,
  refreshToken,
  register,
  verifyOTP,
} from "../controllers/authController";
import { errorCatch } from "../utils/error/errorCatch";
import { validateData } from "../middlewares/zodValidation";
import { loginSchema, registerSchema } from "../utils/zodSchemas";

const router = express.Router();

//Register user
router.post("/register", validateData(registerSchema), errorCatch(register));
router.post("/verify-otp", errorCatch(verifyOTP));
router.post("/final-submission", errorCatch(finalRegistration));
router.post("//refresh", errorCatch(refreshToken));
router.post("/login", validateData(loginSchema), errorCatch(login));
router.post("/google-auth", errorCatch(googleAuth));

export default router;
