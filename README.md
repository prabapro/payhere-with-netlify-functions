# Payhere Payment Gateway with Netlify Functions (Jamstack)

### Docs

- [JavaScript SDK](https://support.payhere.lk/api-&-mobile-sdk/javascript-sdk)
- [Test Cards](https://support.payhere.lk/sandbox-and-testing)

## Fauna DB

- Create a Database in US Region Group.
- Go to the Database > Security > Create a secret key with the server role.
- Add the key to the `.env` file as `FAUNA_SECRET_KEY`
- Run below to create the collection `payhere-deme-orders` & index `orders_by_orderId`
  ```shell
  node faunadb/faunaSetup.js
  ```
