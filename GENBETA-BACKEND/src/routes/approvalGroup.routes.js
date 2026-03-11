import express from "express";
import { 
  createGroup, 
  getGroups, 
  getGroupById, 
  updateGroup, 
  deleteGroup,
  getGroupsByMember
} from "../controllers/approvalGroup.controller.js";
import { auth, checkRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication and PLANT_ADMIN or COMPANY_ADMIN role
router.use(auth);
router.use(checkRole(["PLANT_ADMIN", "COMPANY_ADMIN"]));

// Routes
router.post("/", createGroup);
router.get("/", getGroups);
router.get("/my-groups", getGroupsByMember);
router.get("/:id", getGroupById);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

export default router;
