import mongoose, { Schema } from "mongoose";

const expenseSchema = new Schema(
    {
        amount: {
            type: Number,
            required: true,
            min: [0.01, 'Amount must be positive']
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        paid_by: {
            type: String,
            required: true,
            trim: true
        },
        shared_between: {
            type: [String],
            required: true,
            validate: {
                validator: function(arr) {
                    return arr && arr.length > 0;
                },
                message: 'At least one person must share the expense'
            }
        },
        split_type: {
            type: String,
            required: true,
            enum: {
                values: ['equal', 'percentage', 'exact'],
                message: 'Split type must be equal, percentage, or exact'
            }
        },
        split_details: {
            type: Schema.Types.Mixed,
            required: false
        },
        category: {
            type: String,
            required: false,
            enum: ['Food', 'Travel', 'Entertainment', 'Shopping', 'Bills', 'Other'],
            default: 'Other'
        }
    },
    { 
        timestamps: true 
    }
);

export const Expense = mongoose.model("Expense", expenseSchema);