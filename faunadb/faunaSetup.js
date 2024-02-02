// faunaSetup.js
require("dotenv").config();

const faunadb = require("faunadb");

const q = faunadb.query;
const client = new faunadb.Client({
	secret: process.env.FAUNA_SECRET_KEY,
	domain: "db.us.fauna.com",
});

// Create a collection for orders
client
	.query(q.CreateCollection({ name: "payhere-deme-orders" }))
	.then(() => {
		// Define an index for order IDs
		return client.query(
			q.CreateIndex({
				name: "orders_by_orderId",
				source: q.Collection("payhere-deme-orders"),
				terms: [{ field: ["data", "orderId"] }],
			})
		);
	})
	.then(() => {
		console.log("FaunaDB schema setup completed.");
	})
	.catch((error) => {
		console.error("Error setting up FaunaDB schema:", error);
	});
