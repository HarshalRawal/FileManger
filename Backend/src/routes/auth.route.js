import express from "express";
import { checkAdmin, requireAuth } from "../middlewares/auth.middlerware.js";
import { register,login,logout,refreshAccessToken,forgotPassword,resetPassword,fetchUser } from "../controllers/user.controllers.js";
const authRouter = express.Router();

authRouter.post("/login",login);
authRouter.post("/register",register);
authRouter.get("/me",fetchUser);
authRouter.post("/logout",requireAuth,logout);
authRouter.post("/refresh-token",refreshAccessToken);
authRouter.post("/forgot-password",forgotPassword);
authRouter.post("/reset-password",resetPassword);

export default authRouter;