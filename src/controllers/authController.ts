import type { NextFunction, Request, Response } from "express";
import { User } from "../models/userModel";
import { CustomError } from "../utils/error/customError";
import { StandardResponse } from "../utils/standardResponse";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//Register user
export const register = async (req: Request, res: Response) => {
  const { name, userName, email, password } = req.body;

  const existingUser = await User.findOne({
    $or: [{ userName: userName }, { email: email }],
  });

  console.log(existingUser);

  if (existingUser) {
    throw new CustomError("Email or UserName already exists", 400);
  }

  const user = new User({
    name,
    userName,
    email,
    password,
  });
  await user.save();

  res.status(201).json(
    new StandardResponse("Registration successfully Completed!", {
      email: user.email,
      firstName: user.name,
      lastName: user.userName,
    })
  );
};

//Login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { loginField, password } = req.body;

  if (!loginField || !password) {
    res
      .status(400)
      .json({ message: "Both loginField and password are required." });
    return;
  }

  const user = await User.findOne({
    $or: [{ userName: loginField }, { email: loginField }],
  });

  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(401).json({ message: "Invalid password." });
    return;
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

  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
    },
  });
};
