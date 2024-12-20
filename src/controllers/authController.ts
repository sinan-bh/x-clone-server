import type { Request, Response } from "express";
import { User } from "../models/userModel";
import { CustomError } from "../utils/error/customError";
import { StandardResponse } from "../utils/standardResponse";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import OTP from "../models/otpModel";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_VERIFICATION_PASS_KEY,
  },
});

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const saveOTP = async (email: string, otp: string) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await OTP.findOneAndDelete({ email });

  // Save the new OTP
  const otpEntry = new OTP({ email, otp, expiresAt });
  await otpEntry.save();
};

const sendOTP = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP for registration is ${otp}`,
    html: `<p>Your OTP for registration is <b>${otp}</b>. It is valid for 5 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

export const register = async (req: Request, res: Response) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new CustomError("Email already exists", 400);
  }

  const otp = generateOTP();
  await saveOTP(email, otp);
  await sendOTP(email, otp);

  res
    .status(200)
    .json(
      new StandardResponse(
        "OTP sent successfully! Please verify to complete registration.",
        { email }
      )
    );
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  console.log(otp);

  const otpEntry = await OTP.findOne({ email });

  console.log(otpEntry, "otp");

  if (!otpEntry || otpEntry.otp !== otp) {
    throw new CustomError("Invalid or expired OTP", 400);
  }

  if (otpEntry.expiresAt < new Date()) {
    throw new CustomError("OTP has expired", 400);
  }

  await OTP.deleteOne({ email });

  res.status(201).json(new StandardResponse(" OTP verified!", {}));
};

export const finalRegistration = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, userName, email, password } = req.body;

  const existingUser = await User.findOne({ userName });
  if (existingUser) {
    throw new CustomError("Email already exists", 400);
  }

  const user = new User({
    name,
    userName,
    email,
    password,
  });
  await user.save();

  res.status(201).json(
    new StandardResponse("Registration successfully completed!", {
      name: user.name,
      email: user.email,
      userName: user.userName,
    })
  );
};
//Login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { loginField, password } = req.body;

  if (!loginField || !password) {
    throw new CustomError("Both loginField and password are required.", 400);
  }

  const user = await User.findOne({
    $or: [{ userName: loginField }, { email: loginField }],
  });

  if (!user) {
    throw new CustomError("User not found.", 404);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new CustomError("Invalid password.", 401);
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.userName,
      email: user.email,
    },
    process.env.JWT_SECRET_KEY || "",
    { expiresIn: "1h" }
  );

  res.status(200).json(
    new StandardResponse("Login successful", {
      token,
      user: {
        id: user._id,
        name: user.name,
        userName: user.userName,
        profilePicture: user.profilePicture,
        email: user.email,
      },
    })
  );
};
