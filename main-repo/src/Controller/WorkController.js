import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { uploadMedia } from "../Utils/Resource/imageResource.js";
import WorkModel from "../DB/Model/workModel.js";
import { checkMongooseId } from "../Utils/Resource/mongooseResource.js";
import { DeleteWorkValidator } from "../Utils/Validator/WorkValidator.js";

export const AddWork = async (req, res, next) => {
  try {
    if (req.result.length === 0) {
      return next(CustomError.createError("No result found", 500));
    }

    const allWork = req.result.map(async (file) => {
      const mediaUrl = await uploadMedia(
        file.mediaPath,
        file.mediaType,
        file.userId,
        "Diyer"
      );
      console.log({ mediaUrl });
      return {
        userId: file.userId,
        workMedia: mediaUrl,
        workMediaType: file.mediaType,
        workMediaThumbnail: file.mediaThumbnail,
      };
    });
    const allWorks = await Promise.all([...allWork]);
    console.log({ allWorks, result: req.result });

    const allCreatedWorkMedia = await WorkModel.insertMany(allWorks);
    return next(
      CustomSuccess.createSuccess(
        allCreatedWorkMedia,
        "Work added successfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    // console.log(req.files);
    return next(CustomError.createError(error.message, 500));
  }
};

// export const AddWork = async (req, res, next) => {
//   try {
//     if (!req.files) {
//       return next(CustomError.createError("No file provided", 400));
//     }
//     if (req.files.length === 0) {
//       return next(CustomError.createError("No file provided", 400));
//     }
//     const fileTypeArr = ["image", "video"];
//     const looping = req.files.map(async (file) => {
//       let mediaType;
//       if (!fileTypeArr.includes(file.mimeType)) {
//         return next(
//           CustomError.createError("Wrong file format triggered", 400)
//         );
//       }
//       if ("image".includes(file.mimeType)) {
//         mediaType = "image";
//       }
//       if ("video".includes(file.mimeType)) {
//         mediaType = "video";
//       }

//       const mediaUrl = await uploadMedia(file, mediaType, req.userId, "Diyer");

//       return {
//         userId: req.userId,
//         workMedia: mediaUrl,
//         workMediaType: mediaType,
//       };
//     });
//     const allWorks = await Promise.all([looping]);
//     const allCreatedWorkMedia = await WorkModel.insertMany(allWorks);
//     console.log(allCreatedWorkMedia);
//     return next(
//       CustomSuccess.createSuccess(
//         allCreatedWorkMedia,
//         "Work added successfully",
//         200
//       )
//     );
//   } catch (error) {
//     console.log(req.files);
//     if (req.files) {
//       req.files.map((obj) => {
//         unlinkSync(obj.path);
//       });
//     }
//     return next(CustomError.createError(error.message, 500));
//   }
// };

export const GetAllImages = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return next(CustomError.createError("User ID is required", 400));
    }
    if (!checkMongooseId(userId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }

    const allImages = await WorkModel.find({
      userId: userId,
      workMediaType: "image",
      workDeleted: false,
    })
      .populate("workMedia")
      .sort({ _id: -1 });
    return next(
      CustomSuccess.createSuccess(allImages, "Images fetched successfully", 200)
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

export const GetAllVideos = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return next(CustomError.createError("User ID is required", 400));
    }
    if (!checkMongooseId(userId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }

    const allVideos = await WorkModel.find({
      userId: userId,
      workMediaType: "video",
      workDeleted: false,
    })
      .populate("workMedia")
      .sort({ _id: -1 });
    return next(
      CustomSuccess.createSuccess(allVideos, "Videos fetched successfully", 200)
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

export const GetAllWork = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return next(CustomError.createError("User ID is required", 400));
    }
    if (!checkMongooseId(userId)) {
      return next(CustomError.createError("Invalid id provided", 400));
    }

    const allWork = await WorkModel.find({
      userId: userId,
      workDeleted: false,
    })
      .populate("workMedia")
      .sort({ _id: -1 });
    return next(
      CustomSuccess.createSuccess(
        allWork,
        "All the work fetched successfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

export const DeleteWorkImagesOrVideos = async (req, res, next) => {
  try {
    try {
      await DeleteWorkValidator.validateAsync(req.body);
    } catch (error) {
      return next(CustomError.createError(error.message, 400));
    }

    const { deleteWorkIdArr } = req.body;
    if (deleteWorkIdArr.length) {
      for (let i = 0; i < deleteWorkIdArr.length; i++) {
        // console.log(i);
        const element = deleteWorkIdArr[i];
        if (!checkMongooseId(element)) {
          return next(CustomError.createError("Invalid id provided", 400));
        }
      }
    }

    const checkAllVideos = await WorkModel.find({
      _id: {
        $in: deleteWorkIdArr,
      },
      userId: req.userId,
      workDeleted: false,
    }).lean();
    if (checkAllVideos.length !== deleteWorkIdArr.length) {
      return next(
        CustomError.createError(
          "Not all work found. You have provided some wrong ids",
          400
        )
      );
    }

    const updateAllWorkToDelete = await WorkModel.updateMany(
      {
        _id: {
          $in: deleteWorkIdArr,
        },
        userId: req.userId,
        workDeleted: false,
      },
      {
        workDeleted: true,
      }
    ).lean();

    return next(
      CustomSuccess.createSuccess({}, "Work deleted successfully", 200)
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};
