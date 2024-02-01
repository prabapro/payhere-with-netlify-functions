async function initiatePayment() {
	const orderDetails = {
		currency: "LKR",
		amount: "1500.00",
		orderId: Math.floor(Math.random() * 900000) + 100000,
	};

	const orderParams = Object.keys(orderDetails)
		.map(
			(key) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(orderDetails[key])}`
		)
		.join("&");

	try {
		const response = await fetch(
			`/.netlify/functions/payhereCheckout?${orderParams}`
		);

		if (!response.ok) {
			throw new Error(`Request failed with status: ${response.status}`);
		}

		const data = await response.json();
		console.info(data);

		const payment = {
			sandbox: true,
			return_url: undefined, // Important
			cancel_url: undefined, // Important
			notify_url: "/.netlify/functions/payhereNotify",
			currency: data.currency,
			amount: data.amount,
			order_id: data.orderId,
			merchant_id: data.merchantId,
			hash: data.hash,
			items: "MacBook Pro",
			first_name: "John",
			last_name: "Doe",
			email: "john@doe.com",
			phone: "0777111222",
			address: "123, Main Street",
			city: "Colombo",
			country: "Sri Lanka",
			delivery_address: "123, Main Steet",
			delivery_city: "Colombo",
			delivery_country: "Sri Lanka",
		};

		payhere.startPayment(payment);

		payhere.onCompleted = function onCompleted(orderId) {
			console.log("Payment completed. OrderID:" + orderId);
			// Note: validate the payment and show success or failure page to the customer
		};

		// Payment window closed
		payhere.onDismissed = function onDismissed() {
			// Note: Prompt user to pay again or show an error page
			console.log("Payment dismissed");
		};

		// Error occurred
		payhere.onError = function onError(error) {
			// Note: show an error page
			console.log("Error:" + error);
		};
	} catch (error) {
		console.error("Error:", error.message);
	}
}
