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
        userName: user.userName,
        email: user.email,
      },
    })
  );
};
