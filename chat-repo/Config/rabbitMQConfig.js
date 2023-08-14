import { config } from "dotenv";

config();

const rabbitMqConfig = {
  queue: process.env.RABBIT_QUEUE,
  url: process.env.RABBIT_MQ_CONNECTION_URL,
};

export default rabbitMqConfig;
