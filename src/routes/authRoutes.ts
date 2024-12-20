import express from "express";
import {
  finalRegistration,
  login,
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
router.post("/login", validateData(loginSchema), errorCatch(login));

export default router;
