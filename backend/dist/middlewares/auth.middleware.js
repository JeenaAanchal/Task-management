import jwt from "jsonwebtoken";
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        // Make sure decoded has userId
        if (typeof decoded !== "object" || decoded === null || !("userId" in decoded)) {
            return res.status(401).json({ message: "Invalid token payload" });
        }
        req.user = { userId: decoded.userId };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
//# sourceMappingURL=auth.middleware.js.map