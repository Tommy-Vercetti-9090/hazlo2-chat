// import { verifyToken } from '../../Utils/jwt.js'
import { verifyAuthJWT } from "../../Utils/jwt.js";
import { checkMongooseId } from "../../Utils/Resource/mongooseResource.js";
import CustomError from "../../Utils/ResponseHandler/CustomError.js";
import { AuthMiddlewareValidator } from "../../Utils/Validator/commonValidation.js";

// Auth Middleware
export const AuthMiddleware = async (req, res, next) => {
  const authToken = req.headers.authtoken;
  const refreshToken = req.headers.refreshtoken;
  const { error } = AuthMiddlewareValidator.validate({
    authToken,
    refreshToken,
  });
  if (error) {
    return next(CustomError.unauthorized(error.message));
  }
  const verify = await verifyAuthJWT({
    authToken,
    refreshToken,
  });
  if (verify.error) {
    console.log("verify => ", verify);
    return next(CustomError.unauthorized(verify.error));
  }
  console.log({ verify });
  if (!checkMongooseId(verify.uid)) {
    return next(CustomError.unauthorized("Invalid decrypt token found"));
  }
  if (verify.uid) {
    req.userId = verify.uid;
    req.deviceId = verify.deviceId;
    req.userType = verify.userType;
    req.tokenType = verify.tokenType;
    req.isTemporary = verify.isTemporary;
  } else {
    return next(
      CustomError.unauthorized("Unexpected authorization token provided")
    );
  }

  return next();
};
