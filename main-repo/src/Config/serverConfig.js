import { config } from "dotenv";
config();

const ServerConfig = {
  SERVER_PORT: process.env.SERVER_PORT || 7002,
};

export default ServerConfig;
