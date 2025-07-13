import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error.js";

// Protect routes using access token stored in cookies
export const requireAuth = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new ApiError(401, "Access token missing. Please log in.");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // Attach user data (e.g., id, role) to request
    next();
  } catch (err) {
    throw new ApiError(403, "Invalid or expired access token");
  }
};

export const checkAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
      throw new ApiError(403, "Admin access only");
    }
    next();
  };
