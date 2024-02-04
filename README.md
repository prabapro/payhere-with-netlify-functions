# Payhere Payment Gateway with Netlify Functions & Fauna DB

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

- Rename the `.env.example` file to `.env` and add your env variables.
- If new keys are added to the `.env` file, run below command to update the template with new keys.
  ```shell
  sed 's/=.*/=/' .env > .env.example
  ```

## FAQ

**1. Why Netlify Functions?**

Netlify Functions are utilized for two key reasons in this setup. Firstly, Payhere necessitates the hashing of the merchant secret alongside other parameters. Therefore, Netlify Functions serve as the backend for performing the hashing process and handling the receipt of payment notifications from Payhere.

**2. Why Fauna DB?**

Payhere mandates the verification of payment notifications before any actions are taken on the payment response. Fauna DB serves as a temporary storage solution for incoming order IDs while the server conducts checksum validation.
