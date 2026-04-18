import catchAsync from "../utils/catchAsync.js";
import { getPlatformStats } from "../services/admin/stats/getPlatformStats.js";
import { updateUserAccountStatus } from "../services/admin/users/updateUserAccountStatus.js";
import { getAdminUsersPage } from "../services/admin/users/getAdminUsersPage.js";
import { createAdminManagedUser } from "../services/admin/users/createAdminManagedUser.js";
import { getAdminUserById } from "../services/admin/users/getAdminUserById.js";
import { updateAdminManagedUser } from "../services/admin/users/updateAdminManagedUser.js";
import { deactivateUserByAdmin } from "../services/admin/users/deactivateUserByAdmin.js";

// ================================== //
//        GET PLATFORM STATS          //
// ================================== //

export const getStats = catchAsync(async (req, res, next) => {
  const stats = await getPlatformStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// ================================== //
//    UPDATE USER ACCOUNT STATUS      //
// ================================== //

export const updateUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updated = await updateUserAccountStatus({
    userId: id,
    accountStatus: req.body.accountStatus,
  });

  res.status(200).json({
    success: true,
    message: `User status updated to ${accountStatus}`,
    data: { user: updated },
  });
});

// ================================== //
//     GET ALL USERS (ADMIN VIEW)     //
// ================================== //

export const getAllUsers = catchAsync(async (req, res, next) => {
  const result = await getAdminUsersPage({ query: req.query });

  res.status(200).json({
    success: true,
    data: {
      users: result.users,
      pagination: result.pagination,
    },
  });
});

// ================================== //
//       CREATE A NEW USER          //
// ================================== //

export const createUser = catchAsync(async (req, res, next) => {
  const result = await createAdminManagedUser({ body: req.body });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: { user: result.user, employer: result.employer },
  });
});

export const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const result = await getAdminUserById({ userId: id });

  res.status(200).json({
    success: true,
    data: {
      user: result.user,
      employer: result.employer,
    },
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const result = await updateAdminManagedUser({
    userId: req.params.id,
    body: req.body,
  });

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: {
      user: result.user,
      employer: result.employer,
    },
  });
});

// ================================== //
//       DELETE A USER              //
// ================================== //

export const deleteUser = catchAsync(async (req, res, next) => {
  await deactivateUserByAdmin({ userId: req.params.id });

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
