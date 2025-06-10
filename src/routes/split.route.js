import { Router } from "express";
import { getAllPeople, getBalances, getSettlements, getSpendingByCategory, getMonthlySpendingSummary, getSpendingPatterns, getTopExpensive } from "../controllers/split.controller.js";
const router = Router();

router.route("/people").get(getAllPeople);
router.route("/balances").get(getBalances);
router.route("/settlements").get(getSettlements);
router.route("/spending-category").get(getSpendingByCategory);
router.route("/monthly-summary").get(getMonthlySpendingSummary);
router.route("/spending-patterns").get(getSpendingPatterns);
router.route("/top-expensive").get(getTopExpensive);

export default router;