import jwt from "jsonwebtoken";
import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "./../utils/appError.js";

// ================================== //
//            Gen JWT TOKEN           //
// ================================== //

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ================================== //
//       REGISTER NEW USER            //
// ================================== //

export const register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, gender, role, telephone, age } =
    req.body;

  // make sure that all the fields are provided
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !gender ||
    !role ||
    !age
  ) {
    return next(new AppError("Please provide all the required fields", 400));
  }

  // validate the role :
  const validRoles = ["EMPLOYEE", "EMPLOYER", "ADMIN"];
  if (!validRoles.includes(role)) {
    return next(
      new AppError(
        "Invalid role. Role must be one of EMPLOYEE, EMPLOYER, ADMIN",
        400,
      ),
    );
  }

  // check if the user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError("User with this email already exists", 400));
  }

  // if no issues , create the user

  // but before creating the user , we need to determine the account status based on the role
  // if the role is EMPLOYEE , then the account status will be ACTIVE
  // if the role is EMPLOYER , then the account status will be PENDING ( waiting for admin approval )

  const accountStatus = role === "EMPLOYER" ? "PENDING" : "ACTIVE";

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    gender,
    role,
    telephone: telephone || [],
    age,
    accountStatus, // it will be based on the role
  });

  // Gen token for the user
  const token = generateToken(user._id);

  // now we return the user data without the password

  const userResponse = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    gender: user.gender,
    age: user.age,
    telephone: user.telephone,
    accountStatus: user.accountStatus,
  };

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: userResponse,
      token: token,
    },
  });
});

// ================================== //
//            LOGIN USER              //
// ======================.============ //
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // make sure that all the fields are provided

  if (!email || !password) {
    return next(new AppError("Please provide all required fields", 400));
  }

  // find the user by the email
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  // check if the Account is ACTIVE or not

  if (user.accountStatus !== "ACTIVE") {
    return next(
      new AppError(
        `Account is not active. Current status: ${user.accountStatus}`,
        403,
      ),
    );
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return next(new AppError("Invalid email or password", 401));
  }
  // Gen token for the user
  const token = generateToken(user._id);

  // return user
  const userResponse = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    gender: user.gender,
    age: user.age,
    telephone: user.telephone,
    accountStatus: user.accountStatus,
  };

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    data: {
      user: userResponse,
    },
  });
});

// ================================== //
//       GET CURRENT LOGGED IN USER   //
// ================================== //

export const getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return next(new AppError("User not Found", 404));
  }
  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

// ================================== //
//       LOGOUT USER                  //
// ================================== //

export const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.log("Error in user logout:", error);
    res.status(500).json({
      success: false,
      message: "Logout has failed",
      error: error.message,
    });
  }
};
