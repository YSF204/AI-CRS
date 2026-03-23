import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "passwords aren't the same !",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    gender: {
      type: String,
      required: true,
      enum: ["MALE", "FEMALE"],
    },
    role: {
      type: String,
      required: true,
      enum: ["EMPLOYEE", "EMPLOYER", "ADMIN"],
    },
    telephone: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return (
            v.length === 0 ||
            v.every(function (t) {
              return /^\d{10}$/.test(t);
            })
          );
        },
        message: "Telephone number must be a valid 10-digit number",
      },
    },
    authProvider : {
      type : String,
      enum : ["LOCAL", "GOOGLE"],
      default : "LOCAL",
    },
    profilePic : {
      type : String,
      default : "",
    },
    accountStatus: {
      type: String,
      required: true,
      enum: ["ACTIVE", "INACTIVE", "PENDING"],
      default: "ACTIVE",
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    deleteToken: String,
    deleteTokenExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
  },
);

// Virtual property to get full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// hash the password before saving the user model
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  this.passwordConfirm = undefined;
  next();
});

// compare given password with the database hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});

userSchema.methods.createDeleteToken = function () {
  const deleteToken = crypto.randomBytes(32).toString("hex");

  this.deleteToken = crypto
    .createHash("sha256")
    .update(deleteToken)
    .digest("hex");

  this.deleteTokenExpires = Date.now() + 10 * 60 * 1000;

  return deleteToken;
};

const User = mongoose.model("User", userSchema);

export default User;
