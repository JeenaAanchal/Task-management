import { Router } from "express";
import { register, login, refreshToken, logout} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware";


const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

router.get("/me", authenticate, (req: any, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

export default router;