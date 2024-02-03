async function initiatePayment() {
	// Form fields
	let currencyField = document.getElementById("currency").value;
	let amountField = document.getElementById("amount").value;
	let firstNameField = document.getElementById("firstName").value;
	let lastNameField = document.getElementById("lastName").value;

	//TODO: handle rest of the input values as required for { payment }...

	// Ensure amountField has two decimal places
	amountField = parseFloat(amountField).toFixed(2);

	// Convert the formatted amount to string
	const formattedAmountString = amountField.toString();

	const orderDetails = {
		currency: currencyField,
		amount: formattedAmountString,
		orderId: generateOrderId(),
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

		const notifyUrl =
			window.location.origin + "/.netlify/functions/payhereNotify";

		const payment = {
			sandbox: true,
			return_url: window.location.origin,
			cancel_url: window.location.origin,
			notify_url: notifyUrl,
			currency: data.currency,
			amount: data.amount,
			order_id: data.orderId,
			merchant_id: data.merchantId,
			hash: data.hash,
			items: "MacBook Pro",
			first_name: firstNameField,
			last_name: lastNameField,
			email: "john@doe.com",
			phone: "0777111222",
			address: "123, Main Street",
			city: "Colombo",
			country: "Sri Lanka",
			delivery_address: "123, Main Steet",
			delivery_city: "Colombo",
			delivery_country: "Sri Lanka",
		};

		//TODO: replace the hardcoded values...

		payhere.startPayment(payment);

		payhere.onCompleted = async function onCompleted(orderId) {
			try {
				// Check if the order ID exists in FaunaDB
				const faunaResponse = await fetch(
					`/.netlify/functions/checkOrder?orderId=${orderId}`
				);

				if (faunaResponse.ok) {
					const faunaData = await faunaResponse.json();

					//TODO: validate the payment and show success or failure page to the customer
					if (faunaData) {
						// Retrieving data from Fauna
						const transactionData = JSON.stringify(faunaData.data);

						// Store the JSON string in session storage
						sessionStorage.setItem("transactionData", transactionData);

						// Redirecting customer to the success page
						window.location.href = "/success";
					} else {
						console.error("Order ID not found in FaunaDB");

						//TODO: Handle the case where the order ID does not exist in FaunaDB
					}
				} else {
					console.error(
						`Failed to check order ID in FaunaDB. Status: ${faunaResponse.status}`
					);

					//TODO: Handle the case where the FaunaDB check failed
				}
			} catch (error) {
				console.error("Error:", error);

				//TODO: Handle any other errors
			}
		};

		// Payment window closed
		payhere.onDismissed = function onDismissed() {
			//TODO: Prompt user to pay again or show an error page
			console.log("Payment dismissed");
		};

		// Error occurred
		payhere.onError = function onError(error) {
			//TODO: Prompt user to pay again or show an error page
			console.log("Error:" + error);
		};
	} catch (error) {
		console.error("Error:", error.message);
	}
}

function generateOrderId() {
	const pad = (value) => String(value).padStart(2, "0");
	const now = new Date();

	const timestamp = `${now.getUTCFullYear()}${pad(now.getUTCDate())}${pad(
		now.getUTCMonth() + 1
	)}${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(
		now.getUTCSeconds()
	)}`;

	const randomNum = Math.floor(Math.random() * 900000) + 100000;
	return `${timestamp}${randomNum}`;
}
