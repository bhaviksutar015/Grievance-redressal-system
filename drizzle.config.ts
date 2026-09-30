import "dotenv/config";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Neon CLI writes environment variables (DATABASE_URL, ...) to .env.local
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Run `neon link` / `neon deploy` (it writes .env.local) or export DATABASE_URL."
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/src/db/schema.js",
  out: "./drizzle",
  dbCredentials: {
    // Unpooled connection is recommended for migrations
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
