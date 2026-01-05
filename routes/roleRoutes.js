import express from "express";
import {
  addUser,
  getUsers,
  assignRole,
} from "../controllers/roleController.js";
const router = express.Router();
router.post("/add", addUser);
router.get("/", getUsers);
router.put("/:id/assign", assignRole);
export default router;
