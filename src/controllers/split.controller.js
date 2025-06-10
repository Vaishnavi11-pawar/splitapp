import {Expense} from "../models/expense.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { calculateBalances, simplifySettlements } from "../utils/settlementUtils.js";

export const getAllPeople = asyncHandler( async (req, res) => {
    const expenses = await Expense.find();
    const people = new Set();

    expenses.forEach(exp => {
        people.add(exp.paid_by);
        exp.shared_between.forEach(p => people.add(p));
    });

    return res.status(200).json(new ApiResponse(200, Array.from(people), "people fetched"));
});

export const getBalances = asyncHandler( async (req, res) => {
    const expenses = await Expense.find();
    const balances = calculateBalances(expenses);
    return res.status(200).json(new ApiResponse(200, balances, "Balances Calculated."));
});

export const getSettlements = asyncHandler(async (req, res) => {
  const expenses = await Expense.find();
  const balances = calculateBalances(expenses);
  const settlements = simplifySettlements(balances);
  return res.status(200).json(new ApiResponse(200, settlements, "Settlements calculated"));
});


export const getFullCategorySummaryForPerson = asyncHandler(async (req, res) => {
    const { person } = req.params;
    if (!person) throw new ApiError(400, "Person name is required");

    // View 1: Paid By
    const paid = await Expense.aggregate([
        { $match: { paid_by: person } },
        { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $project: { category: "$_id", total: 1, count: 1, _id: 0 } }
    ]);

    // View 2: Shared Between
    const shared = await Expense.aggregate([
        { $match: { shared_between: person } },
        { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $project: { category: "$_id", total: 1, count: 1, _id: 0 } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, { paid, shared }, `Category summary for ${person}`)
    );
});
