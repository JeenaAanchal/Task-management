import { Router, Request, Response } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createTask,
  getTasks,
  toggleTask,
  deleteTask,
  updateTask,
} from "../controllers/task.controller.js";

const router = Router();

// All routes below require authentication
router.use(authenticate);

// Create task
router.post(
  "/",
  (req: Request<{}, {}, { title: string; description?: string }>, res: Response) =>
    createTask(req, res)
);

// Get tasks (pagination, filter, search)
router.get(
  "/",
  (
    req: Request<{}, {}, {}> & {
      query: { page?: string; limit?: string; status?: string; search?: string };
    },
    res: Response
  ) => getTasks(req, res)
);

// Update task
router.patch(
  "/:id",
  (req: Request<{ id: string }, {}, { title?: string; description?: string; status?: "PENDING" | "COMPLETED" }>, res: Response) =>
    updateTask(req, res)
);

// Toggle task status
router.patch(
  "/:id/toggle",
  (req: Request<{ id: string }>, res: Response) => toggleTask(req, res)
);

// Delete task
router.delete(
  "/:id",
  (req: Request<{ id: string }>, res: Response) => deleteTask(req, res)
);

export default router;