import express from "express";
import { auth, checkRole } from "../middlewares/auth.middleware.js";
import { 
  assignTemplateToEmployees, 
  getMyAssignments, 
  getPlantAssignments, 
  deleteAssignment,
  getAssignmentById,
  updateAssignment
} from "../controllers/assignment.controller.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Employee routes
router.get("/my", getMyAssignments);

// Plant Admin routes
router.post("/assign", checkRole(["PLANT_ADMIN"]), assignTemplateToEmployees);
router.get("/plant", checkRole(["PLANT_ADMIN"]), getPlantAssignments);

router.get("/:id", getAssignmentById);
router.patch("/:id", updateAssignment);
router.delete("/:id", checkRole(["PLANT_ADMIN"]), deleteAssignment);

export default router;