import {Expense} from "../models/expense.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { calculateBalances, simplifySettlements } from "../utils/settlementUtils.js";

export const getAllPeople = asyncHandler( async (req, res) => {
    try {
        const expenses = await Expense.find();
        const people = new Set();
    
        expenses.forEach(exp => {
            people.add(exp.paid_by);
            exp.shared_between.forEach(p => people.add(p));
        });
    
        return res.status(200).json(new ApiResponse(200, Array.from(people), "people fetched"));
        
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch people",
            statusCode: error.statusCode || 500,
            errors: error.errors || []
        });
    }
});

export const getBalances = asyncHandler( async (req, res) => {
    try {
        const expenses = await Expense.find();
        
        if (!expenses || expenses.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, {}, "No expenses found to calculate balances")
            );
        }

        const balances = calculateBalances(expenses);
        return res.status(200).json(new ApiResponse(200, balances, "Balances Calculated."));
        
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to calculate balances",
            statusCode: error.statusCode || 500,
            errors: error.errors || []
        });
    }
});

export const getSettlements = asyncHandler(async (req, res) => {
  
  try {
    const expenses = await Expense.find();
    const balances = calculateBalances(expenses);
    const settlements = simplifySettlements(balances);
    return res.status(200).json(new ApiResponse(200, settlements, "Settlements calculated"));
  
  } catch (error) {
    return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to calculate settlements",
            statusCode: error.statusCode || 500,
            errors: error.errors || []
        });
  }
});


export const getSpendingByCategory = asyncHandler(async (req, res) => {
    try {
        const expenses = await Expense.find();
        if (!expenses.length) {
            return res.status(200).json(new ApiResponse(200, {}, "No expenses found"));
        }

        // Calculate total spending per category
        const categoryTotals = {};
        expenses.forEach(exp => {
            const category = exp.category || 'Other';
            categoryTotals[category] = (categoryTotals[category] || 0) + exp.amount;
        });

        // Format and sort by amount descending
        const breakdown = Object.entries(categoryTotals)
            .map(([category, total]) => ({
                category,
                total: Math.round(total * 100) / 100
            }))
            .sort((a, b) => b.total - a.total);

        return res.status(200).json(new ApiResponse(200, breakdown, "Spending breakdown by category"));
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to get spending breakdown by category",
            statusCode: error.statusCode || 500,
            errors: error.errors || []
        });
    }
});

export const getMonthlySpendingSummary = asyncHandler(
    async (req, res) => {
        try {
            const expenses = await Expense.find().sort({ createdAt: 1 });  
            if (!expenses.length) {
                return res.status(200).json(new ApiResponse(200, {}, "No expenses found"));
            }

            // Group expenses by month
            const monthlyExpenses = expenses.reduce((acc, exp) => {
                const date = new Date(exp.createdAt);
                const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                acc[key] = acc[key] || [];
                acc[key].push(exp);
                return acc;
             }, {});

            // Calculate spending for each month using your existing function
            const monthlySpending = Object.fromEntries(
                Object.entries(monthlyExpenses).map(([month, exps]) => {
                    const balances = calculateBalances(exps);
                    const spending = Object.fromEntries(
                        Object.entries(balances).map(([person, balance]) => [
                            person,
                            balance < 0 ? Math.abs(balance) : 0
                        ])
                    );
                    return [month, spending];
                })
            );

            return res.status(200).json(new ApiResponse(200, monthlySpending, "Monthly spending calculated"));

        } catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Failed to calculate monthly spending",
                statusCode: error.statusCode || 500,
                errors: error.errors || []
            });
        }
    }
);

export const getSpendingPatterns = asyncHandler(
    async (req, res) => {
        try {
            const expenses = await Expense.find();
            if (!expenses.length) {
                return res.status(200).json(new ApiResponse(200, {}, "No expenses found"));
            }

            // Separate individual and group expenses
            const individualExpenses = expenses.filter(exp => 
                exp.shared_between.length === 1 && exp.shared_between[0] === exp.paid_by
            );
            const groupExpenses = expenses.filter(exp => 
                !(exp.shared_between.length === 1 && exp.shared_between[0] === exp.paid_by)
            );

            // Get all people
            const people = new Set();
            expenses.forEach(exp => {
                people.add(exp.paid_by);
                exp.shared_between.forEach(p => people.add(p));
            });

            // Calculate group balances using your existing function
            const groupBalances = calculateBalances(groupExpenses);

            const summary = {};

            Array.from(people).forEach(person => {
                // Calculate individual spending
                const individualSpending = individualExpenses
                    .filter(exp => exp.paid_by === person)
                    .reduce((sum, exp) => sum + exp.amount, 0);

                // Calculate group spending (what they owe)
                const groupSpending = Math.abs(groupBalances[person] < 0 ? groupBalances[person] : 0);

                // Calculate group payments (what they paid for group expenses)
                const groupPayments = groupExpenses
                    .filter(exp => exp.paid_by === person)
                    .reduce((sum, exp) => sum + exp.amount, 0);

                const totalSpending = individualSpending + groupSpending;
                
                summary[person] = {
                    individualSpending: Math.round(individualSpending * 100) / 100,
                    groupSpending: Math.round(groupSpending * 100) / 100,
                    totalSpending: Math.round(totalSpending * 100) / 100,
                    individualPercentage: totalSpending > 0 ? Math.round((individualSpending / totalSpending) * 100) : 0,
                    groupPercentage: totalSpending > 0 ? Math.round((groupSpending / totalSpending) * 100) : 0,
                    preferredType: individualSpending > groupSpending ? 'Individual' : 'Group',
                    isGroupPayer: groupPayments > groupSpending,
                    groupPayerAmount: Math.round((groupPayments - groupSpending) * 100) / 100
                };
            });

            return res.status(200).json(new ApiResponse(200, summary, "Spending patterns summary calculated"));

        } catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Failed to calculate spending patterns summary",
                statusCode: error.statusCode || 500,
                errors: error.errors || []
            });
        }
    }
);


export const getTopExpensive = asyncHandler(
    async (req, res) => {
        try {
            const { limit = 5 } = req.query;
            const expenses = await Expense.find().sort({ amount: -1 });
            
            if (expenses.length === 0) {
                return res.status(200).json(new ApiResponse(200, {}, "No expenses found"));
            }

            // Top transactions
            const topTransactions = expenses.slice(0, parseInt(limit)).map(expense => ({
                amount: expense.amount,
                description: expense.description,
                category: expense.category,
                paid_by: expense.paid_by,
                date: expense.createdAt
            }));

            // Category totals
            const categoryTotals = {};
            expenses.forEach(expense => {
                const category = expense.category || 'Other';
                categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
            });

            // Sort categories by total amount
            const topCategories = Object.keys(categoryTotals)
                .map(category => ({
                    category,
                    totalAmount: Math.round(categoryTotals[category] * 100) / 100
                }))
                .sort((a, b) => b.totalAmount - a.totalAmount)
                .slice(0, parseInt(limit));

            const result = {
                topTransactions,
                topCategories,
                summary: {
                    highestExpense: topTransactions[0]?.amount,
                    mostExpensiveCategory: topCategories[0]?.category,
                    totalExpenses: expenses.length
                }
            };

            return res.status(200).json(new ApiResponse(200, result, "Top expensive items retrieved"));

        } catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Failed to get top expensive items",
                statusCode: error.statusCode || 500,
                errors: error.errors || []
            });
        }
    }
);


