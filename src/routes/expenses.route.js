import { Router } from "express";
import { addexpense, getAllExpenses, updateExpense, deleteExpense } from "../controllers/expense.controller.js";
const router = Router();

router.route("/expenses").post(addexpense);
router.route("/expenses").get(getAllExpenses);
router.route("/expenses/:id").put(updateExpense);
router.route("/expenses/:id").delete(deleteExpense);

export default router;