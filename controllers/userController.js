import { User } from "../models/userModels.js";
import jwt from "jsonwebtoken";
import razorpay from "razorpay";
import { Transaction } from "../models/transactionModel.js";
import dotenv from "dotenv";
dotenv.config();

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: "Please fill all the details" });
  }
  const user = await User.findOne({ email });
  if (user) {
    res.status(400).json({ message: "User already exists with this email" });
  } else {
    const user = await User.create({ email, name, password });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET);
      res.status(200).json({
        message: "User registered successfully",
        id: user._id,
        token,
        credits: user.creditbalance,
        email: user.email,
        name: user.name,
      });
    } else {
      res.status(400).json({ message: "Could not register user" });
    }
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Please enter both email and password" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    res
      .status(404)
      .json({ message: "Could not find any user registered with this email." });
  } else {
    const isPassCorrect = await user.isPasswordCorrect(password);
    if (isPassCorrect) {
      const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET);
      res.status(200).json({
        message: "User login successfull",
        token,
        id: user._id,
        email: user.email,
        credits: user.creditbalance,
        name: user.name,
      });
    } else {
      res.status(400).json({ message: "Wrong password" });
    }
  }
};

export const userCredits = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (user) {
    res.status(200).json({ data: user, credits: user.creditbalance });
  } else {
    res.status(400).json({ message: "No user found",userId });
  }
};

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const paymentRazorpay = async (req, res) => {
  try {
    const { userId, planId } = req.body;
    if (!userId || !planId) {
      return res.status(404).json({ message: "Missing details" });
    }
    const user = await User.findById(userId);
    console.log(planId);

    let credits, plan, amount, date;
    switch (planId) {
      case "Basic":
        plan = "Basic";
        credits = 100;
        amount = 10;

        break;
      case "Advanced":
        plan = "Advanced";
        credits = 500;
        amount = 50;
        break;
      case "Business":
        plan = "Business";
        credits = 5000;
        amount = 250;
        break;
      default:
        return res.status(404).json({ message: "Plan not found" });
    }
    date = Date.now();
    const transactionData = {
      userId,
      plan,
      credits,
      amount,
      date,
    };
    const transaction = await Transaction.create(transactionData);

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY,
      receipt: transaction._id,
    };

    await razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.status(400).json({ message: error });
      }
      res.status(200).json({ order });
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: "Something went wrong" });
  }
};

export const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      const transactionData = await Transaction.findById(orderInfo.receipt);
      if (transactionData.payment) {
        return res.status(400).json({ message: "Payment Failed" });
      }
      const user = await User.findById(transactionData.userId);

      const creditbalance = user.creditbalance + transactionData.credits;

      await User.findByIdAndUpdate(user._id, { creditbalance });

      await Transaction.findByIdAndUpdate(transactionData._id, {
        payment: true,
      });
      res.status(200).json({ message: "Payment verified and credits added." });
    } else {
      res.status(400).json({ message: "Payment Failed, please retry" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Could not verify" });
  }
};
