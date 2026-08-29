import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.DB_URI || process.env.DATABASE_URL;
if (!url) throw new Error("Missing DB_URI / DATABASE_URL");

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
