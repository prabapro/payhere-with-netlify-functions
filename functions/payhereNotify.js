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
		const md5sig = formData.get("md5sig");
		const merchantId = formData.get("merchant_id");
		const orderId = formData.get("order_id");
		const payhereAmount = formData.get("payhere_amount");
		const payhereCurrency = formData.get("payhere_currency");
		const paymentCardNo = formData.get("card_no") ?? "";
		const paymentId = formData.get("payment_id") ?? "";
		const paymentMethod = formData.get("method") ?? "";
		const statusCode = formData.get("status_code");
		const statusMessage = formData.get("status_message") ?? "";

		// Extract last 4 digits of the card number
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
						paymentCardLast4Digits: paymentCardLast4Digits,
						paymentId: paymentId,
						paymentMethod: paymentMethod,
						statusMessage: statusMessage,
					},
				})
			);

			console.log("Sent to Fauna DB");

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
					body: JSON.stringify({
						error: "Internal Server Error at line 99 on payhereNotify.js",
					}),
				};
			}
		} else {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: "Invalid request",
					file: "payhereNotify.js",
					line: 112,
				}),
			};
		}
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: error.message || "An unknown error occurred",
				file: "payhereNotify.js",
				line: 126,
			}),
		};
	}
};
