import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

/**
 * Local-development file storage (documented cloud strategy in README).
 * - PDF / JPG / JPEG / PNG only
 * - 5 MB limit
 * - random safe filenames (never trust the client filename)
 * - metadata stored in PostgreSQL, binary on disk
 */
const ALLOWED = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

fs.mkdirSync(env.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const ext = ALLOWED[file.mimetype];
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const extOk = [".pdf", ".jpg", ".jpeg", ".png"].includes(ext);
  const mimeOk = Object.keys(ALLOWED).includes(file.mimetype);
  if (!extOk || !mimeOk) {
    return cb(
      ApiError.badRequest("Only PDF, JPG, JPEG or PNG files are allowed (max 5 MB).")
    );
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxUploadBytes, files: 3 },
});
