export const responseMiddleware = (req, res, next) => {
  res.success = (data, message = "Success") => {
    res.json({
      status: "success",
      message,
      data,
      traceId: req.traceId,
    });
  };

  res.error = (error, statusCode = 500) => {
    res.status(statusCode).json({
      status: "error",
      message: error.message || "An error occurred",
      traceId: req.traceId,
    });
  };

  next();
};
