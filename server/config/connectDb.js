import mongoose from "mongoose";

const normalizeEnvValue = (value) => {
    if (typeof value !== "string") return "";

    const trimmed = value.trim();
    // Render env values may accidentally include wrapping quotes.
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return trimmed.slice(1, -1).trim();
    }

    return trimmed;
};

const connectDb = async () => {
    try {
        const mongoUrl = normalizeEnvValue(process.env.MONGODB_URL);

        if (!mongoUrl) {
            throw new Error("MONGODB_URL is missing in environment variables");
        }

        if (!(mongoUrl.startsWith("mongodb://") || mongoUrl.startsWith("mongodb+srv://"))) {
            throw new Error("MONGODB_URL must start with mongodb:// or mongodb+srv://");
        }

        await mongoose.connect(mongoUrl, {
            dbName: process.env.MONGODB_DB_NAME || "Agent",
            maxPoolSize: 20,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log("DataBase Connected");
    } catch (error) {
        console.error("DataBase Error:", error.message);
        console.error("Hint: In Render, set MONGODB_URL without quotes and with a valid mongodb:// or mongodb+srv:// URI.");
        process.exit(1);
    }
};

export default connectDb
