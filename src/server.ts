import mongoose from "mongoose";
import app from "./app";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  await mongoose.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3t5vk.mongodb.net/bongoDB?appName=Cluster0`
  );

  isConnected = true;
  console.log("MongoDB connected");
};

export default async function handler(req: any, res: any) {
  await connectDB();
  return app(req, res);
}
