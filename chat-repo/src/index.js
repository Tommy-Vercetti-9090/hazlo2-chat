import { connectDB } from "../DB/connection.js";
import { InitiateRabbitMQ } from "./RabbitMQ.js";
import config from "../Config/rabbitMQConfig.js";
import { createChat } from "./createChat.js";

(async () => {
  await connectDB();
  const queue = await InitiateRabbitMQ();
  queue.consume(
    config.queue,
    async (message) => {
      console.log(`Received message: ${message.content}`);
      await createChat(JSON.parse(message.content));
    },
    { noAck: true }
  );
})();
