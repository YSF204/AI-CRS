import User from "../models/User.js";
import APIFeatures from "../utils/apiFeatures.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { updateMyProfile as updateMeService } from "../services/users/account/updateMyProfile.js";
import { requestAccountDeletion as requestDelete } from "../services/users/account/requestAccountDeletion.js";
import { confirmAccountDeletion as confirmDeleteService } from "../services/users/account/confirmAccountDeletion.js";
import multer from "multer";
import path from "path";
import { delCache } from "../utils/redisHelper.js";

// ================================== //
//  PROFILE PICTURE UPLOAD CONFIG     //
// ================================== //

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/profile");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  },
});

const profileFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files are allowed", 400), false);
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
    protocol: req.protocol,
    host: req.get("host"),
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

  // Build the URL path to the uploaded file
  const profilePicUrl = `/uploads/profile/${req.file.filename}`;

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

