import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma"; // make sure src/prisma.ts exists
import { z } from "zod";
// Validation schema
const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
// REGISTER
export const register = async (req, res) => {
    try {
        const validatedData = authSchema.parse(req.body);
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
            },
        });
        return res.status(201).json({
            message: "User created successfully",
            userId: user.id,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message || "Invalid input",
        });
    }
};
// LOGIN
export const login = async (req, res) => {
    try {
        const validatedData = authSchema.parse(req.body);
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
        if (!isPasswordValid)
            return res.status(401).json({ message: "Invalid credentials" });
        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: error.message || "Login failed",
        });
    }
};
// REFRESH TOKEN
export const refreshToken = async (req, res) => {
    const { token } = req.body;
    if (!token)
        return res.status(401).json({ error: "No token provided" });
    const savedToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (!savedToken)
        return res.status(403).json({ error: "Invalid refresh token" });
    try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const newAccessToken = jwt.sign({ userId: payload.userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
        return res.json({ accessToken: newAccessToken });
    }
    catch (err) {
        return res.status(403).json({ error: "Refresh token expired or invalid" });
    }
};
// LOGOUT
export const logout = async (req, res) => {
    const { token } = req.body;
    if (!token)
        return res.status(400).json({ error: "Token required" });
    await prisma.refreshToken.deleteMany({ where: { token } });
    return res.status(200).json({ message: "Logged out successfully" });
};
//# sourceMappingURL=auth.controller.js.map