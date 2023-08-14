import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import PreferenceModel from "../DB/Model/preferenceModel.js";
import {
  AddPreferenceValidator,
  DeletePreferenceValidator,
  UpdatePreferenceStatusValidator,
  UpdatePreferenceValidator,
} from "../Utils/Validator/PreferenceValidator.js";

// Add Preference
export const AddPreference = async (req, res, next) => {
  try {
    await AddPreferenceValidator.validateAsync(req.body);
    const { title } = req.body;
    const addCat = await PreferenceModel.create({
      title,
    });
    return next(
      CustomSuccess.createSuccess(addCat, "Preference Added Successfully", 201)
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(
        CustomError.createError("duplicate Preference not allowed", 409)
      );
    }
    console.log({ error });
    return next(CustomError.createError(error.message, 400));
  }
};

// Get ALl Preference
export const GetAllPreference = async (req, res, next) => {
  try {
    const allCat = await PreferenceModel.find({
      status: "active",
    }).sort({ _id: -1 });
    return next(
      CustomSuccess.createSuccess(
        allCat,
        "All Preference fetched Successfully",
        201
      )
    );
  } catch (error) {
    console.log({ error });
    return next(CustomError.createError(error.message, 400));
  }
};

// Update Preference
export const UpdatePreference = async (req, res, next) => {
  try {
    await UpdatePreferenceValidator.validateAsync(req.body);
    const { id, title } = req.body;
    const findCat = await PreferenceModel.findOne({
      _id: id,
    });
    if (!findCat) {
      return next(CustomError.createError("No Preference found", 404));
    }

    const allCat = await PreferenceModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        title,
      },
      {
        new: true,
      }
    );
    return next(
      CustomSuccess.createSuccess(
        allCat,
        "Preference udpated Successfully",
        201
      )
    );
  } catch (error) {
    console.log({ error });
    return next(CustomError.createError(error.message, 400));
  }
};
// Update Preference Status
export const UpdatePreferenceStatus = async (req, res, next) => {
  try {
    await UpdatePreferenceStatusValidator.validateAsync(req.body);
    const { id, status } = req.body;
    const findCat = await PreferenceModel.findOne({
      _id: id,
    });
    if (!findCat) {
      return next(CustomError.createError("No Preference found", 404));
    }

    const allCat = await PreferenceModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        status,
      },
      {
        new: true,
      }
    );
    return next(
      CustomSuccess.createSuccess(
        allCat,
        "Preference status udpated Successfully",
        201
      )
    );
  } catch (error) {
    console.log({ error });
    return next(CustomError.createError(error.message, 400));
  }
};

// Delete Preference
export const DeletePreference = async (req, res, next) => {
  try {
    await DeletePreferenceValidator.validateAsync(req.params);
    const { id } = req.params;
    if (!id?.length) {
      return next(CustomError.createError("Invalid Credentials", 404));
    }
    const findCat = await PreferenceModel.findOne({
      _id: id,
    });
    if (!findCat) {
      return next(CustomError.createError("No Preference found", 404));
    }

    const deleteCat = await PreferenceModel.findOneAndDelete(
      {
        _id: id,
      },
      {
        new: true,
      }
    );
    return next(
      CustomSuccess.createSuccess(
        deleteCat,
        "Preference deleted Successfully",
        201
      )
    );
  } catch (error) {
    console.log({ error });
    return next(CustomError.createError(error.message, 400));
  }
};

// Get ALl Preference
export const GetAllAdminPreference = async (req, res, next) => {
  try {
    const allCat = await PreferenceModel.find({}).sort({ _id: -1 });
    return next(
      CustomSuccess.createSuccess(
        allCat,
        "Overall Preference fetched Successfully",
        201
      )
    );
  } catch (error) {
    console.log({ error });
    return next(CustomError.createError(error.message, 400));
  }
};
