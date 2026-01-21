import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/services");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${file.originalname.replace(/\s+/g, "")}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

const upload = multer({ storage, fileFilter});

export default upload;
