export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFound(_req, _res, next) {
  next(new AppError('Route not found', 404));
}

export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message || 'Something went wrong';

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate value already exists' });
  }

  return res.status(status).json({ success: false, message });
}
