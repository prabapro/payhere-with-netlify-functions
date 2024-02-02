require("dotenv").config();
const faunadb = require("faunadb");

const query = faunadb.query;
const client = new faunadb.Client({
	secret: process.env.FAUNA_SECRET_KEY,
	domain: "db.us.fauna.com",
});

exports.handler = async (event, context) => {
	try {
		const orderId = event.queryStringParameters.orderId;

		// Check if the order ID exists in FaunaDB
		const faunaResponse = await client.query(
			// query.Exists(query.Match(query.Index("orders_by_orderId"), orderId))
			query.Get(query.Match(query.Index("orders_by_orderId"), orderId))
		);

		return {
			statusCode: 200,
			body: JSON.stringify(faunaResponse),
		};
	} catch (error) {
		console.error("Error:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Internal Server Error" }),
		};
	}
};
