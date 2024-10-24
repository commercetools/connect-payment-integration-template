# connect-payment-integration-template [**Early Access**]

This repository provides a [connect](https://docs.commercetools.com/connect) template for payment integration connector. This boilerplate code acts as a starting point for integration with external payment service provider.

## 1. Introduction

### Purpose
The purpose of this documentation is to describe the process and structure for integrating various Payment Service Providers (PSPs) with the commercetools Checkout. The integration aims to provide a standardized template that PSPs can use as a starting point to build their own implementations. By offering a consistent pattern, this documentation facilitates a streamlined integration process, making it easier for PSPs to adapt their payment services to work seamlessly with the commercetools platform.

### Scope
This documentation covers the architecture, design patterns, and detailed implementation process for integrating PSPs with the commercetools checkout. It includes an explanation of supported integration methods, API interactions, and key design considerations. The document does not cover non-payment-related aspects of commercetools, such as inventory management or order fulfillment.

### Audience
The primary audience for this documentation includes:
- **Developers** who will be implementing or customizing the integration.
- **Solution Architects** responsible for designing and adapting the integration to meet specific business needs.
- **DevOps Engineers** who may need to configure, deploy, and maintain the integration in production environments.

### Pre-requisites
Before using this documentation, the reader should have a solid understanding of the following:
- **Commercetools platform**: Knowledge of the commercetools APIs, custom objects, and checkout processes.
- **Payment Provider System API**: Familiarity with the APIs and integration methods of PSPs (e.g., Adyen, PayPal).
- **General API integration principles**: Understanding of RESTful services, OAuth2 authentication, and webhooks is beneficial.

### Overview of Commercetools and PSPs
Commercetools is a headless commerce platform that enables businesses to create customized and scalable e-commerce experiences. Its modular architecture allows for easy integration with third-party services, including payment providers. 

Payment Service Providers (PSPs) like Adyen, PayPal, and others offer a range of payment methods such as credit card, iDEAL, PayPal, and more. Each PSP provides different ways to integrate with their services:
- **Payment Components**: Individual payment methods that can be rendered as standalone components.
- **Drop-ins**: A solution that allows multiple payment methods to be rendered simultaneously. This can either embed a payment form directly into the page or redirect the user to a hosted payment page.
<!-- - **Express Checkout**: Enables users to complete payments using certain methods in fewer steps, improving the user experience. -->

The integration template described in this documentation supports both **onsite** and **offsite** payment methods:
- **Onsite**: Payment methods are rendered directly on the merchant’s website, allowing users to complete payments without leaving the page.
- **Offsite**: Users are redirected to a third-party page provided by the PSP to complete the payment, and are then redirected back to the merchant’s website upon completion.

This template provides a flexible approach to integrate various payment methods and PSP capabilities into commercetools checkout, making it easier for businesses to implement and manage their payment solutions.

## 2. Architecture Overview

### System Architecture Diagram
**[Placeholder for Diagram]**

This diagram should represent the high-level interaction between the following systems:
- commercetools Checkout
- Enabler (JavaScript frontend)
- Processor (Backend API service)
- Payment Service Providers (PSPs)
- commercetools Core Commerce
- commercetools Session and OAuth API

The diagram should depict the flow of requests and responses between these components, highlighting key touchpoints like API interactions, webhooks, and any event-driven flows that occur during the payment process.

### Components Overview

1. **commercetools Connect**: 
   - A runtime environment provided by commercetools to deploy and run small applications and integrations.
   - The integration for PSPs runs on commercetools Connect and is structured into two main components: **Enabler** and **Processor**.

2. **Enabler**:
   - A JavaScript library that is loaded in the user's browser via commercetools Checkout.
   - Responsible for rendering the payment form and ensuring PCI compliance by handling payment details securely.
   - It triggers the payment process by interacting with the Processor and can handle both onsite and offsite payment methods.
   - Exposes a `submit()` function that is called by commercetools Checkout to initiate the payment process.

3. **Processor**:
   - A backend application that exposes APIs to handle requests from both the Enabler and commercetools Checkout.
   - Manages interactions with the Payment Service Provider, including operations like authorization, capture, refund, and cancellation.
   - Updates payment information and payment transactions on commercetools Core Commerce based on interactions with the PSP.
   - Optionally, it can expose additional endpoints to listen for asynchronous notifications (e.g., webhook events from PSPs) and update payment statuses accordingly.

4. **Payment Provider (PSP)**:
   - Handles the core payment operations such as authorization, capture, refund, and cancellation.
   - Supports different payment methods (e.g., credit card, iDEAL, PayPal).
   - Depending on the payment method, it can support **onsite** payments (embedded in the merchant’s page) or **offsite** payments (redirecting users to the PSP's site for processing and then redirecting back).

5. **commercetools Checkout**:
   - Orchestrates the payment process by managing the payment methods and payment data flow between the user and PSP.
   - It initiates the creation of a **commercetools Order** from the initial **Cart** created by the merchant.
   - Stores information such as the payment session, cart details, and payment methods to be displayed.

6. **commercetools Session**:
   - Provides an API for storing session information, allowing secure communication between the frontend (Enabler) and backend (Processor).
   - Ensures a trusted relationship between the Enabler and Processor by using session tokens to validate interactions.

7. **commercetools OAuth**:
   - A service for authenticating server-to-server interactions using OAuth 2.0 protocols.
   - Manages the issuance and validation of client credentials, allowing secure communication between commercetools services and the Processor.

### Data Flow

1. **Payment Session Initialization**:
   - **commercetools Checkout** creates a payment session, storing the cart information, processor URL, PSP, and the `paymentInterface` (which will be set on the `paymentMethodInfo` in commercetools).
   - This session contains data necessary for the Enabler and Processor to coordinate during the payment process.

2. **Payment Form Rendering**:
   - **Enabler** loads in the user's browser and renders the payment form based on the selected PSP.
   - It ensures that all interactions are PCI compliant, preventing access to sensitive payment information outside of the PSP.

3. **Payment Submission**:
   - When the user initiates the payment, **commercetools Checkout** calls the `submit()` function exposed by the Enabler.
   - The Enabler sends a request to the **Processor** with payment details, including the amount to be charged.

4. **Payment Processing**:
   - The **Processor** communicates with the **PSP** to confirm the payment.
   - It handles both **onsite** methods (where the payment is completed directly on the merchant's page) and **offsite** methods (where users are redirected to a PSP-hosted page and then redirected back).

5. **Updating Payment Status**:
   - The **Processor** updates the payment and payment transactions in **commercetools Core Commerce** based on the response from the PSP.
   - This may include updating the status to indicate whether a payment was successful, pending, or failed.

6. **Handling Asynchronous Notifications** (if applicable):
   - For payment methods that require asynchronous handling (e.g., delayed capture, refunds), the **Processor** can listen for notifications from the PSP (webhooks).
   - Upon receiving a notification, it processes the data and updates the payment status in **commercetools Core Commerce** accordingly.

### Integration Type
The integration is structured as a hybrid approach, incorporating both **API-based** and **frontend components**:
- **API-based**: The **Processor** acts as a middleware layer that facilitates communication between commercetools, PSPs, and the Enabler.
- **Frontend Component**: The **Enabler** is a client-side JavaScript library that integrates directly into the commercetools Checkout, enabling the rendering of payment forms and facilitating user interactions.

This hybrid approach allows the integration to support a wide range of payment methods and user experiences, providing flexibility for merchants while ensuring a secure and reliable payment flow. It is also designed to function as a **standalone solution**, enabling custom integrations with the Processor if commercetools Checkout is not used.