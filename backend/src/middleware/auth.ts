import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret === "fallback_secret_for_dev_only")) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined in production.");
  }
  return secret || "fallback_secret_for_dev_only";
};

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "No token, authorization denied" });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Access denied: insufficient permissions" });
      return;
    }
    next();
  };
};
