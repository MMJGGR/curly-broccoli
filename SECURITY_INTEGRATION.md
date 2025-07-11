# Future Security Integration

This document outlines how additional security features can be integrated into the existing authentication system while keeping JWT tokens stateless.

## Google OAuth2

A separate endpoint `/login/google` will initiate the OAuth2 authorization code flow with Google. Upon successful callback, the server will issue a JWT containing the user's email as `sub` and the claim `scope: "google"`. The OAuth2 client ID and secret will be managed through environment variables.

## Multi-Factor Authentication

When MFA is enabled for a user, successful verification will result in a JWT that includes the claim `"mfa": true`. The verification step will happen after password validation or Google OAuth2 and may use an OTP delivered via SMS or authenticator app. The rest of the token structure remains the same to preserve statelessness.

## Recovery Tokens and Email Verification

The system can be extended with recovery tokens used for password reset or email verification. These tokens will be short-lived JWTs containing a specific `scope` (e.g., `"recover"` or `"verify"`). They can be emailed to the user. Once redeemed, a new regular access token is issued. The access token format remains unchanged, ensuring compatibility with existing clients.
