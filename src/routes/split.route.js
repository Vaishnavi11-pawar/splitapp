import { Router } from "express";
import { getAllPeople, getBalances, getSettlements, getFullCategorySummaryForPerson } from "../controllers/split.controller.js";
const router = Router();

router.route("/people").get(getAllPeople);
router.route("/balances").get(getBalances);
router.route("/settlements").get(getSettlements);
router.route("/summary/:person").get(getFullCategorySummaryForPerson);

export default router;