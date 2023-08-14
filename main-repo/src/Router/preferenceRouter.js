import { Router } from "express";
import {
  AddPreference,
  DeletePreference,
  GetAllAdminPreference,
  GetAllPreference,
  UpdatePreference,
  UpdatePreferenceStatus,
} from "../Controller/PreferenceController.js";
export let PreferenceRouter = Router();

// Preference CRUD
PreferenceRouter.route("/")
  .get([GetAllPreference])
  .post([AddPreference])
  .put([UpdatePreferenceStatus])
  .patch([UpdatePreference]);

PreferenceRouter.route("/admin").get([GetAllAdminPreference]);
PreferenceRouter.route("/:id").delete([DeletePreference]);
