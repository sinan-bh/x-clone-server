import { string, z } from "zod";

const loginSchema = z.object({
  loginField: z.string().nonempty("Email or Username is required"),
  password: z.string(),
});

const registerSchema = z.object({
  email: z.string().email(),
});

const editUserDetails = z.object({
  name: z.string().min(3).optional(),
  userName: z.string().optional(),
  email: z.string().optional(),
  profilePicture: z.string().optional(),
  bio: z.string().optional(),
  bgImage: z.string().optional(),
  location: z.string().optional(),
  web: z.string().optional(),
});

const postTweet = z.object({
  userId: z.string().optional(),
  text: z.string().optional(),
});
export { loginSchema, registerSchema, editUserDetails, postTweet };
