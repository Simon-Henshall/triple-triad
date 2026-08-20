# Security Policy

## Scope

This is a fan-made, read-only game application backed by seeded fictional data. It does not currently provide accounts, authentication, payments, or a mechanism for users to submit personal data.

The security boundary includes the PHP application, its public API endpoints, the MySQL database, browser-loaded third-party assets, and the CI workflow.

## Reporting a Vulnerability

Please do not open a public issue for a suspected security vulnerability. Report it privately through the repository owner's GitHub contact or the repository's private vulnerability reporting feature, and include:

- A concise description and impact
- Reproduction steps or a proof of concept
- Affected endpoint, file, or dependency version
- Any suggested mitigation

Please allow reasonable time for investigation and remediation before public disclosure. Do not include real personal data or active credentials in a report.

## Supported Versions

Only the default branch is actively maintained. This project is not intended for production use without an operator first reviewing its deployment, database, and HTTP security configuration.

## Security Expectations

- Never commit `.env` files, credentials, private keys, or production data.
- Run the application behind HTTPS in any non-local environment.
- Use a least-privilege database account rather than a database administrator account.
- Keep PHP, Node.js, browser dependencies, and the operating system patched.
