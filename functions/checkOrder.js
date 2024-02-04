/**
 * Netlify Function: checkOrder
 * Checks if the given Order ID exists in FaunaDB & send the response to front end.
 * @module checkOrder
 */

// Load environment variables from .env file
require("dotenv").config();

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
 * Netlify Function handler for checking if an order with the given Order ID exists in FaunaDB.
 * @async
 * @param {Object} event - The event object representing the HTTP request.
 * @param {Object} context - The context object providing information about the function's execution environment.
 * @returns {Object} An object containing the HTTP response status code and body.
 */
exports.handler = async (event, context) => {
	try {
		// Extract Order ID from the query parameters
		const orderId = event.queryStringParameters.orderId;

		// Check if the order ID exists in FaunaDB
		const faunaResponse = await client.query(
			query.Get(query.Match(query.Index("orders_by_order_id"), orderId))
		);

		// Return successful response with FaunaDB data
		return {
			statusCode: 200,
			body: JSON.stringify(faunaResponse),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: error.message || "Internal Server Error",
				file: "checkOrder.js",
				line: 48,
			}),
		};
	}
};
