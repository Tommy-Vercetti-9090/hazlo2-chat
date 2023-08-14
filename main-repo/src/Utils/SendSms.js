import twilio from "twilio";
import SmSConfig from "../Config/smsConfig.js";

const Client = twilio(SmSConfig.Account_Sid, SmSConfig.Auth_Token);

export const SendSMS = async (to, smsBody, next) => {
  try {
    await Client.messages
      .create({
        body: smsBody,
        from: "+18645286912",
        to: to,
      })
      .then((message) => {
        console.log(message);
        next;
      });
  } catch (error) {
    console.log(error);
  }
};
