import { config } from "dotenv";

config();

const dbConfig = {
  // MongoDB connection string
  db: process.env.DB_URI,
};

export default dbConfig;
