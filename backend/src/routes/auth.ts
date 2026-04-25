import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import rateLimit from "express-rate-limit";

const router = Router();

// Ensure we get the secret directly at runtime
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret === "fallback_secret_for_dev_only")) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined in production.");
  }
  return secret || "fallback_secret_for_dev_only";
};

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  message: { error: "Too many authentication attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/auth/signup
 */
router.post("/signup", authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters long" });
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({ error: "Password must contain at least one letter and one number" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: role || "client",
    });

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, getJwtSecret(), { expiresIn: "24h" });

    res.status(201).json({ 
      token, 
      user: { id: user._id, email: user.email, name: user.name, role: user.role } 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/login
 */
router.post("/login", authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, getJwtSecret(), { expiresIn: "24h" });

    res.json({ 
      token, 
      user: { id: user._id, email: user.email, name: user.name, role: user.role } 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
