import express from "express"
import { create ,getRoot,children} from "../controllers/tag.controllers.js";
import { checkAdmin,requireAuth } from "../middlewares/auth.middlerware.js";
const tagRouter = express.Router();
tagRouter.use(requireAuth);
tagRouter.post("/create",checkAdmin,create);
tagRouter.get("/root",getRoot);
tagRouter.get("/children/:id",children);

export default tagRouter;