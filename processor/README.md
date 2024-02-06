# Payment Integration template Processor

## Getting Started

These instructions will get you up and running on your local machine for development and testing purposes.

### Prerequisites

```
npm install
```

### Running application

Setup correct environment variables: check `processor/src/config/config.ts` for default values.

Make sure `clientId` and `clientSecret` have at least the following permissions:

* `manage_payments`
* `manage_checkout_payment_intents`
* `view_sessions`
* `introspect_oauth_tokens`

```
npm run dev
```

#### Additional notes

Some of the services have authentication mechanism. 

* `jwt`: Relies on the jwt token injected by the merchant center via the forward-to proxy
* `session`: Relies on commercetools session service
* `oauth2`: Relies on commercetools oauth2 server

While `session` and `oauth2` authentication mechanisms are easy to work locally, `jwt` will need some workaround to be able to test locally as depends on the merchant center forward-to proxy.

In order to make easy running the application locally, the code comes with a jwt mock server:

```
# Set environment variable to point to the jwksUrl
export CTP_JWKS_URL="http://localhost:9000/jwt/.well-known/jwks.json"

# Run the jwt server
docker compose up -d
```

**Get a token**
```
# Request token
curl --location 'http://localhost:9000/jwt/token' \
--header 'Content-Type: application/json' \
--data '{
    "iss": "https://mc-api.europe-west1.gcp.commercetools.com",
    "sub": "subject",
    "https://mc-api.europe-west1.gcp.commercetools.com/claims/project_key": "<project-key>"
}'

{"token":"<token>"}
```

Use the token to authenticate requests protected by JWT: `Authorization: Bearer <token>`. 