import express from "express";
import { validatePromo, listPromos } from "../Controllers/promoController.js";
import authMiddleware from "../Middleware/auth.js";

const promoRouter = express.Router();

promoRouter.post("/validate", authMiddleware, validatePromo);
promoRouter.get("/list", listPromos);

export default promoRouter;
