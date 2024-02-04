/**
 * Netlify Function: payhereCheckout
 * Generates hash
 * @module payhereCheckout
 */

// Load environment variables from .env file
require("dotenv").config();

// Crypto module for hashing
const crypto = require("crypto");

/**
 * Netlify Function handler for generating Payhere payment details.
 * @async
 * @param {Object} event - The event object representing the HTTP request.
 * @param {Object} context - The context object providing information about the function's execution environment.
 * @returns {Object} An object containing the HTTP response status code and body with Payhere payment details.
 */
exports.handler = async (event, context) => {
	try {
		// Extract parameters from the query parameters
		const amount = event.queryStringParameters.amount;
		const currency = event.queryStringParameters.currency;
		const orderId = event.queryStringParameters.order_id;

		// Retrieve merchant ID and secret from environment variables
		const merchantId = process.env.PAYHERE_MERCHANT_ID;
		const merchantSecret = process.env.PAYHERE_SECRET;

		// Hash the merchant secret using MD5
		const hashedMerchSec = crypto
			.createHash("md5")
			.update(merchantSecret)
			.digest("hex")
			.toUpperCase();

		// Create a hash string for Payhere verification
		const hashString = `${merchantId}${orderId}${amount}${currency}${hashedMerchSec}`;

		// Hash the string using MD5 to generate the final hash
		const hash = crypto
			.createHash("md5")
			.update(hashString)
			.digest("hex")
			.toUpperCase();

		// Return successful response with Payhere payment details
		return {
			statusCode: 200,
			body: JSON.stringify({
				amount: amount,
				currency: currency,
				hash: hash,
				merchant_id: merchantId,
				order_id: orderId,
			}),
		};
	} catch (error) {
		// Handle errors and return an internal server error response
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message || "Internal Server Error" }),
		};
	}
};
