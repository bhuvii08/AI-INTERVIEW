import "dotenv/config";
import Razorpay from "razorpay";

let razorpayClient;

const getRazorpayClient = () => {
	if (razorpayClient) return razorpayClient;

	const keyId = process.env.RAZORPAY_KEY_ID;
	const keySecret = process.env.RAZORPAY_KEY_SECRET;

	if (!keyId || !keySecret) {
		throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment");
	}

	razorpayClient = new Razorpay({
		key_id: keyId,
		key_secret: keySecret,
	});

	return razorpayClient;
};

export default getRazorpayClient;
import dotenv from "dotenv";
dotenv.config();