import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, file) => {
    try {
      const allowedFormats = ["jpg", "jpeg", "png", "mp4", "mp3", "wav"];
      const fileType = file.mimetype.split("/")[0];
      const fileExtension = file.mimetype.split("/")[1];

      if (!allowedFormats.includes(fileExtension)) {
        throw new Error("Unsupported file format");
      }

      return {
        folder: "profiles",
        resource_type:
          fileType === "video" || fileType === "audio" ? "auto" : "image",
        public_id: `profile-${Date.now()}`,
      };
    } catch (error) {
      console.error("Error in Cloudinary params:", error);
      throw error;
    }
  },
});

const upload = multer({ storage: storage });

export default upload;
