import User from "../models/User.js";
import APIFeatures from "../utils/apiFeatures.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import fs from "fs";
import { updateMyProfile as updateMeService } from "../services/users/account/updateMyProfile.js";
import { requestAccountDeletion as requestDelete } from "../services/users/account/requestAccountDeletion.js";
import { confirmAccountDeletion as confirmDeleteService } from "../services/users/account/confirmAccountDeletion.js";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { delCache } from "../utils/redisHelper.js";
import { getSupabaseClient, SUPABASE_BUCKET } from "../config/supabase.js";

const ALLOWED_PROFILE_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
const ALLOWED_PROFILE_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// ================================== //
//  PROFILE PICTURE UPLOAD CONFIG     //
// ================================== //

const profileStorage = multer.memoryStorage();

const profileFileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const isAllowedMime = ALLOWED_PROFILE_IMAGE_MIME_TYPES.includes(file.mimetype);
  const isAllowedExtension = ALLOWED_PROFILE_IMAGE_EXTENSIONS.has(extension);

  if (isAllowedMime && isAllowedExtension) {
    cb(null, true);
  } else {
    cb(new AppError("Only JPG, PNG, and WebP images are allowed", 400), false);
  }
};

export const uploadProfilePic = multer({
  storage: profileStorage,
  fileFilter: profileFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("profilePic");

export const getAllUsers = catchAsync(async (req, res, next) => {
  const feature = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await feature.query;
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  const user = await updateMeService({
    userId: req.user.id,
    body: req.body,
  });

  await delCache(`user:me:${req.user.id}`);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await requestDelete({
    userId: req.user.id,
  });

  res.status(200).json({
    status: "success",
    message: "Confirmation email sent",
  });
});

export const confirmDelete = catchAsync(async (req, res, next) => {
  await confirmDeleteService(req.params.token);

  res.status(200).json({
    status: "success",
    message: "Account has been deactivated successfully",
  });
});

// ================================== //
//   UPLOAD PROFILE PICTURE           //
// ================================== //

export const uploadProfilePicture = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload an image file", 400));
  }

  const extension = path.extname(req.file.originalname || ".jpg") || ".jpg";
  const fileName = `${req.user._id}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extension}`;
  const filePath = `profile/${fileName}`;
  let profilePicUrl = "";

  try {
    const supabase = getSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(filePath);

    profilePicUrl = publicData?.publicUrl || "";
  } catch (error) {
    console.warn("Supabase profile picture upload failed, falling back to local storage:", error.message);

    const localDir = path.join(process.cwd(), "src", "uploads", "profile");
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    const localFilePath = path.join(localDir, fileName);
    fs.writeFileSync(localFilePath, req.file.buffer);

    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
    profilePicUrl = `${backendUrl}/uploads/profile/${fileName}`;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePic: profilePicUrl },
    { new: true, runValidators: false },
  );

  await delCache(`user:me:${req.user._id}`);

  res.status(200).json({
    status: "success",
    data: {
      user,
      profilePic: profilePicUrl,
    },
  });
});

