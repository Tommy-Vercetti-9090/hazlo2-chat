import chatModel from "../DB/Model/chatModel.js";
import conversationModel from "../DB/Model/conversationModel.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { Types, mongoose } from "mongoose";
export const createConversation = async (sender, reciever, pageNumber = 1) => {
  try {
    const findConvo = await conversationModel.findOne({
      $or: [
        {
          $and: [
            { sender: Types.ObjectId(sender) },
            { reciever: Types.ObjectId(reciever) },
          ],
        },
        {
          $and: [
            { sender: Types.ObjectId(reciever) },
            { reciever: Types.ObjectId(sender) },
          ],
        },
      ],
    });
    if (!findConvo) {
      const createConvo = await new conversationModel({
        sender: sender,
        reciever: reciever,
      }).save();
      return { conversationId: createConvo._id, messages: "" };
    } else {
      console.log("hello", findConvo);
      const getMessages = await chatModel
        .find({
          conversation: findConvo._id,
        })

        .sort({ ["createdAt"]: 1 })
        .skip((Number(pageNumber) - 1) * 10)
        .limit(10);
      return { messages: getMessages, conversationId: findConvo._id };
    }
  } catch (error) {
    console.log(error);
    console.log("Error creating conversation");
  }
};

export const getUserConversation = async (payload) => {
  try {
    const { userId } = payload;
    let findConvo = await conversationModel.find({
      $or: [{ sender: userId }, { reciever: userId }],
    });
    if (findConvo.length === 0) {
      return {
        message: "No matched conversations found",
      };
    }
    findConvo = Promise.all(findConvo.map(async (e) => {
      
      if (e.sender.toString() == userId) {
        console.log("hi");
        return await conversationModel.populate(findConvo, [
          {
            path: "reciever",
            select: "fullName image",
            populate: {
              path: "image",
              select: "mediaUrl",
            },
          },
        ]);
      }
      return await conversationModel.populate(findConvo, [
        {
          path: "sender",
          select: "fullName image",
          populate: {
            path: "image",
            select: "mediaUrl",
          },
        },
      ]);
    }));

    return findConvo;
  } catch (error) {
    console.log("Error creating conversation");
  }
};
