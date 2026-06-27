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
};
