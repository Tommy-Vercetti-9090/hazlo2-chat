import { Server } from "socket.io";
import {
  createConversation,
  getUserConversation,
} from "../Controller/ChatController.js";

export default async (server, channel) => {
  try {
    const io = new Server(server, {
      cors: {
        origin: "*",
      },
    });
    io.on("connection", (socket) => {
      console.log("A client connected", socket.id);
      socket.on("createConversation", async (data) => {
        const { sender, reciever, pageNumber } = data;
        const convoDetails = await createConversation(
          sender,
          reciever,
          pageNumber
        );
        // console.log("-------auhsdadajdm-", convoDetails);
        socket.join(convoDetails.conversationId);
        socket.emit("createConversation", convoDetails);
      });
      socket.on("sendMessage", async (data) => {
        channel.sendToQueue("testQueue", Buffer.from(JSON.stringify(data)));
        // console.log("------", data);
        if (data)
          io.to(data.conversationId).emit("new_message", {
            message: data.message,
            sender: data.sender,
            reciever: data.reciever,
            createdAt: data.createdAt,
          });
      });
      socket.on("getChatThreads", async (data) => {
        console.log("data", data);
        const conversations = await getUserConversation(data);
        console.log("^^^^^", conversations);
        socket.emit("getChatThreads", conversations);
      });
      socket.on("disconnect", () => {
        console.log("A client disconnected", socket.id);
      });
    });
  } catch (error) {
    console.log(error);
  }
};
