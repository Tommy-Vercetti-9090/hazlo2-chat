import DeviceModel from "../DB/Model/deviceModel.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import UserModel from "../DB/Model/userModel.js";
import {
  AddProfileDetailsValidator,
  DiyerAccountVerificationValidator,
  ForgetPasswordDiyerValidator,
  LoginDiyerValidator,
  RegisterDiyerValidator,
  ResendOtpForAccountVerificationValidator,
  ResetPasswordDiyerValidator,
  SocialRegisterDiyerValidator,
  VerifyOtpDiyerValidator,
} from "../Utils/Validator/DiyerAuthValidator.js";
import { generateRandomNumber } from "../Utils/Resource/otpResource.js";
import PreferenceModel from "../DB/Model/preferenceModel.js";
import mongoose from "mongoose";
import OtpModel from "../DB/Model/otpModel.js";
import {
  emailForAccountVerification,
  emailForResetPassword,
} from "../Utils/emailTemplates.js";
import { sendEmails } from "../Utils/SendEmail.js";
import { generateToken } from "../Utils/jwt.js";
import bcrypt from "bcrypt";
import { uploadMedia } from "../Utils/Resource/imageResource.js";
import { genSalt } from "../Utils/saltGen.js";
import { accessTokenValidator } from "../Utils/accessTokenValidator.js";
import MediaModel from "../DB/Model/media.js";

// Register Diyer
export const RegisterDiyer = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await RegisterDiyerValidator.validateAsync(req.body);
    const { email, telephone, lat, long, deviceType, deviceToken } = req.body;

    const checkEmailOrTeleExist = await UserModel.findOne({
      $or: [{ email }, { telephone }],
    });
    if (checkEmailOrTeleExist) {
      return next(
        CustomError.createError(
          "User already signed up using this email or telephone",
          409
        )
      );
    }
    const createUser = await UserModel.create(
      [
        {
          ...req.body,
          location: {
            type: "Point",
            coordinates: [parseFloat(long), parseFloat(lat)],
          },
        },
      ],
      {
        session,
      }
    );

    console.log({ createUser: createUser[0] });
    const addDeviceToUser = await DeviceModel.findOneAndUpdate(
      { userId: createUser[0]._id },
      {
        $set: {
          deviceType,
          deviceToken,
        },
        $setOnInsert: {
          userId: createUser[0]._id,
        },
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
        new: true,
        session,
      }
    );
    createUser[0].password = undefined;
    const otp = generateRandomNumber(100000, 999999);
    const OTP = await OtpModel.create(
      [
        {
          userId: createUser[0]._id,
          otpKey: otp,
          reason: "verification",
        },
      ],
      {
        session,
      }
    );
    console.log({ addDeviceToUser });
    const emailData = emailForAccountVerification({ otp, name: email });
    if (emailData.error) {
      return next(CustomError.createError(emailData.message, 200));
    }
    sendEmails(email, emailData.subject, emailData.html, emailData.attachments);

    // const authToken = await generateToken({
    //   _id: createUser[0]._id.toString(),
    //   // _id: createUser[0]._id.toString(),
    //   tokenType: "auth",
    //   deviceId: addDeviceToUser._id.toString(),
    //   // deviceId: addDeviceToUser._id.toString(),
    //   isTemporary: true,
    //   userType: createUser[0].userType,
    // });
    // const refreshToken = await generateToken({
    //   _id: createUser[0]._id.toString(),
    //   // _id: createUser[0]._id.toString(),
    //   tokenType: "refresh",
    //   deviceId: addDeviceToUser._id.toString(),
    //   // deviceId: addDeviceToUser._id.toString(),
    //   isTemporary: true,
    //   userType: createUser[0].userType,
    // });
    await session.commitTransaction();
    return next(
      CustomSuccess.createSuccess(
        // { ...createUser[0]._doc, authToken, refreshToken },
        { ...createUser[0]._doc },
        "User created and account verification code send Successfully",
        201
      )
    );
  } catch (error) {
    await session.abortTransaction();

    if (error.code === 11000) {
      return next(CustomError.createError("duplicate keys not allowed", 409));
    }
    console.log({ error });
    return next(CustomError.createError(error.message, 400));
  } finally {
    await session.endSession();
  }
};

// Account Verificaton Api
export const DiyerAccountVerification = async (req, res, next) => {
  try {
    await DiyerAccountVerificationValidator.validateAsync(req.body);
    const { userId, otpKey } = req.body;

    const getOtp = await OtpModel.findOne({
      userId,
    }).sort({ _id: -1 });
    console.log({ getOtp });
    if (!getOtp) {
      return next(CustomError.createError("No Otp Found", 404));
    }

    if (getOtp.reason !== "verification") {
      return next(CustomError.createError("No verification otp found", 400));
    }

    if (getOtp.otpUsed) {
      return next(CustomError.createError("otp is already used", 403));
    }

    const isMatch = bcrypt.compareSync(otpKey, getOtp.otpKey);
    if (!isMatch) {
      return next(CustomError.createError("You have entered wrong otp", 406));
    }

    const verifiedUser = await UserModel.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        isVerified: true,
      },
      {
        new: true,
      }
    )
      .select("-password")
      .lean();
    const getDevice = await DeviceModel.findOne({
      userId,
    }).lean();
    await getOtp.updateOne({ otpUsed: true });

    const authToken = await generateToken({
      _id: verifiedUser._id,
      tokenType: "login",
      deviceId: getDevice._id,
      isTemporary: false,
      userType: verifiedUser.userType,
    });
    if (authToken.error) {
      return next(CustomError.createError(authToken.error.message, 500));
    }
    const refreshToken = await generateToken({
      _id: verifiedUser._id,
      tokenType: "refresh",
      deviceId: getDevice._id,
      isTemporary: false,
      userType: verifiedUser.userType,
    });
    if (refreshToken.error) {
      return next(CustomError.createError(refreshToken.error.message, 500));
    }
    return next(
      CustomSuccess.createSuccess(
        { ...verifiedUser, authToken, refreshToken },
        "User verified Successfully",
        200
      )
    );
  } catch (error) {
    console.log({ error });
    return next(CustomError.createError(error.message, 400));
  }
};

// Login Diyer
export const LoginDiyer = async (req, res, next) => {
  try {
    await LoginDiyerValidator.validateAsync(req.body);
    const { username, password, lat, long, deviceType, deviceToken } = req.body;

    const user = await UserModel.findOne({
      $or: [{ email: username }, { telephone: username }],
    });
    console.log({ user });

    if (!user) {
      return next(CustomError.createError("No user Found", 404));
    }

    const matchPassword = bcrypt.compareSync(password, user.password);
    if (!matchPassword) {
      return next(CustomError.createError("Invlaid Password", 400));
    }

    if (!user.isVerified) {
      return next(
        CustomSuccess.createSuccess(
          { _id: user._id },
          "Your account is not verified",
          203
        )
      );
    }
    if (user.isDeleted) {
      return next(CustomError.createError("Your account is blocked", 401));
    }
    const updatedDevice = await DeviceModel.findOneAndUpdate(
      {
        userId: user._id,
      },
      {
        deviceType,
        deviceToken,
      },
      {
        new: true,
      }
    );

    const updatedUser = await UserModel.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        location: {
          type: "Point",
          coordinates: [parseFloat(long), parseFloat(lat)],
        },
      },
      {
        new: true,
      }
    )
      .populate([{ path: "image" }])
      .lean();
    updatedUser.password = undefined;

    const authToken = await generateToken({
      _id: updatedUser._id,
      tokenType: "login",
      deviceId: updatedDevice._id,
      isTemporary: false,
      userType: updatedUser.userType,
    });
    if (authToken.error) {
      return next(CustomError.createError(authToken.error.message, 500));
    }
    const refreshToken = await generateToken({
      _id: updatedUser._id,
      tokenType: "refresh",
      deviceId: updatedDevice._id,
      isTemporary: false,
      userType: updatedUser.userType,
    });
    if (refreshToken.error) {
      return next(CustomError.createError(refreshToken.error.message, 500));
    }
    return next(
      CustomSuccess.createSuccess(
        { ...updatedUser, authToken, refreshToken },
        "Login Successfully",
        200
      )
    );
  } catch (error) {
    console.log({ error });
    return next(CustomError.createError(error.message, 400));
  }
};

// Resend OTP for Account Verification
export const ResendOtpForAccountVerification = async (req, res, next) => {
  try {
    await ResendOtpForAccountVerificationValidator.validateAsync(req.body);
    const { userId } = req.body;

    const checkUserExistWithId = await UserModel.findOne({
      _id: userId,
    });
    if (!checkUserExistWithId) {
      return next(CustomError.createError("No user found", 409));
    }

    if (checkUserExistWithId.isVerified) {
      return next(
        CustomSuccess.createSuccess({}, "Your account is already verified", 200)
      );
    }
    const otp = generateRandomNumber(100000, 999999);
    const OTP = await OtpModel.create({
      userId: checkUserExistWithId._id,
      otpKey: otp,
      reason: "verification",
    });

    const emailData = emailForAccountVerification({
      otp,
      name: checkUserExistWithId.email || "There",
    });
    if (emailData.error) {
      return next(CustomError.createError(emailData.message, 200));
    }
    sendEmails(
      checkUserExistWithId.email,
      emailData.subject,
      emailData.html,
      emailData.attachments
    );

    return next(CustomSuccess.createSuccess({}, "Otp send successfully", 202));
  } catch (error) {
    console.log({ error });
    return next(CustomError.createError(error.message, 400));
  }
};

// Add Profile Detail
export const AddProfileDetails = async (req, res, next) => {
  try {
    const image = req.file;
    console.log(req.body);
    await AddProfileDetailsValidator.validateAsync(req.body);
    const { preferences } = req.body;
    const findPrefExist = await PreferenceModel.find({
      _id: { $in: [...preferences] },
      status: "active",
    });
    if (preferences?.length !== findPrefExist?.length) {
      return next(
        CustomError.createError(
          "No preference found with your given credentials",
          404
        )
      );
    }
    //  file, mediaType, userType, profile;
    if (image) {
      const profileImageUrl = await uploadMedia(
        image,
        "image",
        req.userId,
        "Diyer"
      );
      if (!profileImageUrl) {
        return next(
          CustomError.createError(
            "Something went wrong while uploading image",
            200
          )
        );
      }
      req.body.image = profileImageUrl;
    } else {
      req.body.image = "649b115fc4a5c89ecd86cb67";
    }

    const updateProfile = await UserModel.findOneAndUpdate(
      { _id: req.userId },
      {
        ...req.body,
      },
      {
        new: true,
      }
    )
      .select("-password")
      .populate({
        path: "image",
      });

    return next(
      CustomSuccess.createSuccess(
        updateProfile,
        "Profile Updated Successfully",
        200
      )
    );
  } catch (error) {
    console.log({ error });
    return next(CustomError.createError(error.message, 400));
  }
};

// Forget Password Diyer
export const ForgetPasswordDiyer = async (req, res, next) => {
  try {
    // Validate the request body
    await ForgetPasswordDiyerValidator.validateAsync(req.body);
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return next(CustomError.createError("User not found", 404));
    }

    // Generate 6 Digit OTP
    const OTP = generateRandomNumber(100000, 999999);

    const emailData = emailForResetPassword({
      name: user.fullName || "There",
      otp: OTP,
    });
    // store OTP in DB
    const otpDb = await OtpModel.create({
      userId: user._id,
      otpKey: OTP,
      reason: "forgotPassword",
    });

    sendEmails(email, emailData.subject, emailData.html, emailData.attachments);

    // Send Response
    return next(
      CustomSuccess.createSuccess(otpDb, "OTP send Successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 400));
  }
};

// verify otp Diyer
export const VerifyOtpDiyer = async (req, res, next) => {
  try {
    await VerifyOtpDiyerValidator.validateAsync(req.body);
    const { userId, otpKey } = req.body;

    const getOtp = await OtpModel.findOne({
      userId,
    }).sort({ _id: -1 });
    console.log({ getOtp });
    if (!getOtp) {
      return next(CustomError.createError("No Otp Found", 404));
    }
    if (getOtp.reason !== "forgotPassword") {
      return next(CustomError.createError("No forget password otp found", 400));
    }

    if (getOtp.otpUsed) {
      return next(CustomError.createError("otp is already used", 403));
    }

    const isMatch = bcrypt.compareSync(otpKey, getOtp.otpKey);
    if (!isMatch) {
      return next(CustomError.createError("You have entered wrong otp", 406));
    }
    await getOtp.updateOne({ otpUsed: true, verified: true });
    return next(
      CustomSuccess.createSuccess(getOtp, "OTP verified successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 400));
  }
};

// reset password Diyer
export const ResetPasswordDiyer = async (req, res, next) => {
  try {
    await ResetPasswordDiyerValidator.validateAsync(req.body);
    const { password, otpId } = req.body;

    const findOtp = await OtpModel.findOne({ _id: otpId }).sort({ _id: -1 });
    if (!findOtp) {
      return next(CustomError.createError("No Otp Found", 404));
    }
    if (findOtp.reason !== "forgotPassword") {
      return next(CustomError.createError("No forget password otp found", 400));
    }

    if (!findOtp.otpUsed) {
      return next(CustomError.createError("otp is not used", 403));
    }
    if (!findOtp.verified) {
      return next(CustomError.createError("otp is not verified", 403));
    }

    const updateuser = await UserModel.findOneAndUpdate(
      {
        _id: findOtp.userId,
      },
      {
        password: bcrypt.hashSync(password, genSalt),
      },
      { new: true }
    );
    await findOtp.deleteOne();
    return next(
      CustomSuccess.createSuccess({}, "password reset Successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 400));
  }
};

// social register Diyer
export const SocialRegisterDiyer = async (req, res, next) => {
  try {
    await SocialRegisterDiyerValidator.validateAsync(req.body);

    const { socialType, accessToken, deviceType, deviceToken, lat, long } =
      req.body;
    const { hasError, message, data } = await accessTokenValidator(
      accessToken,
      socialType
    );
    if (hasError) {
      return next(CustomError.createError(message, 401));
    }
    const { name, image, identifier, dateOfBirth, gender } = data;

    let user = await UserModel.findOneAndUpdate(
      { socialIdentifier: bcrypt.hashSync(identifier, genSalt) },
      {
        $set: {
          socialIdentifier: bcrypt.hashSync(identifier, genSalt),
          socialType: socialType,
          socialAccessToken: bcrypt.hashSync(accessToken, genSalt),
          location: {
            type: "Point",
            coordinates: [parseFloat(long), parseFloat(lat)],
          },
        },
        $setOnInsert: {
          isVerified: true,
          fullName: name ? name : "",
          gender: gender ? gender : "",
          dateOfBirth: dateOfBirth ? dateOfBirth : "",
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const createMedia = await MediaModel.create({
      mediaType: "image",
      mediaUrl: image,
      userType: "Diyer",
      userId: user._id,
    });

    user = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { image: createMedia._id },
      { new: true }
    ).populate({ path: "image" });

    const getDevice = await DeviceModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          deviceType,
          deviceToken,
        },
        $setOnInsert: {
          userId: user._id,
        },
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
        new: true,
      }
    );
    console.log({ user });
    const authToken = await generateToken({
      _id: user._id,
      tokenType: "login",
      deviceId: getDevice._id,
      isTemporary: false,
      userType: user.userType,
    });
    if (authToken.error) {
      return next(CustomError.createError(authToken.error.message, 500));
    }
    const refreshToken = await generateToken({
      _id: user._id,
      tokenType: "refresh",
      deviceId: getDevice._id,
      isTemporary: false,
      userType: user.userType,
    });
    if (refreshToken.error) {
      return next(CustomError.createError(refreshToken.error.message, 500));
    }
    return next(
      CustomSuccess.createSuccess(
        { ...user._doc, authToken, refreshToken },
        "User login successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 400));
  }
};
