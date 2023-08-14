import { unlinkSync } from "fs";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import {
  AddProductValidator,
  GetProductByCategoryValidator,
  GetYourProductsValidator,
  SearchProductValidator,
  UpdateProductValidator,
} from "../Utils/Validator/ProductValidator.js";
import { uploadMedia } from "../Utils/Resource/imageResource.js";
import ProductModel from "../DB/Model/productModel.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { checkMongooseId } from "../Utils/Resource/mongooseResource.js";
import { Types } from "mongoose";

// Add Product
export const AddProduct = async (req, res, next) => {
  try {
    await AddProductValidator.validateAsync(req.body);

    if (!req.files) {
      return next(CustomError.createError("No file provided", 400));
    }

    const filesLength = req.files.length;
    if (filesLength === 0) {
      return next(CustomError.createError("No file provided", 400));
    }

    const files = req.files;
    const imagesToDB = files.map(async (file) => {
      const mediaUrl = await uploadMedia(file, "image", req.userId, "Diyer");
      return mediaUrl;
    });

    const AllMediaUrl = await Promise.all([...imagesToDB]);
    const createProduct = await ProductModel.create({
      ...req.body,
      userId: req.userId,
      images: [...AllMediaUrl],
    });
    return next(
      CustomSuccess.createSuccess(
        createProduct,
        "Products created Successfully",
        200
      )
    );
  } catch (error) {
    if (req?.files) {
      req.files.map((obj) => {
        unlinkSync(obj.path);
      });
    }
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

// Get Your Products
export const GetYourProducts = async (req, res, next) => {
  try {
    await GetYourProductsValidator.validateAsync(req.query);
    const { userId, category } = req.query;

    let products = await ProductModel.aggregate([
      {
        $match: {
          userId: Types.ObjectId(userId),
          category,
          isFeatured: false,
          isDeleted: false,
        },
      },
      {
        $addFields: {
          favouriteLength: {
            $size: "$favourite",
          },
          shareLength: {
            $size: "$share",
          },
          isFavourite: {
            $in: [Types.ObjectId(userId.toString()), "$favourite"],
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);
    products = await ProductModel.populate(products, [
      {
        path: "userId",
      },
      {
        path: "images",
      },
    ]);

    return next(
      CustomSuccess.createSuccess(
        products,
        "Your Products fetched Successfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

// Search Product By Category
export const GetProductsByCategories = async (req, res, next) => {
  try {
    await GetProductByCategoryValidator.validateAsync(req.query);
    const { category } = req.query;
    let products = await ProductModel.aggregate([
      {
        $match: {
          category,
          isFeatured: false,
          isDeleted: false,
        },
      },
      {
        $addFields: {
          favouriteLength: {
            $size: "$favourite",
          },
          shareLength: {
            $size: "$share",
          },
          isFavourite: {
            $in: [Types.ObjectId(req.userId.toString()), "$favourite"],
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);
    products = await ProductModel.populate(products, [
      {
        path: "userId",
      },
      {
        path: "images",
      },
    ]);

    return next(
      CustomSuccess.createSuccess(
        products,
        "Products fetched by category Successfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

// Search Product
export const SearchProduct = async (req, res, next) => {
  try {
    await SearchProductValidator.validateAsync(req.query);
    const { name, category } = req.query;

    let products = await ProductModel.aggregate([
      {
        $match: {
          name: { $regex: name, $options: "i" },
          category,
          //   {
          //     $regex: new RegExp("^" + name + "$", "i"),
          //   }
          isFeatured: false,
          isDeleted: false,
        },
      },
      {
        $addFields: {
          favouriteLength: {
            $size: "$favourite",
          },
          shareLength: {
            $size: "$share",
          },
          isFavourite: {
            $in: [Types.ObjectId(req.userId.toString()), "$favourite"],
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);
    products = await ProductModel.populate(products, [
      {
        path: "userId",
      },
      {
        path: "images",
      },
    ]);

    return next(
      CustomSuccess.createSuccess(products, "Product Fetched Successfully", 200)
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

// Get All Products
export const GetAllProducts = async (req, res, next) => {
  try {
    let products = await ProductModel.aggregate([
      {
        $match: {
          isFeatured: false,
          isDeleted: false,
        },
      },
      {
        $addFields: {
          favouriteLength: {
            $size: "$favourite",
          },
          shareLength: {
            $size: "$share",
          },
          isFavourite: {
            $in: [Types.ObjectId(req.userId.toString()), "$favourite"],
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);
    products = await ProductModel.populate(products, [
      {
        path: "userId",
      },
      {
        path: "images",
      },
    ]);
    // const products = await ProductModel.find({
    //   userId: userId,
    //   isFeatured: false,
    //   isDeleted: false,
    // }).populate([
    //   {
    //     path: "userId",
    //   },
    //   {
    //     path: "images",
    //   },
    // ]);

    return next(
      CustomSuccess.createSuccess(
        products,
        "All Products fetched Successfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

//  Get Single Product
export const GetSingleProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    if (!productId.length) {
      return next(CustomError.createError("product id is required", 400));
    }

    if (!checkMongooseId(productId)) {
      return next(CustomError.createError("product id is invalid", 400));
    }
    let product = await ProductModel.aggregate([
      {
        $match: {
          _id: Types.ObjectId(productId.toString()),
          isFeatured: false,
          isDeleted: false,
        },
      },
      {
        $addFields: {
          favouriteLength: {
            $size: "$favourite",
          },
          shareLength: {
            $size: "$share",
          },
          isFavourite: {
            $in: [Types.ObjectId(req.userId.toString()), "$favourite"],
          },
        },
      },
    ]);
    product = await ProductModel.populate(product, [
      {
        path: "userId",
        populate: {
          path: "image",
          model: "Media",
        },
      },
      {
        path: "images",
      },
    ]);
    // const product = await ProductModel.findOne({
    //   _id: productId,
    //   isFeatured: false,
    //   isDeleted: false,
    // }).populate([
    //   {
    //     path: "userId",
    //   },
    //   {
    //     path: "images",
    //   },
    // ]);
    console.log(product);
    if (!product.length) {
      return next(CustomError.createError("product not found", 400));
    }

    return next(
      CustomSuccess.createSuccess(product, "Product fetched Successfully", 200)
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

// Update Product
export const UpdateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    if (!productId.length) {
      return next(CustomError.createError("product id is required", 400));
    }

    if (!checkMongooseId(productId)) {
      return next(CustomError.createError("product id is invalid", 400));
    }

    await UpdateProductValidator.validateAsync(req.body);
    const { containImages } = req.body;
    console.log(req.files);
    console.log(req.body);
    let AllMediaUrl = [];
    let containImagesArr = containImages ? containImages : [];

    if (req.files) {
      const files = req.files;
      const imagesToDB = files.map(async (file) => {
        const mediaUrl = await uploadMedia(file, "image", req.userId, "Diyer");
        return mediaUrl;
      });
      AllMediaUrl = await Promise.all([...imagesToDB]);
    }

    const updateProduct = await ProductModel.findOneAndUpdate(
      {
        _id: productId,
      },
      {
        ...req.body,
        images: [...containImagesArr, ...AllMediaUrl],
      },
      { new: true }
    );

    return next(
      CustomSuccess.createSuccess(
        updateProduct,
        "Product Updated Successfully",
        200
      )
    );
  } catch (error) {
    if (req?.files) {
      req.files.map((obj) => {
        unlinkSync(obj.path);
      });
    }
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

//  Delete Product
export const DeleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    if (!productId.length) {
      return next(CustomError.createError("product id is required", 400));
    }

    if (!checkMongooseId(productId)) {
      return next(CustomError.createError("product id is invalid", 400));
    }

    const updateProduct = await ProductModel.findOneAndUpdate(
      {
        _id: productId,
      },
      {
        isDeleted: true,
      },
      { new: true }
    );

    return next(
      CustomSuccess.createSuccess(
        updateProduct,
        "Product Deleted Successfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

// Add To Favourite
export const AddToFavourite = async (req, res, next) => {
  try {
    const productId = req.body.productId;

    if (!productId) {
      return next(CustomError.createError("productId is required", 400));
    }

    if (!checkMongooseId(productId)) {
      return next(CustomError.createError("productId is invalid", 400));
    }
    //Hunain

    const checkFav = await ProductModel.findOne({
      _id: productId,
      favourite: { $in: [req.userId] },
    });
    console.log("------------------", req.userId);
    console.log(checkFav);

    if (checkFav) {
      let removeFavorite = await ProductModel.findOneAndUpdate(
        { _id: productId },
        {
          $pull: {
            favourite: req.userId,
          },
        },
        {
          new: true,
        }
      );
      return next(
        CustomSuccess.createSuccess(
          removeFavorite,
          "Favourite Removed Successfully",
          200
        )
      );
    }
    const addedToFav = await ProductModel.findOneAndUpdate(
      {
        _id: productId,
      },
      {
        $addToSet: {
          favourite: req.userId,
        },
      },
      {
        new: true,
      }
    );
    return next(
      CustomSuccess.createSuccess(
        addedToFav,
        "Product added to favourite Successfully",
        200
      )
    );

    // Tanvir
    // const addedToFav = await ProductModel.findOneAndUpdate(
    //   {
    //     _id: productId,
    //   },
    //   {
    //     $addToSet: {
    //       favourite: req.userId,
    //     },
    //   },
    //   {
    //     new: true,
    //   }
    // );
  } catch (error) {
    console.log(error);
    return next(
      CustomError.createError({ message: error.message, status: 500 })
    );
  }
};

// Remove From Favourite
export const RemoveFromFavourite = async (req, res, next) => {
  try {
    const productId = req.body.productId;

    if (!productId) {
      return next(CustomError.createError("productId is required", 400));
    }

    if (!checkMongooseId(productId)) {
      return next(CustomError.createError("productId is invalid", 400));
    }

    const removeFromFav = await ProductModel.findOneAndUpdate(
      {
        _id: productId,
      },
      {
        $pull: {
          favourite: req.userId,
        },
      },
      {
        new: true,
      }
    );
    return next(
      CustomSuccess.createSuccess(
        removeFromFav,
        "Product removed from favourite Successfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    return next(
      CustomError.createError({ message: error.message, status: 500 })
    );
  }
};

// Get All Favourite
export const GetAllFavourite = async (req, res, next) => {
  try {
    let favProducts = await ProductModel.aggregate([
      {
        $match: {
          favourite: { $in: [Types.ObjectId(req.userId.toString())] },
          isDeleted: false,
        },
      },
      {
        $addFields: {
          favouriteLength: {
            $size: "$favourite",
          },
          shareLength: {
            $size: "$share",
          },
          isFavourite: {
            $in: [Types.ObjectId(req.userId.toString()), "$favourite"],
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);
    favProducts = await ProductModel.populate(favProducts, [
      {
        path: "userId",
      },
      {
        path: "images",
      },
    ]);
    return next(
      CustomSuccess.createSuccess(
        favProducts,
        "Favourite Product fetched Successfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    return next(
      CustomError.createError({ message: error.message, status: 500 })
    );
  }
};

// export const AddProduct = async (req, res, next) => {
//   try {
//   } catch (error) {
//     console.log(error);
//     return next(
//       CustomError.createError({ message: error.message, status: 500 })
//     );
//   }
// };
