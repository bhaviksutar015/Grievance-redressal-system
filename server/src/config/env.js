import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../.."); // repo root

// Neon CLI writes env vars to <root>/.env.local ; optional overrides in server/.env
config({ path: path.join(rootDir, ".env.local") });
config({ path: path.resolve(__dirname, "../../.env") });

const required = ["DATABASE_URL", "NEON_AUTH_BASE_URL", "NEON_AUTH_JWKS_URL"];
for (const key of required) {
  if (!process.env[key]) {
    // Fail fast with a clear message; never print secret values.
    throw new Error(
      `Missing required environment variable: ${key}. Run \`neon link\`/\`neon deploy\` to generate .env.local.`
    );
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  databaseUrlUnpooled: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  neonAuthBaseUrl: process.env.NEON_AUTH_BASE_URL,
  neonAuthJwksUrl: process.env.NEON_AUTH_JWKS_URL,
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  uploadDir: process.env.UPLOAD_DIR ?? path.resolve(__dirname, "../../uploads"),
  maxUploadBytes: 5 * 1024 * 1024, // 5 MB
};

export const rootEnvPath = path.join(rootDir, ".env.local");
