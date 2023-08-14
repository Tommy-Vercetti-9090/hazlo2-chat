import { config } from "dotenv";
config();

const stripeConfig = {
  PUBLISHABLE_KEY: process.env.PUBLISHABLE_KEY,
  SECRET_KEY: process.env.SECRET_KEY,
};

export default stripeConfig;
