import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { env } from "../config/env.js";
import * as schema from "./schema.js";

// Neon serverless driver over WebSockets -> full transaction support
neonConfig.webSocketConstructor = ws;

export const pool = new Pool({ connectionString: env.databaseUrl });

export const db = drizzle(pool, { schema });

export { schema };
