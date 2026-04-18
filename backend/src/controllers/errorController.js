import AppError from "./../utils/appError.js";
import { handleCastError } from "../services/errors/transformers/handleCastError.js";
import { handleDuplicateFieldError } from "../services/errors/transformers/handleDuplicateFieldError.js";
import { handleValidationError } from "../services/errors/transformers/handleValidationError.js";
import { handleInvalidJwtError } from "../services/errors/transformers/handleInvalidJwtError.js";
import { handleExpiredJwtError } from "../services/errors/transformers/handleExpiredJwtError.js";
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR", err);

    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

const normalizeProductionError = (error) => {
  if (error.name === "CastError") return handleCastError(error);
  if (error.code === 11000) return handleDuplicateFieldError(error);
  if (error.name === "ValidationError") return handleValidationError(error);
  if (error.name === "JsonWebTokenError") return handleInvalidJwtError();
  if (error.name === "TokenExpiredError") return handleExpiredJwtError();

  return error;
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    const error = normalizeProductionError({ ...err });
    sendErrorProd(error, res);
  }
};

export default errorHandler;
