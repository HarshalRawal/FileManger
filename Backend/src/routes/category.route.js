import express from "express";
import { requireAuth,checkAdmin } from "../middlewares/auth.middlerware.js";
import { createCategory,getCategory,renameCategory,getRootCategories,deleteCategory} from "../controllers/category.controllers.js";
const categoryRouter  = express.Router();
 
categoryRouter.use(requireAuth);
categoryRouter.post("/create-category",checkAdmin,createCategory);
categoryRouter.get("/get-root-category",getRootCategories);
categoryRouter.get("/get-category/:id",getCategory);
categoryRouter.patch("/rename-category",checkAdmin,renameCategory);
categoryRouter.delete("/delete/:id",checkAdmin,deleteCategory);


export default categoryRouter;