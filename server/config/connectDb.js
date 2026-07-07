import mongoose from "mongoose";

const connectDb = async () => {
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is missing in environment variables");
        }

        await mongoose.connect(process.env.MONGODB_URL, {
            dbName: process.env.MONGODB_DB_NAME || "Agent",
            maxPoolSize: 20,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log("DataBase Connected");
    } catch (error) {
        console.error("DataBase Error:", error.message);
        process.exit(1);
    }
};

export default connectDb
