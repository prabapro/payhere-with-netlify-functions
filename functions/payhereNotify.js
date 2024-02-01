const crypto = require("crypto");

exports.handler = async (event, context) => {
	try {
		// Parse the incoming data
		const formData = new URLSearchParams(event.body);

		const merchantId = formData.get("merchant_id");
		const orderId = formData.get("order_id");
		const payhereAmount = formData.get("payhere_amount");
		const payhereCurrency = formData.get("payhere_currency");
		const statusCode = formData.get("status_code");
		const md5sig = formData.get("md5sig");

		// Verify the integrity of the data using the MD5 signature
		const secretKey = process.env.PAYHERE_SECRET;
		const hashedMerchSec = crypto
			.createHash("md5")
			.update(secretKey)
			.digest("hex")
			.toUpperCase();

		const expectedMd5sig = crypto
			.createHash("md5")
			.update(
				`${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${hashedMerchSec}`
			)
			.digest("hex")
			.toUpperCase();

		if (md5sig === expectedMd5sig && statusCode === "2") {
			return {
				statusCode: 200,
				body: JSON.stringify({
					message: "Payment confirmation received successfully",
					orderId: orderId,
				}),
			};
		} else {
			console.error(
				"MD5 signature verification failed or status code is not 2"
			);
			console.log("Received data:", formData.toString()); // Log received data

			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Invalid request" }),
			};
		}
	} catch (error) {
		console.error("Error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Internal Server Error" }),
		};
	}
};
