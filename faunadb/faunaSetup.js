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
	.query(q.CreateCollection({ name: "payhere-demo-orders" }))
	.then(() => {
		// Define an index for order IDs
		return client.query(
			q.CreateIndex({
				name: "orders_by_order_id",
				source: q.Collection("payhere-demo-orders"),
				terms: [{ field: ["data", "order_id"] }],
			})
		);
	})
	.then(() => {
		console.log("FaunaDB schema setup completed.");
	})
	.catch((error) => {
		console.error("Error setting up FaunaDB schema:", error);
	});
