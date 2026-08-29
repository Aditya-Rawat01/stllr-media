import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DB_URI || process.env.DATABASE_URL || "";

function createDb() {
  if (!url) {
    // ponytail: dummy that throws only when used, allows `next build` without DB_URI in CI
    const err = () => {
      throw new Error("Missing DB_URI — set DB_URI in .env for runtime");
    };
    return {
      select: err,
      insert: err,
      delete: err,
      update: err,
      execute: err,
      query: err,
    } as unknown as ReturnType<typeof drizzle>;
  }
  return drizzle(neon(url), { schema });
}

export const db = createDb();
