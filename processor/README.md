# Payment Integration Processor
This module provides an application based on [commercetools Connect](https://docs.commercetools.com/connect), which is triggered by HTTP requests from Checkout UI for payment operations.

The corresponding payment, cart or order details would be fetched from composable commerce platform, and then be sent to external PSPs for various payment operations such as create/capture/cancel/refund payment.

The module also provides template scripts for post-deployment and pre-undeployment action. After deployment or before undeployment via connect service completed, customized actions can be performed based on users' needs.

## Getting Started

These instructions will get you up and running on your local machine for development and testing purposes.
Please run following npm commands under `processor` folder.

#### Install PSP SDK
In case SDK is provided by payment service provider for communication purpose, you can import the SDK by following commands
```
$ npm install <psp-sdk>
```
#### Install dependencies
```
$ npm install
```
#### Build the application in local environment. NodeJS source codes are then generated under dist folder
```
$ npm run build
```
#### Run automation test
```
$ npm run test
```
#### Run the application in local environment. Remind that the application has been built before it runs
```
$ npm run start
```
#### Fix the code style
```
$ npm run lint:fix
```
#### Verify the code style
```
$ npm run lint
```
#### Run post-deploy script in local environment
```
$ npm run connector:post-deploy
```
#### Run pre-undeploy script in local environment
```
$ npm run connector:pre-undeploy
```

## Running application

Setup correct environment variables: check `processor/src/config/config.ts` for default values.

Make sure commercetools client credential have at least the following permissions:

* `manage_payments`
* `view_sessions`
* `introspect_oauth_tokens`

```
npm run dev
```

## Authentication

Some of the services have authentication mechanism. 

* `oauth2`: Relies on commercetools OAuth2 server
* `session`: Relies on commercetools session service
* `jwt`: Relies on the jwt token injected by the merchant center via the forward-to proxy

### OAuth2
OAuth2 token can be obtained from commercetools OAuth2 server. It requires API Client created beforehand. For details, please refer to [Requesting an access token using the Composable Commerce OAuth 2.0 service](https://docs.commercetools.com/api/authorization#requesting-an-access-token-using-the-composable-commerce-oauth-20-service).

### Session
Payment connectors relies on session to be able to share information between `enabler` and `processor`.
To create session before sharing information between these two modules, please execute following request to commercetools session service
```
POST https://session.<region>.commercetools.com/<commercetools-project-key>/sessions
Authorization: Bearer <oauth token with manage_sessions scope>

{
  "cart": {
    "cartRef": {
      "id": "<cart-id>" 
    }
  },
  "metadata": {
    "allowedPaymentMethods": ["card", "ideal", ...],
    "paymentInterface"?: "<payment interface that will be set on payment method info https://docs.commercetools.com/api/projects/payments#ctp:api:type:PaymentMethodInfo>"
  }
}
```

Afterwards, session ID can be obtained from response, which is necessary to be put as `x-session-id` inside request header when sending request to endpoints such as `/operations/config` and `/operations/payments`.

### JSON web token (JWT)

`jwt` needs some workaround to be able to test locally as it depends on the merchant center forward-to proxy.

In order to make easy running the application locally, following commands help to build up a jwt mock server:

####Set environment variable to point to the jwksUrl
```
export CTP_JWKS_URL="http://localhost:9000/jwt/.well-known/jwks.json"
```
####Run the jwt server
```
docker compose up -d
```

####Obtain JWT
```
# Request token
curl --location 'http://localhost:9000/jwt/token' \
--header 'Content-Type: application/json' \
--data '{
    "iss": "https://mc-api.europe-west1.gcp.commercetools.com",
    "sub": "subject",
    "https://mc-api.europe-west1.gcp.commercetools.com/claims/project_key": "<commercetools-project-key>"
}'
```
Token can be found in response
```
{"token":"<token>"}
```

Use the token to authenticate requests protected by JWT: `Authorization: Bearer <token>`. 

## APIs

### Create transaction

Private endpoint used for server-to-server payment processing, for example to charge a recurring order's billing cycle using a previously stored payment method. Unlike the other endpoints, it is not called from Checkout front-end but from a backend system. It is protected by `manage_project` and `manage_checkout_transactions` access rights of composable commerce OAuth2 token.

#### Endpoint

`POST /operations/transactions`

#### Request Parameters

- cartId: Id of the cart to charge.
- checkoutTransactionItemId: Id of the checkout payment-transaction item this request is processing. The commercetools Payment created for this charge is linked to this value.
- amount
  - centAmount: Amount in the smallest indivisible unit of a currency. For example, 5 EUR is specified as 500 while 5 JPY is specified as 5. It must match the currency and not exceed the outstanding amount of the cart, otherwise the request is rejected.
  - currencyCode: Currency code compliant to [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)
- paymentMethodId: Id of the previously stored payment method to charge.
- idempotencyKey: Key used to make repeated requests for the same charge attempt idempotent. In a real PSP integration this would be forwarded to the PSP's own idempotency mechanism - this mock does not call a real PSP, so the value is accepted but unused.
- type: Type of transaction to process. Currently only `Recurring` is supported.

#### Response Parameters

- transactionStatus
  - state: Result of the transaction. It can be `Pending`, `Failed` or `Completed`. `Pending` means the PSP accepted the charge but has not confirmed it yet - typical of payment methods that are settled asynchronously and may still be confirmed at a later point. This mock decides the outcome synchronously and never returns `Pending`; a real PSP integration built from this template is likely to.
  - errors: List of errors, present when the payment was rejected.
- paymentId: Id of the commercetools Payment resource created for this charge, when available.

```
{
    transactionStatus: {
        state: "Pending|Failed|Completed",
        errors: [{ code: "PaymentRejected", message: "<message>" }]
    },
    paymentId: "<paymentId>"
}
```