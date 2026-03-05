import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { createTask, getTasks, toggleTask, deleteTask, updateTask, } from "../controllers/task.controller.js";
const router = Router();
// All routes below require authentication
router.use(authenticate);
// Create task
router.post("/", (req, res) => createTask(req, res));
// Get tasks (pagination, filter, search)
router.get("/", (req, res) => getTasks(req, res));
// Update task
router.patch("/:id", (req, res) => updateTask(req, res));
// Toggle task status
router.patch("/:id/toggle", (req, res) => toggleTask(req, res));
// Delete task
router.delete("/:id", (req, res) => deleteTask(req, res));
export default router;
//# sourceMappingURL=task.routes.js.map