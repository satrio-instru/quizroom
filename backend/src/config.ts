import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";
const adminPassword = process.env.ADMIN_PASSWORD ?? (isProduction ? undefined : "ADMIN_PASSWORD");

if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD environment variable is required in production.");
}

function parseCorsOrigins() {
    const configuredOrigins = process.env.CORS_ORIGINS
        ?.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    return configuredOrigins && configuredOrigins.length > 0
        ? configuredOrigins
        : ["http://localhost:5173", "http://127.0.0.1:5173"];
}

export const config = {
    port: Number(process.env.PORT ?? 3000),
    nodeEnv,
    adminPassword,
    corsOrigins: parseCorsOrigins(),
    supabaseUrl: process.env.SUPABASE_URL ?? "https://jsnjwzvzjfkmzcjdvdsc.supabase.co",
    supabaseKey: process.env.SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzbmp3enZ6amZrbXpjamR2ZHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDQ1NzAsImV4cCI6MjA5ODEyMDU3MH0.zOryEYPW4zfPMJ4tc9iT_ekfl3Qb77bmEYHR3CVC5j4",
};
