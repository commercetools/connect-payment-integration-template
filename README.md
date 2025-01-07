# connect-payment-integration-template

This repository provides a [connect](https://docs.commercetools.com/connect) template for payment integration connector. This boilerplate code acts as a starting point for integration with external payment service provider.

## Template Features

- Typescript language supported.
- Uses Fastify as web server framework.
- Uses [commercetools SDK](https://docs.commercetools.com/sdk/js-sdk-getting-started) for the commercetools-specific communication.
- Uses [connect payment SDK](https://github.com/commercetools/connect-payments-sdk) to manage request context, sessions and JWT authentication.
- Includes local development utilities in npm commands to build, start, test, lint & prettify code.

## Prerequisite

#### 1. commercetools composable commerce API client

Users are expected to create API client responsible for payment management in composable commerce project. Details of the API client are taken as input as environment variables/ configuration for connect such as `CTP_PROJECT_KEY` , `CTP_CLIENT_ID`, `CTP_CLIENT_SECRET`. For details, please read [Deployment Configuration](./README.md#deployment-configuration).
In addition, please make sure the API client should have enough scope to be able to manage payment. For details, please refer to [Running Application](./processor/README.md#running-application)

#### 2. various URLs from commercetools composable commerce

Various URLs from commercetools platform are required to be configured so that the connect application can handle session and authentication process for endpoints.
Their values are taken as input as environment variables/ configuration for connect with variable names `CTP_API_URL`, `CTP_AUTH_URL` and `CTP_SESSION_URL`.

## Getting started

The template contains two modules :

- Enabler: Acts as a wrapper implementation in which frontend components from PSPs embedded. It gives control to checkout product on when and how to load the connector frontend based on business configuration. In cases connector is used directly and not through Checkout product, the connector library can be loaded directly on frontend than the PSP one.
- Processor : Acts as backend services which is middleware to 3rd party PSPs to be responsible for managing transactions with PSPs and updating payment entity in composable commerce. `connect-payment-sdk` will be offered to be used in connector to manage request context, sessions and other tools necessary to transact.

Regarding the development of processor module, please refer to the following documentations:

### Currencies

A special note regarding the usage of currencies and working with them. commercetools provides monetary values in cent amounts which adheres to the <https://en.wikipedia.org/wiki/ISO_4217> standard.

This means that for the currency `EUR` the minor units will be expressed with fraction digits of 2. I.e. a value of 1 euro and 50 cents will be expressed as `150`. Some currencies have 0 or even 4 fraction digits.

It's important to note that individual PSP could differ from this standard and/or require special attention when passing data between the connector and psp. So it's important to convert properly on the input and output layer when interacting with PSP.

commercetools provides the library [connect-payments-sdk](https://github.com/commercetools/connect-payments-sdk) which includes various utility function to help with these conversions.

- [Development of Processor](./processor/README.md)

#### 1. Develop your specific needs

To proceed payment operations via external PSPs, users need to extend this connector with the following task

- API communication: Implementation to communicate between this connector application and the external system using libraries provided by PSPs. Please remember that the payment requests might not be sent to PSPs successfully in a single attempt. It should have needed retry and recovery mechanism.

#### 2. Register as connector in commercetools Connect

Follow guidelines [here](https://docs.commercetools.com/connect/getting-started) to register the connector for public/private use.

## Deployment Configuration

In order to deploy your customized connector application on commercetools Connect, it needs to be published. For details, please refer to [documentation about commercetools Connect](https://docs.commercetools.com/connect/concepts)
In addition, in order to support connect, the tax integration connector template has a folder structure as listed below

```
├── enabler
│   ├── src
│   ├── test
│   └── package.json
├── processor
│   ├── src
│   ├── test
│   └── package.json
└── connect.yaml
```

Connect deployment configuration is specified in `connect.yaml` which is required information needed for publishing of the application. Following is the deployment configuration used by Enabler and Processor modules

```
deployAs:
  - name: enabler
    applicationType: assets
  - name: processor
    applicationType: service
    endpoint: /
    configuration:
      standardConfiguration:
        - key: CTP_PROJECT_KEY
          description: commercetools project key
          required: true
        - key: CTP_CLIENT_ID
          description: commercetools client ID with manage_payments, manage_orders, view_sessions, view_api_clients, manage_checkout_payment_intents & introspect_oauth_tokens scopes
          required: true
        - key: CTP_AUTH_URL
          description: commercetools Auth URL
          required: true
          default: https://auth.europe-west1.gcp.commercetools.com
        - key: CTP_API_URL
          description: commercetools API URL
          required: true
          default: https://api.europe-west1.gcp.commercetools.com
        - key: CTP_SESSION_URL
          description: Session API URL
          required: true
          default: https://session.europe-west1.gcp.commercetools.com
        - key: CTP_JWKS_URL
          description: JWKs url (example - https://mc-api.europe-west1.gcp.commercetools.com/.well-known/jwks.json)
          required: true
          default: https://mc-api.europe-west1.gcp.commercetools.com/.well-known/jwks.json
        - key: CTP_JWT_ISSUER
          description: JWT Issuer for jwt validation (example - https://mc-api.europe-west1.gcp.commercetools.com)
          required: true
          default: https://mc-api.europe-west1.gcp.commercetools.com
      securedConfiguration:
        - key: CTP_CLIENT_SECRET
          description: commercetools client secret
          required: true
```

Here you can see the details about various variables in configuration

- `CTP_PROJECT_KEY`: The key of commercetools composable commerce project.
- `CTP_CLIENT_ID`: The client ID of your commercetools composable commerce user account. It is used in commercetools client to communicate with commercetools composable commerce via SDK. Expected scopes are: `manage_payments` `manage_orders` `view_sessions` `view_api_clients` `manage_checkout_payment_intents` `introspect_oauth_tokens` `manage_types` `view_types`.
- `CTP_CLIENT_SECRET`: The client secret of commercetools composable commerce user account. It is used in commercetools client to communicate with commercetools composable commerce via SDK.
- `CTP_AUTH_URL`: The URL for authentication in commercetools platform. It is used to generate OAuth 2.0 token which is required in every API call to commercetools composable commerce. The default value is `https://auth.europe-west1.gcp.commercetools.com`. For details, please refer to documentation [here](https://docs.commercetools.com/tutorials/api-tutorial#authentication).
- `CTP_API_URL`: The URL for commercetools composable commerce API. Default value is `https://api.europe-west1.gcp.commercetools.com`.
- `CTP_SESSION_URL`: The URL for session creation in commercetools platform. Connectors relies on the session created to be able to share information between enabler and processor. The default value is `https://session.europe-west1.gcp.commercetools.com`.
- `CTP_JWKS_URL`: The URL which provides JSON Web Key Set. Default value is `https://mc-api.europe-west1.gcp.commercetools.com/.well-known/jwks.json`
- `CTP_JWT_ISSUER`: The issuer inside JSON Web Token which is required in JWT validation process. Default value is `https://mc-api.europe-west1.gcp.commercetools.com`

## Development

In order to get started developing this connector certain configuration are necessary, most of which involve updating environment variables in both services (enabler, processor).

#### Configuration steps

#### 1. Environment Variable Setup

Navigate to each service directory and duplicate the .env.template file, renaming the copy to .env. Populate the newly created .env file with the appropriate values.

```bash
cp .env.template .env
```

#### 2. Spin Up Components via Docker Compose

With the help of docker compose, you are able to spin up all necessary components required for developing the connector by running the following command from the root directory;

```bash
docker compose up
```

This command would start 3 required services, necessary for development

1. JWT Server
2. Enabler
3. Processor
