import mongoose from "mongoose";

export const connectDB = async () => {
	console.log("Connecting to database...");

	const db = await mongoose.connect(process.env.MONGODB_URI);

	console.log("Connected to database!");

	return db;
};
