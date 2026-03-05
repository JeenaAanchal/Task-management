import { z } from "zod";
import prisma from "../prisma.js"; // make sure src/prisma.ts exists
// Validation schema for creating a task
const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
});
// CREATE TASK
export const createTask = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const validatedData = createTaskSchema.parse(req.body);
        const task = await prisma.task.create({
            data: {
                title: validatedData.title,
                description: validatedData.description ?? null,
                userId: req.user.userId,
            },
        });
        return res.status(201).json(task);
    }
    catch (error) {
        console.log("CREATE TASK ERROR:", error);
        if (error instanceof z.ZodError)
            return res.status(400).json({ message: error.errors });
        return res.status(500).json({ message: "Internal server error" });
    }
};
// GET TASKS
const getTasksQuerySchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(["PENDING", "COMPLETED"]).optional(),
    search: z.string().optional(),
});
export const getTasks = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const query = {
            page: req.query.page,
            limit: req.query.limit,
            status: req.query.status || undefined,
            search: req.query.search || undefined,
        };
        const validatedQuery = getTasksQuerySchema.parse(query);
        const page = Number(validatedQuery.page) || 1;
        const limit = Number(validatedQuery.limit) || 5;
        const skip = (page - 1) * limit;
        const whereClause = { userId: req.user.userId };
        if (validatedQuery.status)
            whereClause.status = validatedQuery.status;
        if (validatedQuery.search)
            whereClause.title = { contains: validatedQuery.search, mode: "insensitive" };
        const total = await prisma.task.count({ where: whereClause });
        const tasks = await prisma.task.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });
        return res.status(200).json({
            data: tasks,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        console.log("GET TASK ERROR:", error);
        if (error instanceof z.ZodError)
            return res.status(400).json({ message: error.errors });
        return res.status(500).json({ message: "Failed to fetch tasks" });
    }
};
// TOGGLE TASK STATUS
export const toggleTask = async (req, res) => {
    try {
        const task = await prisma.task.findFirst({
            where: { id: req.params.id, userId: req.user.userId },
        });
        if (!task)
            return res.status(404).json({ message: "Task not found" });
        const updatedTask = await prisma.task.update({
            where: { id: task.id },
            data: { status: task.status === "PENDING" ? "COMPLETED" : "PENDING" },
        });
        return res.status(200).json(updatedTask);
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to toggle task" });
    }
};
// DELETE TASK
export const deleteTask = async (req, res) => {
    try {
        const task = await prisma.task.findFirst({
            where: { id: req.params.id, userId: req.user.userId },
        });
        if (!task)
            return res.status(404).json({ message: "Task not found" });
        await prisma.task.delete({ where: { id: task.id } });
        return res.status(200).json({ message: "Task deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to delete task" });
    }
};
// UPDATE TASK
const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(["PENDING", "COMPLETED"]).optional(),
});
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = updateTaskSchema.parse(req.body);
        const task = await prisma.task.findFirst({
            where: { id, userId: req.user.userId },
        });
        if (!task)
            return res.status(404).json({ message: "Task not found" });
        const updatedTask = await prisma.task.update({
            where: { id: task.id },
            data: {
                title: validatedData.title ?? undefined,
                description: validatedData.description ?? undefined,
                status: validatedData.status ?? undefined,
            },
        });
        return res.status(200).json(updatedTask);
    }
    catch (error) {
        if (error instanceof z.ZodError)
            return res.status(400).json({ message: error.errors });
        return res.status(500).json({ message: "Failed to update task" });
    }
};
//# sourceMappingURL=task.controller.js.map