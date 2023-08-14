import mongoose from "mongoose";

export const checkMongooseId = (id) => mongoose.Types.ObjectId.isValid(id);
