import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: "Endpoint not found" });
}

/**
 * Centralized error handler.
 * Never leaks stack traces, database errors, connection strings or tokens.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    const body = { success: false, message: err.message };
    if (err.details) body.errors = err.details;
    return res.status(err.status).json(body);
  }

  // Multer file-size / file-type errors
  if (err?.name === "MulterError") {
    const msg =
      err.code === "LIMIT_FILE_SIZE"
        ? "File too large. Maximum allowed size is 5 MB."
        : "File upload failed. Please check the file and try again.";
    return res.status(400).json({ success: false, message: msg });
  }

  // Postgres unique violation and other DB errors -> generic safe messages
  if (err?.code === "23505") {
    return res.status(409).json({ success: false, message: "Duplicate record" });
  }

  // Log full error server-side only
  console.error("[UNHANDLED ERROR]", env.nodeEnv === "development" ? err : err?.message);
  return res
    .status(500)
    .json({ success: false, message: "Something went wrong. Please try again later." });
}
