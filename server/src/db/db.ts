import mongoose from "mongoose"
// import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        const db = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000, // 30 seconds timeout for server selection
            socketTimeoutMS: 45000, // 45 seconds timeout for socket operations
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 5, // Maintain at least 5 socket connections
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            retryWrites: true,
            w: 'majority'
        });
        
        console.log("✅ Connected to database:", db.connection.host);
        console.log("📊 Database name:", db.connection.name);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error("❌ MongoDB connection error:", err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn("⚠️  MongoDB disconnected");
        });

        mongoose.connection.on('reconnected', () => {
            console.log("🔄 MongoDB reconnected");
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log("MongoDB connection closed through app termination");
            process.exit(0);
        });

    } catch (error: any) {
        console.error("❌ Error connecting to database:");
        console.error("   Message:", error.message);
        
        if (error.name === 'MongooseServerSelectionError') {
            console.error("\n💡 Common solutions:");
            console.error("   1. Check if your IP address is whitelisted in MongoDB Atlas");
            console.error("   2. Verify your MONGO_URI connection string is correct");
            console.error("   3. Check your network connection");
            console.error("   4. Ensure MongoDB Atlas cluster is running");
        }
        
        // Don't exit immediately in production - allow retries
        if (process.env.NODE_ENV === 'production') {
            console.error("⚠️  Retrying connection in 5 seconds...");
            setTimeout(() => connectDB(), 5000);
        } else {
            process.exit(1);
        }
    }
}

export default connectDB;