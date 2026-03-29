import multer from "multer";
import path from "path";
import fs from "fs";

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = "uploads/profiles";
    if (req.originalUrl.includes("/services")) {
      dest = "uploads/services";
    } else if (req.originalUrl.includes("/ads")) {
      dest = "uploads/advertisements";
    } else if (req.originalUrl.includes("/delivery")) {
      dest = "uploads/delivery";
    }

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  }
});

// File filter (only images)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

export const uploadAny = upload.any();

export default upload;
