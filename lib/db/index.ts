import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DB_URI || process.env.DATABASE_URL;
if (!url) throw new Error("Missing DB_URI");

const sql = neon(url);
export const db = drizzle(sql, { schema });
