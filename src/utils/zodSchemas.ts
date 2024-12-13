import { string, z } from "zod";

const loginSchema = z.object({
  loginField: z.string().nonempty("Email or Username is required"),
  password: z.string(),
});

const registerSchema = z.object({
  name: z.string().min(3),
  userName: z.string(),
  email: z.string().email(),
  password: z.string().min(4),
  image: z.string().optional(),
});

export { loginSchema, registerSchema };
