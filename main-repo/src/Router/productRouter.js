import { Router } from "express";
import { handleMultipartData } from "../Utils/MultipartData.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
import {
  AddProduct,
  AddToFavourite,
  DeleteProduct,
  GetAllFavourite,
  GetAllProducts,
  GetYourProducts,
  GetProductsByCategories,
  GetSingleProduct,
  RemoveFromFavourite,
  SearchProduct,
  UpdateProduct,
} from "../Controller/ProductController.js";
export let ProductRouter = Router();

// Add Profile details

ProductRouter.route("/")
  .get([AuthMiddleware, GetYourProducts])
  .post([AuthMiddleware, handleMultipartData.array("images", 6), AddProduct]);

ProductRouter.route("/all").get([AuthMiddleware, GetAllProducts]);

ProductRouter.route("/category").get([AuthMiddleware, GetProductsByCategories]);

ProductRouter.route("/search").get([AuthMiddleware, SearchProduct]);

ProductRouter.route("/favourite")
  .get([AuthMiddleware, GetAllFavourite])
  .post([AuthMiddleware, AddToFavourite])
  .delete([AuthMiddleware, RemoveFromFavourite]);

ProductRouter.route("/:id")
  .get([AuthMiddleware, GetSingleProduct])
  .patch([
    AuthMiddleware,
    handleMultipartData.array("images", 6),
    UpdateProduct,
  ])
  .delete([AuthMiddleware, DeleteProduct]);

// ProductRouter.route("/images").get([AuthMiddleware, GetAllImages]);
// ProductRouter.route("/videos").get([AuthMiddleware, GetAllVideos]);
// ProductRouter.route("/all").get([AuthMiddleware, GetAllWork]);
// // Add Profile details
// WorkRouter.route("/add").post([
//   AuthMiddleware,
//   handleMultipartDataForBoth.array("workArr", 12),
//   UploadWorkArrMiddleware,
//   AddWork,
// ]);
// WorkRouter.route("/images").get([AuthMiddleware, GetAllImages]);
// WorkRouter.route("/videos").get([AuthMiddleware, GetAllVideos]);
// WorkRouter.route("/all").get([AuthMiddleware, GetAllWork]);
