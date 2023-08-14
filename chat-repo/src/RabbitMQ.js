import amqp from "amqplib";
// import logger from "../logger/logger.js";
import config from "../Config/rabbitMQConfig.js";


    export async function InitiateRabbitMQ() {
      try {
        const channel = (
          await amqp.connect(config.url)
        ).createChannel();
    
        (await channel).assertQueue(config.queue, { durable: true });
    
        console.log("Queue initialized for subscriber");
        // logger.info(`Queue initialized for subscriber :`);
    
        return channel;
      } catch (err) {
        console.log(err);
      }
    }
    

