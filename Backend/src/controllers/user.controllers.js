import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db/index.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import dotenv from "dotenv";
dotenv.config();
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
} from "../utils/jwt.js";

export const register = asyncHandler(async (req, res) => {
  const { name, sapId, password } = req.body;

  if (!name || !sapId || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await prisma.user.findUnique({ where: { sapId } });
  if (existingUser) {
    throw new ApiError(409, "User already exists with this SAP ID");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      sapId,
      password: hashedPassword,
    },
  });

  return res.status(201).json(
    new ApiResponse(201, "User registered successfully", {
      id: user.id,
      name: user.name,
      sapId: user.sapId,
    })
  )  
});

export const login = asyncHandler(async (req, res) => {
  const { sapId, password } = req.body;

  if (!sapId || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await prisma.user.findUnique({ where: { sapId } });

  if (!user) throw new ApiError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });
  res.cookie("accessToken",accessToken,{
    httpOnly:true,
    secure:true,
    sameSite : "none",
    maxAge :  60 * 60 * 1000, 
  })
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(
    new ApiResponse(200, "Login successful", { accessToken })
  );
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) return res.sendStatus(204);

  const user = await prisma.user.findFirst({ where: { refreshToken } });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });
  }
  res.clearCookie("accessToken",{
    httpOnly: true,
    secure: true,
    sameSite: "none",
  })
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.status(200).json(
    new ApiResponse(200, "Logged out successfully", {})
  );
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { sapId } = req.body;

  if (!sapId) throw new ApiError(400, "SAP ID is required");

  const user = await prisma.user.findUnique({ where: { sapId } });
  if (!user) throw new ApiError(404, "User not found");

  const token = generateResetToken(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { forgetPasswordToken: token },
  });

  // Assume you send this token via email or frontend link
  return res.status(200).json(
    new ApiResponse(200, "Reset token generated", { token })
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });

  if (!user || user.forgetPasswordToken !== token) {
    throw new ApiError(400, "Token does not match");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      forgetPasswordToken: null,
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "Password reset successfully", {})
  );
  
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;
  
    if (!refreshToken) {
      throw new ApiError(401, "Refresh token is missing");
    }
  
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      throw new ApiError(401, "Invalid refresh token");
    }
  
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
  
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(403, "Invalid refresh token");
    }
  
    const newAccessToken = generateAccessToken(user);
  
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000, // 15 minutes
    });
  
    return res.status(200).json(
        new ApiResponse(200, "Access token refreshed", {})
      );
  });
  
  export const fetchUser = asyncHandler(async(req,res)=>{
    const accessToken = req.cookies.accessToken;
    if(!accessToken){
         throw new ApiError(401,"Access Token is required");
    }
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
    console.log(decodedToken);
    const user = await prisma.user.findUnique({
        where : {
            id : decodedToken.id
        },
        select :{
            id : true,
            sapId :true,
            role:true
        }
    })
    if(!user){
        throw new ApiError(404,"User Not Found");
    }
    return res.status(200).json(new ApiResponse(200,"User Found",user));
  })
