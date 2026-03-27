import User from "../models/User.js";
import CV from "../models/CV.js";
import Job from "../models/Job.js";
import Employer from "../models/Employer.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import sendEmail from "../utils/email.js";

const buildChangeHtml = (changes) => {
  if (!changes.length) {
    return `<p style="margin:0 0 16px 0;">No visible personal fields were changed, but your account was updated by an administrator.</p>`;
  }

  const rows = changes
    .map(
      ({ label, from, to }) => `
      <tr>
        <td style="padding:10px 12px; border:1px solid #e4e4e4; font-weight:700;">${label}</td>
        <td style="padding:10px 12px; border:1px solid #e4e4e4;">${from}</td>
        <td style="padding:10px 12px; border:1px solid #e4e4e4;">${to}</td>
      </tr>`,
    )
    .join("");

  return `
    <table style="width:100%; border-collapse:collapse; margin-top:16px;">
      <thead>
        <tr>
          <th style="padding:10px 12px; border:1px solid #e4e4e4; text-align:left; background:#f8f8f8;">Field</th>
          <th style="padding:10px 12px; border:1px solid #e4e4e4; text-align:left; background:#f8f8f8;">Previous</th>
          <th style="padding:10px 12px; border:1px solid #e4e4e4; text-align:left; background:#f8f8f8;">Updated</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
};

const buildUpdateEmailHtml = (updatedUser, changes) => `
  <div style="font-family:Arial,Helvetica,sans-serif; color:#111; background:#f4f6f8; padding:24px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:20px; border:1px solid #e7e8ea; overflow:hidden;">
      <div style="padding:32px; background:#101827; color:#ffffff; text-align:center;">
        <h1 style="margin:0; font-size:28px;">Account Update Notification</h1>
      </div>
      <div style="padding:32px;">
        <p style="font-size:16px; line-height:1.7; margin:0 0 18px 0;">Hello ${updatedUser.firstName},</p>
        <p style="font-size:15px; line-height:1.7; margin:0 0 18px 0;">
          Your AI-CRS account was updated by an administrator. Below is a summary of the changes we applied to your profile.
        </p>
        ${buildChangeHtml(changes)}
        <p style="font-size:15px; line-height:1.7; margin:24px 0 0 0;">
          If you did not request these changes, please contact support immediately.
        </p>
      </div>
      <div style="padding:24px; background:#f8fafc; color:#556072; font-size:13px;">
        <p style="margin:0;">AI-CRS Support Team</p>
      </div>
    </div>
  </div>`;

const buildDeleteEmailHtml = (targetUser) => `
  <div style="font-family:Arial,Helvetica,sans-serif; color:#111; background:#f4f6f8; padding:24px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:20px; border:1px solid #e7e8ea; overflow:hidden;">
      <div style="padding:32px; background:#ff4d4f; color:#ffffff; text-align:center;">
        <h1 style="margin:0; font-size:28px;">Account Deactivated</h1>
      </div>
      <div style="padding:32px;">
        <p style="font-size:16px; line-height:1.7; margin:0 0 18px 0;">Hello ${targetUser.firstName},</p>
        <p style="font-size:15px; line-height:1.7; margin:0 0 18px 0;">
          Your AI-CRS account was deactivated by an administrator. This is a soft deactivation and your profile has been locked from signing in.
        </p>
        <div style="border:1px solid #edf2f7; border-radius:12px; padding:18px; background:#fff7f7;">
          <p style="margin:0 0 8px 0; font-weight:700;">Account details</p>
          <p style="margin:0;">Name: ${targetUser.firstName} ${targetUser.lastName}</p>
          <p style="margin:6px 0 0 0;">Email: ${targetUser.email}</p>
          <p style="margin:6px 0 0 0;">Role: ${targetUser.role}</p>
        </div>
        <p style="font-size:15px; line-height:1.7; margin:24px 0 0 0;">
          If you believe this was done in error, please contact support right away.
        </p>
      </div>
      <div style="padding:24px; background:#f8fafc; color:#556072; font-size:13px;">
        <p style="margin:0;">AI-CRS Support Team</p>
      </div>
    </div>
  </div>`;

const buildCreateEmailHtml = (user) => `
  <div style="font-family:Arial,Helvetica,sans-serif; color:#111; background:#f4f6f8; padding:24px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:20px; border:1px solid #e7e8ea; overflow:hidden;">
      <div style="padding:32px; background:#0b79d0; color:#ffffff; text-align:center;">
        <h1 style="margin:0; font-size:28px;">Welcome to AI-CRS</h1>
      </div>
      <div style="padding:32px;">
        <p style="font-size:16px; line-height:1.7; margin:0 0 18px 0;">Hello ${user.firstName},</p>
        <p style="font-size:15px; line-height:1.7; margin:0 0 18px 0;">
          Your account has been successfully created by an administrator. You can now log in using your email address.
        </p>
        <div style="border:1px solid #edf2f7; border-radius:12px; padding:18px; background:#f0f7ff;">
          <p style="margin:0 0 8px 0; font-weight:700;">Account details</p>
          <p style="margin:0;">Name: ${user.firstName} ${user.lastName}</p>
          <p style="margin:6px 0 0 0;">Email: ${user.email}</p>
          <p style="margin:6px 0 0 0;">Role: ${user.role}</p>
        </div>
        <p style="font-size:15px; line-height:1.7; margin:24px 0 0 0;">
          Keep this email for reference. If you have any questions, contact support.
        </p>
      </div>
      <div style="padding:24px; background:#f8fafc; color:#556072; font-size:13px;">
        <p style="margin:0;">AI-CRS Support Team</p>
      </div>
    </div>
  </div>`;

// ================================== //
//        GET PLATFORM STATS          //
// ================================== //

export const getStats = catchAsync(async (req, res, next) => {
  const [
    totalUsers,
    totalEmployees,
    totalEmployers,
    totalAdmins,
    pendingEmployers,
    activeUsers,
    inactiveUsers,
    totalCVs,
    totalJobs,
    openJobs,
    totalEmployerProfiles,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "EMPLOYEE" }),
    User.countDocuments({ role: "EMPLOYER" }),
    User.countDocuments({ role: "ADMIN" }),
    User.countDocuments({ role: "EMPLOYER", accountStatus: "PENDING" }),
    User.countDocuments({ accountStatus: "ACTIVE" }),
    User.countDocuments({ accountStatus: "INACTIVE" }),
    CV.countDocuments(),
    Job.countDocuments(),
    Job.countDocuments({ status: "OPEN" }),
    Employer.countDocuments(),
  ]);

  // Recent registrations — last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  // Recent jobs — last 7 days
  const recentJobs = await Job.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        employees: totalEmployees,
        employers: totalEmployers,
        admins: totalAdmins,
        active: activeUsers,
        inactive: inactiveUsers,
        pendingApproval: pendingEmployers,
        recentRegistrations: recentUsers,
      },
      cvs: {
        total: totalCVs,
      },
      jobs: {
        total: totalJobs,
        open: openJobs,
        recentlyPosted: recentJobs,
      },
      employers: {
        total: totalEmployerProfiles,
      },
    },
  });
});

// ================================== //
//    UPDATE USER ACCOUNT STATUS      //
// ================================== //

export const updateUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { accountStatus } = req.body;

  const validStatuses = ["ACTIVE", "INACTIVE", "PENDING"];
  if (!accountStatus || !validStatuses.includes(accountStatus)) {
    return next(
      new AppError(
        `accountStatus must be one of: ${validStatuses.join(", ")}`,
        400,
      ),
    );
  }

  // Prevent admin from modifying another admin's status
  const targetUser = await User.findById(id);
  if (!targetUser) {
    return next(new AppError("User not found", 404));
  }

  if (targetUser.role === "ADMIN") {
    return next(new AppError("Cannot modify the status of another admin", 403));
  }

  const updated = await User.findByIdAndUpdate(
    id,
    { accountStatus },
    { new: true, runValidators: true },
  ).select("-password");

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
  const { role, accountStatus, search, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (role) filter.role = role.toUpperCase();
  if (accountStatus) filter.accountStatus = accountStatus.toUpperCase();
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(
        "-password -passwordResetToken -passwordResetExpires -deleteToken -deleteTokenExpires",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// ================================== //
//       CREATE A NEW USER          //
// ================================== //

export const createUser = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
    gender,
    role,
    telephone,
    age,
    company,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !passwordConfirm ||
    !gender ||
    !role ||
    age === undefined
  ) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const validRoles = ["EMPLOYEE", "EMPLOYER", "ADMIN"];
  const validGenders = ["MALE", "FEMALE"];

  if (!validRoles.includes(role.toUpperCase())) {
    return next(
      new AppError(
        "Invalid role. Role must be EMPLOYEE, EMPLOYER, or ADMIN",
        400,
      ),
    );
  }

  if (!validGenders.includes(gender.toUpperCase())) {
    return next(
      new AppError("Invalid gender. Gender must be MALE or FEMALE", 400),
    );
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError("User with this email already exists", 400));
  }

  const accountStatus =
    role.toUpperCase() === "EMPLOYER" ? "PENDING" : "ACTIVE";

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    passwordConfirm,
    gender: gender.toUpperCase(),
    role: role.toUpperCase(),
    telephone: telephone || [],
    age,
    accountStatus,
  });

  let employer = null;
  if (role.toUpperCase() === "EMPLOYER" && company) {
    employer = await Employer.create({
      userId: user._id,
      company,
    });
  }

  const safeUser = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    gender: user.gender,
    age: user.age,
    telephone: user.telephone,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt,
  };

  try {
    await sendEmail({
      email: user.email,
      subject: "Your AI-CRS account has been created",
      text: `Hello ${user.firstName},\n\nYour account has been created by an administrator. You can now log in with this email address. If you need help setting your password or accessing the system, please contact support.\n\nThanks,\nThe Team`,
      html: buildCreateEmailHtml(user),
    });
  } catch (emailError) {
    console.error("User creation notification failed:", emailError);
  }

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: { user: safeUser, employer },
  });
});

export const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).select(
    "-password -passwordResetToken -passwordResetExpires -deleteToken -deleteTokenExpires",
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const employer =
    user.role === "EMPLOYER" ? await Employer.findOne({ userId: id }) : null;

  res.status(200).json({
    success: true,
    data: {
      user,
      employer,
    },
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    email,
    gender,
    role,
    telephone,
    age,
    accountStatus,
    company,
    password,
    passwordConfirm,
  } = req.body;

  const validRoles = ["EMPLOYEE", "EMPLOYER", "ADMIN"];
  const validGenders = ["MALE", "FEMALE"];

  const user = await User.findById(id);
  const existingEmployer = await Employer.findOne({ userId: id });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const updates = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (email !== undefined) updates.email = email.toLowerCase();
  if (gender !== undefined) {
    if (!validGenders.includes(gender.toUpperCase())) {
      return next(
        new AppError("Invalid gender. Gender must be MALE or FEMALE", 400),
      );
    }
    updates.gender = gender.toUpperCase();
  }
  if (role !== undefined) {
    if (!validRoles.includes(role.toUpperCase())) {
      return next(
        new AppError(
          "Invalid role. Role must be EMPLOYEE, EMPLOYER, or ADMIN",
          400,
        ),
      );
    }
    updates.role = role.toUpperCase();
  }
  if (telephone !== undefined) updates.telephone = telephone || [];
  if (age !== undefined) updates.age = Number(age);
  if (accountStatus !== undefined) updates.accountStatus = accountStatus;

  let updatedUser;
  if (password || passwordConfirm) {
    if (!password || !passwordConfirm) {
      return next(
        new AppError(
          "To update the password, both password and passwordConfirm are required",
          400,
        ),
      );
    }
    if (password !== passwordConfirm) {
      return next(new AppError("Passwords do not match", 400));
    }

    Object.assign(user, updates);
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();
    updatedUser = await User.findById(id).select(
      "-password -passwordResetToken -passwordResetExpires -deleteToken -deleteTokenExpires",
    );
  } else {
    updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select(
      "-password -passwordResetToken -passwordResetExpires -deleteToken -deleteTokenExpires",
    );
  }

  let updatedEmployer = null;
  const shouldHandleEmployer =
    (updates.role === "EMPLOYER" || user.role === "EMPLOYER") && company;

  if (shouldHandleEmployer) {
    if (existingEmployer) {
      updatedEmployer = await Employer.findByIdAndUpdate(
        existingEmployer._id,
        { company },
        { new: true, runValidators: true },
      );
    } else {
      updatedEmployer = await Employer.create({
        userId: id,
        company,
      });
    }
  }

  const previousValues = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    gender: user.gender,
    age: user.age,
    telephone: (user.telephone || []).join(", "),
    accountStatus: user.accountStatus,
  };

  const updatedValues = {
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    role: updatedUser.role,
    gender: updatedUser.gender,
    age: updatedUser.age,
    telephone: (updatedUser.telephone || []).join(", "),
    accountStatus: updatedUser.accountStatus,
  };

  const emailChanges = Object.keys(updatedValues).reduce((acc, key) => {
    if (previousValues[key] !== updatedValues[key]) {
      acc.push({
        label: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        from: previousValues[key] ?? "—",
        to: updatedValues[key] ?? "—",
      });
    }
    return acc;
  }, []);

  if (password || passwordConfirm) {
    emailChanges.push({
      label: "Password",
      from: "••••••",
      to: "Updated",
    });
  }

  if (existingEmployer || updatedEmployer) {
    const previousCompany = existingEmployer?.company || {};
    const newCompany = updatedEmployer?.company || {};
    const companyFields = [
      ["name", "Company Name"],
      ["license", "Company License"],
      ["contactEmail", "Contact Email"],
      ["website", "Website"],
    ];

    companyFields.forEach(([field, label]) => {
      const before = previousCompany[field] || "—";
      const after = newCompany[field] || "—";
      if (before !== after) {
        emailChanges.push({ label, from: before, to: after });
      }
    });
  }

  const emailHtml = buildUpdateEmailHtml(updatedUser, emailChanges);
  const emailText = emailChanges.length
    ? `Hello ${updatedUser.firstName},\n\nYour account was updated by an administrator. The following fields changed:\n${emailChanges
        .map((change) => `${change.label}: ${change.from} -> ${change.to}`)
        .join(
          "\n",
        )}\n\nIf you did not request this change, please contact support immediately.`
    : `Hello ${updatedUser.firstName},\n\nYour account was updated by an administrator. If you did not request this change, please contact support immediately.`;

  try {
    await sendEmail({
      email: updatedUser.email,
      subject: "Your account has been updated",
      text: emailText,
      html: emailHtml,
    });
  } catch (emailError) {
    console.error("User update notification failed:", emailError);
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: {
      user: updatedUser,
      employer: updatedEmployer,
    },
  });
});

// ================================== //
//       DELETE A USER              //
// ================================== //

export const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return next(new AppError("User not found", 404));
  }

  if (targetUser.role === "ADMIN") {
    return next(new AppError("Cannot delete another admin", 403));
  }

  targetUser.active = false;
  await targetUser.save({ validateBeforeSave: false });

  const emailText = `Hello ${targetUser.firstName},\n\nYour account has been deactivated by an administrator. If you believe this was a mistake, please contact support immediately.\n\nThanks,\nThe Team`;
  const emailHtml = buildDeleteEmailHtml(targetUser);

  try {
    await sendEmail({
      email: targetUser.email,
      subject: "Your account has been deleted",
      text: emailText,
      html: emailHtml,
    });
  } catch (emailError) {
    console.error("User deletion notification failed:", emailError);
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
