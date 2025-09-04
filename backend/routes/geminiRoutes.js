import { Router } from "express";
import { generate } from "../controllers/geminiController.js";
const router = Router();
router.post("/", generate);
export default router;
