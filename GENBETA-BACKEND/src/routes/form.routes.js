import express from "express";
import {
  createFacility,
  getFacilitys,
  getFacilityById,
  updateFacility,
  deleteFacility,
  archiveFacility,
  restoreFacility,
  toggleTemplateStatus
} from "../controllers/form.controller.js";
import { sendLink } from "../controllers/approval.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { enforcePlanLimits } from "../middlewares/planEnforcement.middleware.js";
import { generateCacheKey, getFromCache, setInCache, deleteFromCache } from "../utils/cache.js";

const router = express.Router();

router.post("/", auth, authorize(["PLANT_ADMIN"]), enforcePlanLimits("form"), createFacility);
router.get("/", auth, authorize(["SUPER_ADMIN", "COMPANY_ADMIN", "PLANT_ADMIN", "EMPLOYEE"]), getFacilitys);
router.get("/:id", auth, authorize(["SUPER_ADMIN", "COMPANY_ADMIN", "PLANT_ADMIN", "EMPLOYEE"]), getFacilityById);
router.put("/:id", auth, authorize(["PLANT_ADMIN"]), updateFacility);
router.delete("/:id", auth, authorize(["PLANT_ADMIN"]), deleteFacility);

router.post("/:id/send-link", auth, authorize(["PLANT_ADMIN"]), sendLink);

// Archive/Restore routes
router.patch("/:id/archive", auth, authorize(["PLANT_ADMIN"]), archiveFacility);
router.patch("/:id/restore", auth, authorize(["PLANT_ADMIN"]), restoreFacility);

// Template status routes
router.patch("/:id/toggle-template", auth, authorize(["PLANT_ADMIN"]), toggleTemplateStatus);

export default router;
