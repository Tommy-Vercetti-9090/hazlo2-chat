import keyGen from "./keyGen.js";
import * as jose from "jose";
import dotenv from "dotenv";
import DeviceModel from "../DB/Model/deviceModel.js";
import UserModel from "../DB/Model/userModel.js";

const envConfig = dotenv.config({ path: "./.env" }).parsed;

const endpoint = envConfig ? envConfig["ENDPOINT"] : "localhost";
const { publicKey, privateKey } = keyGen;

export const tokenGen = async (user, tokenType, deviceToken) => {
  return await new jose.EncryptJWT({
    uid: user._id,
    ref: tokenType === tokenType.refresh ? user.publicId : "",
    deviceToken: deviceToken ? deviceToken : "",
    userType: user.userType,
    tokenType: tokenType ? tokenType : tokenType.auth,
  })
    .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A256GCM" })
    .setIssuedAt(new Date().getTime())
    .setIssuer(endpoint)
    .setAudience(endpoint)
    .setExpirationTime(tokenType === "refresh" ? "30d" : "2d")
    .encrypt(publicKey);
};
export const generateToken = async (data) => {
  const { _id, tokenType, deviceId, isTemporary, userType } = data;
  if (!_id || !deviceId) {
    return {
      error: {
        message: "Invalid arguments to generateToken",
      },
    };
  }
  return await new jose.EncryptJWT({
    uid: _id,
    ref: _id,
    deviceId: deviceId ? deviceId : "",
    userType: userType,
    tokenType: tokenType ? tokenType : "auth",
    isTemporary: isTemporary ? isTemporary : false,
  })
    .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A256GCM" })
    .setIssuedAt(new Date().getTime())
    .setIssuer(endpoint)
    .setAudience(endpoint)
    .setExpirationTime(
      tokenType === "refresh" && !isTemporary
        ? "30d"
        : !isTemporary
        ? "2d"
        : "60m"
    )
    .encrypt(publicKey);
};
export const joseJwtDecrypt = async (token, PK = privateKey) => {
  try {
    const decryptedToken = await jose.jwtDecrypt(token, PK);
    return decryptedToken;
  } catch (error) {
    console.log(error);
    return { error };
  }
};
// const getUserProfile = async (uid) => {
//   const user = await UserModel.findById(uid).populate("profile");
//   if (!user) {
//     throw new Error("User not found");
//   }
//   const profile = user._doc.profile._doc;
//   // delete profile.auth;
//   return {
//     data: profile,
//     devices: user.devices,
//     message: "User found",
//     status: 200,
//   };
// };

export const verifyAuthJWT = async (data) => {
  const { authToken, refreshToken } = data;
  let decodedAuthToken, decodedRefreshToken, decode;

  try {
    decodedAuthToken = await joseJwtDecrypt(authToken);
    if (decodedAuthToken.error) {
      if (decodedAuthToken.error.message !== "JWT expired") {
        return {
          error: "Invalid authorization token.",
        };
      }
      decodedRefreshToken = await joseJwtDecrypt(refreshToken);
      if (decodedRefreshToken.error) {
        if (decodedRefreshToken.error.message !== "JWT expired") {
          return {
            error: "Invalid refresh token.",
          };
        }
        throw new Error("No valid Tokens were provided");
      }

      decode = { ...decodedRefreshToken };
    } else {
      decode = { ...decodedAuthToken };
    }
    // console.log({ decode });
    return decode.payload;
    // let type = ["Admin", "Vendor", "Customer", "Driver", "CSR"];
    // if (!type.includes(decode.payload.userType)) {
    //   console.log(decodedAuthToken.payload.userType, type);
    //   throw new Error("User type mismatch");
    // }
  } catch (error) {
    console.log(error);
    return {
      error: error.message,
    };
  }
};
