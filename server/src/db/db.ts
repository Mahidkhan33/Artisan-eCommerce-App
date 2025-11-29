import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const DEFAULT_MAX_RETRIES = 5;
const DEFAULT_RETRY_DELAY_MS = 3000;

const maskCredentials = (uri: string) => {
    return uri.replace(/\/\/([^:@]+):([^@]+)@/, "//****:****@");
};

const connectDB = async () => {
    const rawUri = process.env.MONGO_URI || "";
    if (!rawUri) {
        console.error("MONGO_URI is not set. Set it in .env or environment variables.");
        process.exit(1);
    }

    // If MONGO_URI already contains a database (e.g. mongodb://host:27017/dbname)
    // use it as-is. Otherwise append the configured DB_NAME.
    const hasDbInUri = /mongodb(?:\+srv)?:\/\/[^/]+\/.+/.test(rawUri);
    const uri = hasDbInUri ? rawUri : `${rawUri.replace(/\/+$/, "")}/${DB_NAME}`;

    const maxRetries = Number(process.env.DB_MAX_RETRIES || DEFAULT_MAX_RETRIES);
    const baseDelay = Number(process.env.DB_RETRY_DELAY_MS || DEFAULT_RETRY_DELAY_MS);

    const masked = maskCredentials(uri);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Connecting to MongoDB (${attempt}/${maxRetries}) ${masked}`);
            const db = await mongoose.connect(uri, {
                // Recommended options can be added here if needed
            });
            console.log("Connected to database", db.connection.host);
            return;
        } catch (error: any) {
            console.error(`MongoDB connection attempt ${attempt} failed:`, error.message || error);
            if (attempt < maxRetries) {
                const wait = baseDelay * attempt;
                console.log(`Retrying in ${wait}ms...`);
                await new Promise((res) => setTimeout(res, wait));
                continue;
            }
            console.error("All MongoDB connection attempts failed. Make sure MongoDB is running and MONGO_URI is correct.");
            console.error("To start MongoDB with Docker Compose: `docker compose up -d mongodb`");
            process.exit(1);
        }
    }
};

export default connectDB;