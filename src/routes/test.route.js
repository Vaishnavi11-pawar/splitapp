import { Router } from "express";
import { testRoute } from "../controllers/test.controller.js";
const router = Router();

router.route("/").get(testRoute);

export default router;