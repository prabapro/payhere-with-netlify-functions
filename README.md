# Payhere Payment Gateway with Netlify Functions & Fauna DB

[![Netlify Status](https://api.netlify.com/api/v1/badges/2980db89-af0d-47f1-84f0-ef19414bead6/deploy-status)](https://app.netlify.com/sites/praba-payhere-with-netlify-functions/deploys)

A Node.js app to integrate Payhere.lk payment gateway using Netlify Functions & Fauna DB.

- [Payhere JavaScript SDK](https://support.payhere.lk/api-&-mobile-sdk/javascript-sdk)
- [Payhere Test Cards](https://support.payhere.lk/sandbox-and-testing)

## 🚀 Getting started

1. Clone the repo & run `npm install` to install the dependencies.
2. Setup the [Fauna DB](#fauna-db) connection & create the collection & index.
3. Add [Environment Variables](#environment-variables) to `.env` file.

## 👨‍💻 Development Environment

To ensure the seamless functioning of the entire funnel, follow these steps:

- Execute both `netlify dev` and set up `ngrok` to examine the complete process. This is necessary as Payhere requires a public-facing URL for the `notify_url`.
- If the repository is already linked to a Netlify site, simply run `netlify dev --live` without the need for ngrok. You can use `netlify link` to connect the repository and the Netlify site efficiently.

### Fauna DB

- Create a Database in US Region Group.
- Go to the Database > Security > Create a secret key with the server role.
- Add the key to the `.env` file as `FAUNA_SECRET_KEY`
- Run below to create the collection `payhere-demo-orders` & index `orders_by_order_id`
  ```shell
  node faunadb/faunaSetup.js
  ```

### Environment Variables

- Generate `.env` file from `.env.example` and add your env variables.
  ```shell
  cp .env.example .env
  ```
- If new keys are added to the `.env` file, run below command to update the example file with new keys.
  ```shell
  sed 's/=.*/=/' .env > .env.example
  ```

## FAQ

**1. Why Netlify Functions?**

- 🔐 **Security**: The Payhere Merchant Secret is required for generating the hash. Performing this operation on the front-end poses security risks. Netlify Functions act as a secure backend for handling the hash generation process.
- 📡 **Server Callback**: Netlify Functions listen to payment notifications from PayHere, facilitating the passing of relevant information to the front-end.

**2. Why Fauna DB?**

- 🏦 **Payment Status Handling**: Since PayHere doesn't provide payment status parameters to the `return_url` during customer redirection, updating the database upon fetching payment status via your `notify_url` script is crucial.
- 🏢 **Modern Database Solution**: Fauna DB is a cloud-native database with a flexible document data model. It seamlessly integrates semi-structured data with powerful relational features, including foreign keys, views, and joins.
- 🔁 **Efficient Data Retrieval:** Integration with Fauna DB allows you to efficiently retrieve payment status & display to customers on the `return_url` page.
