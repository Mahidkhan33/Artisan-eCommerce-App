import mongoose from "mongoose"
// import { DB_NAME } from "../constants.js";


// Cache the connection to reuse in serverless environments
let cachedConnection: typeof mongoose | null = null;

const connectDB = async () => {
    // Return cached connection if it exists and is connected
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    // If already connecting, wait for it
    if (mongoose.connection.readyState === 2) {
        return new Promise((resolve, reject) => {
            mongoose.connection.once('connected', () => {
                cachedConnection = mongoose;
                resolve(mongoose);
            });
            mongoose.connection.once('error', reject);
        });
    }

    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI environment variable is not set");
        }

        const db = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        cachedConnection = db;
        console.log("Connected to database", db.connection.host);
        return db;
    } catch (error) {
        console.error("Error connecting to database:", error);
        cachedConnection = null;
        // Never exit process - always throw so caller can handle
        throw error;
    }
}

export default connectDB;