# Shared

Pure TypeScript code shared between the `frontend` and `backend` packages.
No Node‑specific or browser‑specific APIs are allowed here.

## Structure

```
types/   # Core domain interfaces (User, Listing, Order, etc.)
utils/   # Pure helper functions (validators, formatters)
```

## Usage

Both frontend and backend reference this via TypeScript `paths`:
```json
"@shared/*": ["../shared/*"]
```
