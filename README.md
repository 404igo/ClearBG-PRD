# ClearBG Editor — Prototype

Frontend prototype for the user-management, executive dashboard, infrastructure, and audit-log requirements in `product_requirement_document.md`.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. Run `npm run build` to produce a static production bundle.

## Demo walkthrough

- Use **Mode demo** in the top navigation to switch among Admin, Owner, and Tech Admin views.
- As Admin, search/filter users, invite a customer, edit a profile/status/credit balance, simulate a password-reset request, deactivate an account, or export user CSV.
- As Owner, review example financial KPIs and the six-month chart, then export a demo CSV or open the browser print-to-PDF flow.
- As Tech Admin, adjust the sample batch size/timeout and confirm the simulated change. Use **Simulasikan API down** to check the telemetry fallback and retry state.
- Open Audit Log to search, inspect, and export simulated actions created during the current browser session.

## Prototype boundary

This is a frontend-only prototype. User records, financial metrics, GPU telemetry, authentication, password reset, email delivery, and audit events are sample/local state; data is not persisted to a server and disappears when the app reloads. The role selector is a design/demo aid, **not authentication or access control**. Do not use real customer, financial, credential, or infrastructure data.

Before production, connect the UI to server-side identity and RBAC, user/credit ledger, billing/finance, GPU telemetry/configuration, email, and append-only audit services. Enforce authorization and validation on every backend endpoint; define finance formulas, safe infrastructure limits, session/token policy, and data-retention requirements with their owners. Revisit the TLS deployment, monitoring, backups, rollback, and security/performance acceptance criteria in the PRD.
