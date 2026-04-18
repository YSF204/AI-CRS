import User from "../models/User.js";
import APIFeatures from "../utils/apiFeatures.js";
import catchAsync from "../utils/catchAsync.js";
import { updateMyProfile as updateMeService } from "../services/users/account/updateMyProfile.js";
import { requestAccountDeletion as requestDelete } from "../services/users/account/requestAccountDeletion.js";
import { confirmAccountDeletion as confirmDeleteService } from "../services/users/account/confirmAccountDeletion.js";
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
