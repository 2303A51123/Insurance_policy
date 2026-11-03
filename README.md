# Insurance Policy and Claims Management System

A beginner-friendly MERN application for managing insurance products, policyholders, policies, claims, premium payments, and reports.

## Technology

- **Frontend:** React, React Router, Vite, plain CSS
- **Backend:** Node.js and Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens and bcrypt password hashing

## Project structure

```text
backend/
  config/        MongoDB connection
  controllers/   Authentication, products, and reports
  middleware/    Authentication and role checks
  models/        User, InsuranceProduct, Policy, Claim, Payment
  routes/        Express API endpoints
  seed/          Demonstration data
  test/          MongoDB-backed API tests
  uploads/       Uploaded claim documents
frontend/
  src/
    components/  Navigation, tables, notices, page headings
    context/     Login state
    pages/       Login, register, dashboards, and management screens
    services/    API connection
```

## Requirements

- Node.js 18 or newer
- MongoDB Community Server running locally, or a MongoDB connection string
- npm

## Installation

1. Copy `.env.example` to `.env` in the project root.
2. Set `MONGODB_URI` to your MongoDB connection string.
3. Replace `JWT_SECRET` with a long private value.
4. Install backend packages:

   ```powershell
   Set-Location backend
   npm install
   ```

5. In another terminal, install frontend packages:

   ```powershell
   Set-Location frontend
   npm install
   ```

## Run the application

In the backend terminal:

```powershell
Set-Location backend
npm run seed
npm run dev
```

In the frontend terminal:

```powershell
Set-Location frontend
npm run dev
```

Open the frontend address printed by Vite (usually `http://localhost:5173`). The Vite development server forwards `/api` and `/uploads` requests to the Express API at `http://localhost:5000`.

The seed command creates demonstration data only when the database has no users. It creates four accounts, two products, two policies, a payment, and a claim.

## Demonstration accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@insurance.com` | `Admin@123` |
| Policy Agent | `agent@insurance.com` | `Agent@123` |
| Policy Holder | `holder@insurance.com` | `Holder@123` |
| Claims Officer | `officer@insurance.com` | `Officer@123` |

Public registration creates policyholder accounts only. An admin or agent can also register policyholders from the Users screen.

## Screens and roles

- **Login and registration:** Sign in or create a policyholder account.
- **Dashboard:** Role-aware counts for policies, claims, pending reviews, products, and completed premium payments.
- **Insurance products:** Everyone can browse; admins can add, edit, or delete products.
- **Policies:** Admins and agents create policies; policyholders see only their own policies and renewal dates.
- **Claims:** Policyholders submit claims and optional supporting documents. Claims officers review assigned claims, add remarks, approve/reject, and record a settlement. Admins can assign claims officers.
- **Premium payments:** Admins and agents record payment entries; policyholders see their payment history. This is a classroom record-keeping feature, not a real payment gateway.
- **Reports:** Admins can view the policy register, claims status, premium collection, and claim settlement reports.
- **Users:** Admins view all users; admins and agents can register policyholders.

Uploaded claim documents can be PDF, PNG, JPG, or Word files up to 5 MB. Only the policyholder who submitted the claim, its assigned claims officer, and an admin can view the file.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `/api/users` and `/api/users/policyholders`
- `/api/products` — list, add, update, and delete products
- `/api/policies` — list and create policies
- `/api/claims` — submit and list claims; review and assign claims
- `/api/payments` — list and record premium payments
- `/api/reports/policy-register`
- `/api/reports/claims-status`
- `/api/reports/premium-collection`
- `/api/reports/claim-settlement`
- `GET /api/dashboard/summary`
- `GET /api/health`

Protected API requests use an `Authorization: Bearer <token>` header. The API checks roles and limits policyholder data to the signed-in user.

## Tests and production build

With MongoDB running, run:

```powershell
Set-Location backend
npm test
```

The API integration test uses a separate database named `insurance_policy_test` and removes its data when complete.

Build the React frontend:

```powershell
Set-Location frontend
npm run build
```
