import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema(
  {
    plan: { type: String, required: true },
    amount: {
      type: Number,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    payment: { type: Boolean, default: false },
    date: { type: Number },
  },
  {
    timestamps: true,
  }
);


export const Transaction = mongoose.model("Transaction",transactionSchema)
