require("dotenv").config();
const crypto = require("crypto");

exports.handler = async (event, context) => {
	try {
		const currency = event.queryStringParameters.currency;
		const amount = event.queryStringParameters.amount;
		const orderId = event.queryStringParameters.orderId;

		const merchantId = process.env.PAYHERE_MERCHANT_ID;
		const merchantSecret = process.env.PAYHERE_SECRET;

		const hashedMerchSec = crypto
			.createHash("md5")
			.update(merchantSecret)
			.digest("hex")
			.toUpperCase();

		const hashString = `${merchantId}${orderId}${amount}${currency}${hashedMerchSec}`;
		const hash = crypto
			.createHash("md5")
			.update(hashString)
			.digest("hex")
			.toUpperCase();

		return {
			statusCode: 200,
			body: JSON.stringify({
				currency: currency,
				amount: amount,
				orderId: orderId,
				merchantId: merchantId,
				hash: hash,
			}),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Internal Server Error" }),
		};
	}
};
