import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { requireAuth,checkAdmin } from "../middlewares/auth.middlerware.js";
import { fileUpload ,serve , download ,deleteFiles,filter,update,search} from "../controllers/files.controllers.js";
const fileRouter = express.Router();

fileRouter.use(requireAuth);
fileRouter.post("/upload/:categoryId",checkAdmin,upload.array('files'),fileUpload);
fileRouter.get("/serve/:fileId",serve);
fileRouter.get("/download/:fileId",download);
fileRouter.delete("/delete/:fileId",checkAdmin,deleteFiles);
fileRouter.get("/filter/:id",filter);
fileRouter.get("/filter",filter); // No category ID (root-level filter)
fileRouter.put("/update/:id",checkAdmin,update);
fileRouter.get("/search",search);



export default fileRouter;