import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		planId: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
			min: 1,
		},
		credits: {
			type: Number,
			required: true,
			min: 1,
		},
		razorpayOrderId: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		razorpayPaymentId: {
			type: String,
			default: "",
		},
		status: {
			type: String,
			enum: ["created", "paid", "failed"],
			default: "created",
		},
	},
	{ timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
