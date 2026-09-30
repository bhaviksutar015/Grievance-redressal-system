import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

const app = express();

app.set("trust proxy", 1); // behind dev proxy / e2b preview

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin/no-origin (proxied) requests and configured origins
      if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: false, // API auth uses Bearer JWTs, not cookies
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, "0.0.0.0", () => {
  console.log(`[OGRSA] API server listening on http://0.0.0.0:${env.port}`);
  console.log(`[OGRSA] Neon Auth issuer: ${new URL(env.neonAuthBaseUrl).origin}`);
});
