import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import type { CustomRequest, JwtDecoded } from "../types/interfaces";
import { CustomError } from "../utils/error/customError";
import { User } from "../models/userModel";

export const verifyToken = async (
  req: CustomRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      throw new CustomError("Not authenticated", 401);
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY || "");
    req.user = verified as JwtDecoded;
    const userExists = await User.findById(req.user.id);
    if (!userExists) {
      throw new CustomError("User not found or blocked", 404);
    }
    next();
  } catch (error) {
    next(error);
  }
};
