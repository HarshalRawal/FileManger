// utils/jwt.js
import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

export const generateResetToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.RESET_PASSWORD_TOKEN_SECRET,
    { expiresIn: "10m" }
  );
};
