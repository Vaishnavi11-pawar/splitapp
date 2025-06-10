import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {Expense} from "../models/expense.model.js";


export const addexpense = asyncHandler( async (req, res) => {

        try {
            const {amount, description, paid_by, shared_between, split_type, split_details, category} = req.body;
    
            // Basic Validation
            if (!amount || amount <= 0) throw new ApiError(400, "Invalid amount");
            if (!description || !paid_by || !shared_between || shared_between.length === 0) {
                throw new ApiError(400, "Missing required fields");
            }
    
            // split validation
            if (split_type === "percentage") {
                const values = Object.values(split_details || {});
                let total = 0;
                for (let i=0; i<values.length; i++) {
                    total += values[i];
                }
                if (total !== 100) throw new ApiError(400, "Percentage must sum to 100");
            }
    
             if (split_type === "exact") {
                const values = Object.values(split_details || {});
                let total = 0;
                for (let i=0; i<values.length; i++) {
                    total += values[i];
                }
                if (total !== amount) throw new ApiError(400, "Exact amounts must sum to total amount");
            }
    
            const expense = await Expense.create ({
                amount,
                description,
                paid_by,
                shared_between,
                split_type,
                split_details,
                category
            });
    
            return res.status(201).json(
                new ApiResponse(201, expense, "Expense added successfully")
            )
    
        } catch (error) {

            // console.error("Error fetching expenses:", error.message);

            return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error",
            statusCode: error.statusCode || 500,
            errors: error.errors || [],
            });
        }
});


export const getAllExpenses = asyncHandler(async (req, res) => {

   try {
     const expenses = await Expense.find().sort({ createdAt: -1 });
     return res.status(200).json(new ApiResponse(200, expenses, "Fetched all expenses"));
 
   } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error",
            statusCode: error.statusCode || 500,
            errors: error.errors || []
        });
   }
});


export const updateExpense = asyncHandler(async (req, res) => {

    try {
        const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
        if (!updated) {
            throw new ApiError(404, "Expense not found");
        }
    
        return res.status(200).json(new ApiResponse(200, updated, "Expense updated successfully"));
        
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error",
            statusCode: error.statusCode || 500,
            errors: error.errors || []
        });
    }
});


export const deleteExpense = asyncHandler(async (req, res) => {
  
    try {
        const deleted = await Expense.findByIdAndDelete(req.params.id);
    
        if (!deleted) {
            throw new ApiError(404, "Expense not found");
        }
    
        return res.status(200).json(new ApiResponse(200, null, "Expense deleted successfully"));
    
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error",
            statusCode: error.statusCode || 500,
            errors: error.errors || []
        });
    }
});