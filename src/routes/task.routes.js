"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const task_controller_1 = require("../controllers/task.controller");
const router = (0, express_1.Router)();
// All routes below require authentication
router.use(auth_middleware_1.authenticate);
// Create task
router.post("/", task_controller_1.createTask);
// Get tasks (pagination, filter, search)
router.get("/", task_controller_1.getTasks);
// Update task
router.patch("/:id", task_controller_1.updateTask);
// Toggle task status
router.patch("/:id/toggle", task_controller_1.toggleTask);
// Delete task
router.delete("/:id", task_controller_1.deleteTask);
exports.default = router;
//# sourceMappingURL=task.routes.js.map