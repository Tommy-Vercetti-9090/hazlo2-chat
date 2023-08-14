import mongoose from "mongoose";
import dbConfig from "../Config/dbConfig.js";

let db;
export const connectDB = () => {
  mongoose.set({
    strictQuery: true,
  });
  return mongoose
    .connect(dbConfig.db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((result) => {
      const mongo = mongoose.connection;
      db = mongo;
      console.log("MongoDB Connected...");
    })
    .catch((err) => {
      console.error("MongoDB connection error", err.message);
      process.exit(1);
    });
};

export { db };
