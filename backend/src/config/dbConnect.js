import mongoose from "mongoose";

const TIMEOUT = 5000;

const connectDB = async () => {
  const CLUSTERS = [
    { uri: process.env.MONGODB_URL_FRANKFURT, label: "Frankfurt (primary)" },
    { uri: process.env.MONGODB_URI, label: "Bahrain (fallback)" },
  ];

  for (const { uri, label } of CLUSTERS) {
    try {
      console.log(`Connecting to MongoDB [${label}]...`);
      await mongoose.connect(uri, {
        dbName: process.env.MONGODB_DB_NAME || "AI_CRS",
        serverSelectionTimeoutMS: TIMEOUT,
        connectTimeoutMS: TIMEOUT,
      });
      console.log(`MongoDB connected [${label}]`);
      return;
    } catch (err) {
      console.warn(`[${label}] failed — ${err.message}`);
      if (mongoose.connection.readyState !== 0)
        await mongoose.disconnect().catch(() => {});
    }
  }

  console.error(" All MongoDB clusters unreachable. Shutting down.");
  process.exit(1);
};

export default connectDB;
