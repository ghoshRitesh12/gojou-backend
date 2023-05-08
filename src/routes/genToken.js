import { Router } from "express"; 
import { handleTokenGen } from "../controllers/genTokenController.js";

const router = Router();

router.get('/', handleTokenGen);

export default router;
