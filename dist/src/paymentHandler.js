/**
 * Initiates the payment process using Payhere.
 * @async
 */
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

	/**
	 * Object containing order details.
	 * @type {Object}
	 * @property {string} currency - The currency of the order.
	 * @property {string} amount - The formatted amount of the order.
	 * @property {string} orderId - The generated order ID.
	 */
	const orderDetails = {
		currency: currencyField,
		amount: formattedAmountString,
		orderId: generateOrderId(),
	};

	/**
	 * Parameters for the order, encoded for the URL.
	 * @type {string}
	 */
	const orderParams = Object.keys(orderDetails)
		.map(
			(key) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(orderDetails[key])}`
		)
		.join("&");

	try {
		/**
		 * Response from the Payhere checkout function.
		 * @type {Response}
		 */
		const response = await fetch(
			`/.netlify/functions/payhereCheckout?${orderParams}`
		);

		if (!response.ok) {
			throw new Error(`Request failed with status: ${response.status}`);
		}

		/**
		 * JSON data received from the Payhere checkout response.
		 * @type {Object}
		 */
		const data = await response.json();
		console.info(data);

		const notifyUrl =
			window.location.origin + "/.netlify/functions/payhereNotify";

		/**
		 * Object representing the payment details for Payhere.
		 * @type {Object}
		 */
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

		// Store the payment object in session storage excluding a couple of keys
		const excludedProperties = [
			"sandbox",
			"notify_url",
			"cancel_url",
			"return_url",
			"merchant_id",
			"hash",
		];

		storeFilteredPaymentInSessionStorage(payment, excludedProperties);

		// Start Payhere Payment
		payhere.startPayment(payment);

		// Payhere completed processing payment
		payhere.onCompleted = async function onCompleted(orderId) {
			try {
				// Check if the order ID exists in FaunaDB
				const faunaResponse = await fetch(
					`/.netlify/functions/checkOrder?orderId=${orderId}`
				);

				if (faunaResponse.ok) {
					const faunaData = await faunaResponse.json();

					// Validate the payment and show success or failure page to the customer
					if (faunaData) {
						// Retrieving data from Fauna
						const transactionData = JSON.stringify(faunaData.data);

						// Store the JSON string in session storage
						sessionStorage.setItem("transactionData", transactionData);

						// Redirecting customer to the success page
						window.location.href = "/success";
					} else {
						console.error("Order ID not found in the database.");
					}
				} else {
					console.error(
						`Status: ${faunaResponse.status} - Failed to retrieve from the database.`
					);
				}
			} catch (error) {
				//TODO: Handle any other errors
				console.error("Error:", error);
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

/**
 * Generates a 20-character Order ID (including 2 hyphens) using the current UTC timestamp + 6 random digits.
 * @returns {string} The generated Order ID.
 */
function generateOrderId() {
	const pad = (value) => String(value).padStart(2, "0");
	const now = new Date();

	const datePart = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(
		now.getUTCDate()
	)}`;
	const timePart = `${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(
		now.getUTCSeconds()
	)}`;

	const randomNum = Math.floor(Math.random() * 9000) + 1000;

	const orderId = `${datePart}-${timePart}-${randomNum}`;
	return orderId;
}

/**
 * Stores customer data in session storage excluding certain keys.
 * @param {Object} inputObject - The input object containing customer data.
 * @param {string[]} excludedProperties - An array of property names to be excluded from storage.
 */
function storeFilteredPaymentInSessionStorage(inputObject, excludedProperties) {
	// Create a new object by excluding specified properties
	const filteredObject = Object.fromEntries(
		Object.entries(inputObject).filter(
			([key]) => !excludedProperties.includes(key)
		)
	);

	// Convert the filtered object to a JSON string
	const filteredObjectString = JSON.stringify(filteredObject);

	// Store the JSON string in session storage
	sessionStorage.setItem("customerOrderData", filteredObjectString);
}
