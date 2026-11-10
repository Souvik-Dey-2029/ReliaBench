# BugFix: Django CSRF Middleware bypass

## Objective
Inspect `django/middleware/csrf.py`. A regression introduced in a custom header parser fails to reject unauthorized cross-origin POST requests when the `X-Requested-With` header is forged without a valid session cookie.

## Requirements
1. Identify the unverified condition in `_check_token`.
2. Ensure invalid or forged token origins are rejected with HTTP 403 Forbidden.
3. Pass all unit tests in `tests/test_csrf.py`.

