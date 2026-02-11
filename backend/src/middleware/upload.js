import multer from "multer";
import path from "path";
import AppError from "../utils/appError.js";

// ================================== //
//     MULTER STORAGE CONFIG          //
// ================================== //

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/cv");
  },
  filename: (req, file, cb) => {
    // userId-timestamp.extension
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  },
});

// ================================== //
//     FILE FILTER ( PDF ONLY )       //
// ================================== //

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new AppError("Only PDF files are allowed", 400), false);
  }
};

// ================================== //
//     MULTER UPLOAD INSTANCE         //
// ================================== //

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

// middleware to upload a single CV file
export const uploadCV = upload.single("cvFile");

export default upload;
