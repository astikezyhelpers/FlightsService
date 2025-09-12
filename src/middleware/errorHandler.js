import AppError from "../utils/appError.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.status || "INTERNAL_ERROR",
      message: err.message || "Try again later or contact support",
    }
});
};
export default errorHandler;