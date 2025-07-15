import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import categoryRouter from "./routes/category.route.js";
import fileRouter from "./routes/files.routes.js";
import tagRouter from "./routes/tags.routes.js";
import authRouter from "./routes/auth.route.js";
import morgan from "morgan"
const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin : process.env.CLIENT_ORIGIN || "https://filemanagernmdc.netlify.app",
    credentials : true
}))
app.get("/",(req,res)=>{
    res.send("hi from server");
})
app.use("/api/v1/auth",authRouter);
app.use("/api/v1/category",categoryRouter);
app.use("/api/v1/files",fileRouter);
app.use("/api/v1/tags",tagRouter);
app.use(errorMiddleware);
export default app;