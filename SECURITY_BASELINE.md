# Deployment Security Baseline

This project is designed for local development and review. A public deployment must satisfy the following minimum controls before it is exposed to the internet.

## Application and transport

- Serve the application over HTTPS and redirect HTTP to HTTPS.
- Add HSTS only after HTTPS is confirmed for every relevant subdomain.
- Keep the Content Security Policy in `index.php` aligned with any dependency changes.
- Do not expose `.env`, database dumps, logs, coverage output, or SQL source files through the web server.
- Configure PHP with `display_errors=0` and send errors to a protected system log.

## Database and secrets

- Use a separate database account with only the privileges needed by the application.
- Store credentials in the hosting environment or a secrets manager, not in the repository.
- Use different credentials for local development, CI, staging, and production.
- Back up the database and periodically verify that a restore works.

## Operations

- Keep PHP, MySQL, Node.js, the operating system, and browser dependencies patched.
- Review Dependabot updates and do not bypass the CI dependency-audit step without recording why.
- Define an owner, log-retention period, rollback procedure, and vulnerability-response contact for each deployment.
- Treat the seeded player records as fictional test data. Perform a privacy review before adding real user data.

This baseline is an operational checklist, not a claim that the application is certified under a compliance framework.
