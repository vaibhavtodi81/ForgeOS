# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Backend authentication

Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` to the backend
API root, including `/api/v1` (for example, `http://localhost:4000/api/v1`).
The frontend authenticates with `POST /auth/login` and validates a restored
session with `GET /auth/me`.

The backend currently returns a bearer token in the login response and does
not issue an HttpOnly cookie. Tokens are held in `sessionStorage` by default;
selecting “Remember me” stores the token in `localStorage` so it survives
browser restarts. Browser storage is accessible to JavaScript, so an XSS
vulnerability could expose a token. The frontend clears tokens on logout and
on authenticated 401 responses; server-side authorization remains authoritative.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
