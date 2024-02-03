/**
 * Netlify Function: Payhere Notify.
 * Handles Payhere payment notifications and records successful orders in FaunaDB.
 * @module payhereNotify
 */

// Load environment variables from .env file
require("dotenv").config();

// Crypto module for hashing
const crypto = require("crypto");

// FaunaDB module
const faunadb = require("faunadb");

// FaunaDB query functions
const query = faunadb.query;

// FaunaDB client configuration
const client = new faunadb.Client({
	secret: process.env.FAUNA_SECRET_KEY,
	domain: "db.us.fauna.com", // Replace with your FaunaDB domain
});

/**
 * Netlify Function handler for processing Payhere payment notifications.
 * @async
 * @param {Object} event - The event object representing the HTTP request.
 * @param {Object} context - The context object providing information about the function's execution environment.
 * @returns {Object} An object containing the HTTP response status code and body.
 */
exports.handler = async (event, context) => {
	try {
		// Parse the incoming data
		const formData = new URLSearchParams(event.body);

		// Extract data from Payhere notification
		const merchantId = formData.get("merchant_id");
		const orderId = formData.get("order_id");
		const payhereAmount = formData.get("payhere_amount");
		const payhereCurrency = formData.get("payhere_currency");
		const statusCode = formData.get("status_code");
		const md5sig = formData.get("md5sig");
		const paymentMethod = formData.get("method") ?? "";
		const paymentId = formData.get("payment_id") ?? "";
		const statusMessage = formData.get("status_message") ?? "";
		const paymentCardNo = formData.get("card_no") ?? "";
		const paymentCardLast4Digits = paymentCardNo.slice(-4);

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
			// Store successful order ID in FaunaDB
			const faunadbResponse = await client.query(
				query.Create(query.Collection("payhere-demo-orders"), {
					data: {
						orderId: orderId,
						amount: payhereAmount,
						currency: payhereCurrency,
						paymentMethod: paymentMethod,
						paymentId: paymentId,
						statusMessage: statusMessage,
						paymentCardLast4Digits: paymentCardLast4Digits,
					},
				})
			);

			// Check if the FaunaDB response is successful
			if (faunadbResponse.ref) {
				return {
					statusCode: 200,
					body: JSON.stringify({
						message:
							"Payment confirmation received successfully & recorded in Fauna DB.",
						orderId: orderId,
					}),
				};
			} else {
				console.error("Failed to store order ID in FaunaDB");
				return {
					statusCode: 500,
					body: JSON.stringify({ error: "Internal Server Error" }),
				};
			}
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
		// Handle errors and return an internal server error response
		console.error("Error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Internal Server Error" }),
		};
	}
};
