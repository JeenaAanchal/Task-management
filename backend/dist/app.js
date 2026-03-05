import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.get("/", (req, res) => {
    res.send("API Running");
});
export default app;
//# sourceMappingURL=app.js.map