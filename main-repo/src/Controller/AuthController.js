import { uid } from "uid/secure";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { generateToken } from "../Utils/jwt.js";
import bcrypt from "bcrypt";
import VendorModel from "../DB/Model/vendorModel.js";
import AuthModel from "../DB/Model/authModel.js";
import DeviceModel from "../DB/Model/deviceModel.js";
import { genSalt } from "../Utils/saltGen.js";
import { sendEmails } from "../Utils/SendEmail.js";
import { linkUserDevice } from "../Utils/linkUserDevice.js";
import { randomInt } from "crypto";
import {
  ForgotPasswordValidator,
  LoginValidator,
  UpdateProfileValidator,
  RegisterValidator,
  ResetPasswordValidator,
  SocialRegisterValidator,
  verifyOTPValidator,
  ResendOTPValidator,
} from "../Utils/Validator/vendorValidator.js";
import { config } from "dotenv";
import { unlink } from "fs";
import { accessTokenValidator } from "../Utils/accessTokenValidator.js";
import { SocailLoginValidator } from "../Utils/Validator/UserValidator.js";
import OtpModel from "../DB/Model/otpModel.js";
import MediaModel from "../DB/Model/media.js";
import {
  emailForAccountVerification,
  emailForResetPassword,
} from "../Utils/emailTemplates.js";
import { uploadMedia } from "../Utils/Resource/imageResource.js";

config();

//register vendor
export const RegisterVendor = async (req, res, next) => {
  try {
    const { error } = RegisterValidator.validate(req.body);
    if (error) {
      error.details.map((err) => {
        return next(CustomError.createError(err.message, 200));
      });
    }
    const { name, email, password, deviceType, deviceToken, lat, long } =
      req.body;
    const findAuth = await AuthModel.findOne({
      identifier: bcrypt.hashSync(email, genSalt),
    });
    if (findAuth) {
      return next(CustomError.createError("Auth already exist", 200));
    }
    const auth = await new AuthModel({
      identifier: email,
      password,
      userType: "Vendor",
    }).save();
    // send email for otp verification
    const otp = randomInt(100000, 999999);
    const OTP = await new OtpModel({
      auth: auth._id,
      otpKey: otp,
      reason: "verification",
    }).save();
    const emailData = emailForAccountVerification({ otp, name });
    if (emailData.error) {
      return next(CustomError.createError(emailData.message, 200));
    }
    if (!auth) {
      return next(CustomError.createError("error registering user", 200));
    }
    // register user device
    const userId = auth._id;
    const vendor = await new VendorModel({
      auth: userId,
      name,
      location: {
        type: "Point",
        coordinates: [parseFloat(long), parseFloat(lat)],
      },
    }).save();
    if (!vendor) {
      return next(CustomError.createError("error creating user profile", 200));
    } else {
      const profile = vendor._id;
      const updatedAuth = await AuthModel.findByIdAndUpdate(
        userId,
        {
          profile,
          OTP: OTP._id,
        },
        {
          new: true,
        }
      );
      if (!updatedAuth) {
        return next(
          CustomError.createError("error creating user profile", 200)
        );
      }
      const { error } = await linkUserDevice(
        updatedAuth._id,
        deviceToken,
        deviceType
      );
      if (error) {
        return next(CustomError.createError(error, 200));
      }
      delete vendor._doc.auth;
      await sendEmails(
        email,
        emailData.subject,
        emailData.html,
        emailData.attachments
      );
      return next(
        CustomSuccess.createSuccess(vendor, "vendor register succesfully", 200)
      );
    }
  } catch (error) {
    if (error.code === 11000) {
      console.log(error);
      return next(
        CustomError.createError("You already signed up using this email", 200)
      );
    }
    console.log(error);
    return next(CustomError.createError(error.message, 200));
  }
};

//social register vendor
export const SocialRegisterVendor = async (req, res, next) => {
  try {
    const { error } = SocialRegisterValidator.validate(req.body);
    if (error) {
      error.details.map((err) => {
        return next(CustomError.createError(err.message, 200));
      });
    }

    const { socialType, accessToken, deviceType, deviceToken, lat, long } =
      req.body;
    // const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } = process.env;
    // let identifier, name, gender, image, dateOfBirth;
    const { hasError, message, data } = await accessTokenValidator(
      accessToken,
      socialType
    );
    if (hasError) {
      return next(CustomError.createError(message, 200));
    }
    const { name, image, identifier, dateOfBirth, gender } = data;
    const auth = await new AuthModel({
      accessToken,
      socialType,
      identifier,
      userType: "Vendor",
      isVerified: true,
    }).save();
    if (!auth) {
      return next(CustomError.createError("error registering user", 200));
    }
    console.log({ auth });
    const vendor = await new VendorModel({
      auth: auth._id,
      name,
      // image,
      gender: gender ? gender : "",
      dateOfBirth: dateOfBirth ? dateOfBirth : "",
      location: {
        type: "Point",
        coordinates: [parseFloat(long), parseFloat(lat)],
      },
    }).save();
    console.log({ vendor });
    if (!vendor) {
      return next(CustomError.createError("error creating profile", 200));
    }
    const createMedia = await new MediaModel({
      mediaType: "image",
      mediaUrl: image,
      userType: "Vendor",
      profile: vendor._id,
    }).save();
    console.log({ createMedia });
    if (!createMedia) {
      return next(CustomError.createError("error media creating", 200));
    }
    await VendorModel.findByIdAndUpdate(vendor._id, {
      image: createMedia._id,
    });
    await AuthModel.findByIdAndUpdate(auth._id, {
      profile: vendor._id,
    });
    const device = await new DeviceModel({
      deviceType,
      deviceToken,
      auth: auth._id,
      lastSeen: Date.now(),
      status: "active",
    }).save();
    if (!device) {
      return next(
        CustomError.createError("error registering with your device", 400)
      );
    }
    const authToken = await generateToken({
      _id: auth._id,
      tokenType: "auth",
      deviceId: device._id,
      isTemporary: false,
      userType: auth.userType,
    });
    const refreshToken = await generateToken({
      _id: auth._id,
      tokenType: "refresh",
      deviceId: device._id,
      isTemporary: false,
      userType: auth.userType,
    });
    const user = await VendorModel.findOne({ _id: vendor._id }).populate(
      "image"
    );
    const profile = { ...user._doc, authToken, refreshToken };
    // delete profile.auth;
    // delete profile.location;
    return next(
      CustomSuccess.createSuccess(profile, "vendor login succesfully", 200)
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(
        CustomError.createError("You already signed up using this account", 200)
      );
    }
    return next(CustomError.createError(error.message, 200));
  }
};

//login vendor
export const LoginVendor = async (req, res, next) => {
  try {
    const { error } = LoginValidator.validate(req.body);

    if (error) {
      error.details.map((err) => {
        next(CustomError.createError(err.message, 200));
      });
    }
    const { email, password, lat, long, deviceToken, deviceType } = req.body;
    const user = await AuthModel.findOne({
      identifier: await bcrypt.hashSync(email, genSalt),
    }).populate("profile");
    if (!user) {
      // return res.status(200).send({ success: false, message: "Email not found!" });
      return next(CustomError.createError("Email not found!", 200));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // return res.status(200).send({ success: false, message: "You have entered wrong password" });
      return next(
        CustomError.createError("You have entered wrong password", 200)
      );
    }
    // Account verification
    if (!user.isVerified) {
      // return res.status(200).send({ success: false, message: "You have entered wrong password" });
      return next(CustomError.createError("You account is not verified", 200));
    }
    // Admin verification for the shop
    if (!user.shopVerified) {
      return next(
        CustomError.createError("Your shop is not verified by the admin", 200)
      );
    }
    // if (user.isVerified === false) {
    //   return next(CustomError.createError("You have not verified your email", 200));
    // }
    const device = await linkUserDevice(user._id, deviceToken, deviceType);
    if (device.error) {
      return next(CustomError.createError(device.error, 200));
    }
    await VendorModel.findByIdAndUpdate(
      user._doc.profile._id,
      {
        $set: {
          location: {
            type: "point",
            coordinates: [parseFloat(long), parseFloat(lat)],
          },
        },
      },
      {
        new: true,
      }
    );
    const authToken = await generateToken({
      _id: user._id,
      tokenType: "auth",
      deviceId: device.device._id,
      isTemporary: false,
      userType: user.userType,
    });
    const refreshToken = await generateToken({
      _id: user._id,
      tokenType: "refresh",
      deviceId: device.device._id,
      isTemporary: false,
      userType: user.userType,
    });
    const profile = user._doc.profile._doc;
    // const updateUser = await AuthModel.findOneAndUpdate(
    //   { _id: user._id },
    //   {
    //     deviceType: req.body.deviceType,
    //     deviceToken: req.body.deviceToken,
    //   },
    //   { new: true },
    // );
    delete profile.auth;
    profile.location = {
      type: "point",
      coordinates: [parseFloat(long), parseFloat(lat)],
    };
    const userDoc = await VendorModel.findOne({ _id: profile._id }).populate([
      "image",
    ]);
    return next(
      CustomSuccess.createSuccess(
        { ...userDoc._doc, authToken, refreshToken },
        "vendor login succesfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 200));
  }
};

// social login vendor
export const SocialLoginVendor = async (req, res, next) => {
  try {
    const { error } = SocailLoginValidator.validate(req.body);
    if (error) {
      error.details.map((err) => {
        next(CustomError.createError(err.message, 200));
      });
    }
    const { socialType, accessToken, deviceToken, deviceType, lat, long } =
      req.body;
    const { hasError, message, data } = await accessTokenValidator(
      accessToken,
      socialType
    );
    if (hasError) {
      return next(CustomError.createError(message, 200));
    }
    const { name, image, identifier, dateOfBirth, gender } = data;
    const auth = await AuthModel.findOne({
      identifier: await bcrypt.hash(identifier, genSalt),
      userType: "Vendor",
    }).populate("profile");
    // .populate("image");
    if (!auth) {
      return next(CustomError.createError("User not found", 200));
    }
    // update user device
    const device = await linkUserDevice(auth._id, deviceToken, deviceType);
    if (device.error) {
      return next(CustomError.createError(device.error, 200));
    }
    const findMedia = await MediaModel.findOne({ _id: auth.profile.image });
    // delete existing profile picture if exists
    if (findMedia) {
      // const path = auth.profile.image;
      const path = findMedia.mediaUrl;
      // remove old image file from server
      unlink(path, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
    const updateMedia = await new MediaModel({
      mediaType: "image",
      mediaUrl: image,
      userType: "Vendor",
      profile: auth.profile._id,
    }).save();
    // console.log({ createMedia });
    const user = await VendorModel.findByIdAndUpdate(
      auth.profile._id,
      {
        $set: {
          name,
          image: updateMedia._id,
          dateOfBirth: dateOfBirth
            ? new Date(dateOfBirth)
            : auth.profile.dateOfBirth,
          gender: gender ? gender : auth.profile,
          location: {
            type: "point",
            coordinates: [parseFloat(long), parseFloat(lat)],
          },
        },
      },
      {
        new: true,
      }
    );
    const authToken = await generateToken({
      _id: user._id,
      tokenType: "auth",
      deviceId: device.device._id,
      isTemporary: false,
      userType: user.userType,
    });
    const refreshToken = await generateToken({
      _id: user._id,
      tokenType: "refresh",
      deviceId: device.device._id,
      isTemporary: false,
      userType: user.userType,
    });
    const userDoc = await VendorModel.findOne({ _id: vendor._id }).populate(
      "image"
    );

    const profile = { ...userDoc._doc, authToken, refreshToken };
    // delete profile.auth;
    // delete profile.location;
    return next(
      CustomSuccess.createSuccess(profile, "vendor login succesfully", 200)
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 200));
  }
};

//forget password vendor
export const ForgetPasswordVendor = async (req, res, next) => {
  try {
    // VAlidate the request body
    const { error } = ForgotPasswordValidator.validate(req.body);
    if (error) {
      next(CustomError.createError(error.message, 200));
    }
    // var UserDetail;
    const identifier = bcrypt.hashSync(req.body.email, genSalt);
    // var UserDetail;
    const userDetail = await AuthModel.findOne({ identifier }).populate(
      "profile"
    );
    if (!userDetail) {
      return next(CustomError.createError("User not found", 200));
    }
    const name = userDetail.profile.name;
    // Generate 6 Digit OTP
    const OTP = randomInt(100000, 999999);

    const emailData = emailForResetPassword({ name, otp: OTP });
    // store OTP in DB
    const otpDb = await OtpModel.create({
      auth: userDetail._id,
      createdAt: new Date(),
      otpKey: OTP,
      reason: "forgotPassword",
      expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
    });
    // set otpDb._id in userDetail
    userDetail.OTP = otpDb._id;
    await userDetail.save();
    sendEmails(
      req.body.email,
      emailData.subject,
      emailData.html,
      emailData.attachments
    );

    // Send Response
    return next(
      CustomSuccess.createSuccess(
        OTP,
        "Email has been sent to the registered account",
        200
      )
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError("code not send", 200));
    }
    return next(CustomError.createError(error.message, 200));
  }
};

// resend otp vendor  for verification
export const ResendOtp = async (req, res, next) => {
  try {
    // VAlidate the request body
    const { error } = ResendOTPValidator.validate(req.body);
    if (error) {
      next(CustomError.createError(error.message, 200));
    }
    const { email } = req.body;
    // var UserDetail;
    const identifier = await bcrypt.hash(email, genSalt);
    // var UserDetail;
    const userDetail = await AuthModel.findOne({
      identifier,
    }).populate(["profile", "OTP"]);
    if (!userDetail) {
      return next(CustomError.createError("User not found", 200));
    }
    if (userDetail.isVerified) {
      return next(
        CustomError.createError("Your account is already verified", 200)
      );
    }
    const name =
      userDetail.profile && userDetail.profile.name
        ? " " + userDetail.profile.name + ","
        : ",";
    // Generate 6 Digit OTP
    const OTP = randomInt(100000, 999999);
    const emailData = emailForAccountVerification({ name, otp: OTP });
    // reason === "forgotPassword"
    //   ? emailForResetPassword({ name, otp: OTP })
    //   : emailForAccountVerification({ name, otp: OTP });

    const userOTP = bcrypt.hashSync(OTP.toString(), genSalt);
    if (emailData.error) {
      return next(CustomError.createError(emailData.message, 200));
    }
    // update OTP
    const otpDB = await OtpModel.findOneAndUpdate(
      {
        auth: userDetail._id,
      },
      {
        $setOnInsert: {
          auth: userDetail._id,
          // reason: "verification",
          // otpKey: userOTP,
          // expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
        },
        $set: {
          otpKey: userOTP,
          expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
          reason: "verification",
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
    await AuthModel.updateOne(
      {
        identifier,
      },
      {
        $set: {
          OTP: otpDB._id,
        },
      }
    );
    sendEmails(email, emailData.subject, emailData.html, emailData.attachments);
    return next(
      CustomSuccess.createSuccess(
        {},
        "Email has been sent for the verification account",
        200
      )
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 200));
  }
};

//verify otp vendor
export const VerifyOtp = async (req, res, next) => {
  try {
    const { error } = verifyOTPValidator.validate(req.body);
    if (error) {
      error.details.map((err) => {
        next(CustomError.createError(err.message, 200));
      });
    }
    const { email, otp, deviceToken, deviceType } = req.body;
    const identifier = bcrypt.hashSync(email, genSalt);
    const user = await AuthModel.findOne({ identifier }).populate([
      "profile",
      "OTP",
    ]);
    if (!user) {
      return next(CustomError.createError("User not found", 200));
    }
    const OTP = user.OTP;
    if (!OTP) {
      return next(CustomError.createError("OTP not found", 200));
    } else if (OTP.otpUsed) {
      return next(CustomError.createError("OTP already used", 200));
    }
    const userOTP = bcrypt.hashSync(otp, genSalt);
    if (OTP.otpKey !== userOTP) {
      return next(CustomError.createError("Invalid OTP", 200));
    }
    const currentTime = new Date();
    const OTPTime = OTP.createdAt;
    const diff = currentTime.getTime() - OTPTime.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    if (minutes > 60) {
      return next(CustomError.createError("OTP expired", 200));
    }
    const device = await linkUserDevice(user._id, deviceToken, deviceType);
    if (device.error) {
      return next(CustomError.createError(device.error, 200));
    }
    const authToken = await generateToken({
      _id: user._id,
      tokenType: "auth",
      deviceId: device.device._id,
      isTemporary: OTP._doc.reason === "forgotPassword" ? true : false,
      userType: user.userType,
    });
    const refreshToken = await generateToken({
      _id: user._id,
      tokenType: "refresh",
      deviceId: device.device._id,
      isTemporary: OTP._doc.reason === "forgotPassword" ? true : false,
      userType: user.userType,
    });

    const bulkOps = [];
    const update = { otpUsed: true };
    const userUpdate = { isVerified: true };
    if (OTP._doc.reason !== "forgotPassword") {
      bulkOps.push({
        deleteOne: {
          filter: { _id: OTP._id },
        },
      });
      userUpdate.OTP = null;
    }
    bulkOps.push({
      updateOne: {
        filter: { _id: OTP._id },
        update: { $set: update },
      },
    });
    await OtpModel.bulkWrite(bulkOps);
    await AuthModel.updateOne(
      { identifier: user.identifier },
      { $set: userUpdate }
    );
    const userDoc = await VendorModel.findOne({
      _id: user.profile._id,
    }).populate("image");

    const profile = { ...userDoc._doc, authToken, refreshToken };
    if (OTP._doc.reason === "forgotPassword") {
      profile.otpId = OTP._id;
    }

    // delete profile.auth;
    // delete profile.location;

    return next(
      CustomSuccess.createSuccess(profile, "OTP verified successfully", 200)
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError("otp not verify", 200));
    }
    return next(CustomError.createError(error.message, 200));
  }
};

//reset password vendor
export const ResetPasswordVendor = async (req, res, next) => {
  try {
    const { error } = ResetPasswordValidator.validate(req.body);

    if (error) {
      const message = error.details.map((err) => {
        return err.message;
      });
      return next(CustomError.createError(message, 400));
    }
    const { password, otpId } = req.body;

    const findOtp = await OtpModel.findOne({ _id: otpId });
    if (!findOtp) {
      return next(CustomError.createError("Otp is not correct", 200));
    }

    const authId = req.authId;
    const updateuser = await AuthModel.findOneAndUpdate(
      {
        _id: authId,
        OTP: {
          $ne: null,
        },
      },
      {
        password: bcrypt.hashSync(password, genSalt),
        OTP: null,
      },
      { new: true }
    ).populate("profile");
    //
    await OtpModel.deleteOne({
      _id: otpId,
    });
    if (!updateuser) {
      return next(CustomError.createError("password not reset", 200));
    }

    return next(
      CustomSuccess.createSuccess({}, "password reset succesfully", 200)
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError("code not send", 200));
    }
    return next(CustomError.createError(error.message, 200));
  }
};

//update profile vendor
export const UpdateVendorProfile = async (req, res, next) => {
  try {
    const { error } = UpdateProfileValidator.validate(req.body);
    if (error) {
      error.details.map((err) => {
        next(CustomError.createError(err.message, 200));
      });
    }

    const { shopName, currency, language, country } = req.body;
    const image = req.file;
    console.log("image file", req.file);
    // Get Image URL
    if (!image) {
      return next(CustomError.createError("image file is required", 200));
    }
    if (!req.authId) {
      return next(
        CustomError.createError("check your token. Authid not found", 200)
      );
    }

    const isUserExist = await AuthModel.findOne({ _id: req.authId }).populate(
      "profile"
    );
    if (!isUserExist) {
      return next(CustomError.createError("user not exist", 200));
    }

    // file, mediaType, userType, profile
    const productImageUrl = await uploadMedia(
      image,
      "image",
      "Vendor",
      isUserExist.profile._id
    );
    if (!productImageUrl) {
      return next(
        CustomError.createError(
          "Something went wrong while uploading image",
          200
        )
      );
    }

    const profile = await VendorModel.findOneAndUpdate(
      { auth: req.authId },
      { ...req.body, image: productImageUrl },
      { new: true }
    ).populate(["image"]);

    return next(
      CustomSuccess.createSuccess(
        profile._doc,
        "profile updated successfully. Admin verification required",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 200));
  }
};
