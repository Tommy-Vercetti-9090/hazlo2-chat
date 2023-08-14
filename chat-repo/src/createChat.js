import Chat from "../DB/Models/chatModel.js";
export const createChat = async (payload) => {
  try {
    const { sender, conversationId, message } = payload;
    console.log("payload", payload);
    await Chat.create({
      sender,
      conversation: conversationId,
      message,
    });
  } catch (error) {
    console.log("error creating chat", error);
  }
};
