# Insurance_policy: Insurance Policy and Claims Management System

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

- Node.js 22 or newer
- MongoDB Community Server running locally, or a MongoDB connection string
- npm

## Installation

1. Copy `.env.example` to `.env` in the project root.
2. Set `MONGODB_URI` to your MongoDB connection string.
3. Replace `JWT_SECRET` with a long private value.
4. Install backend packages from the lock file:

   ```powershell
   Set-Location .\backend
   npm ci
   ```

5. In another terminal, install frontend packages:

   ```powershell
   Set-Location .\frontend
   npm ci
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

Open the frontend address printed by Vite (usually `http://localhost:5173`). The Vite development server forwards `/api` requests to the Express API at `http://localhost:5000`.

The seed command creates demonstration data only when the database has no users. It creates four accounts, two products, two policies, a payment, and a claim.

Only run the seed command against a local demonstration database. It creates accounts with published sample passwords; never seed a production database.

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
- **Claims:** Policyholders select an available insurance product directly in the claim form's policy dropdown. Selecting a product immediately activates it for that customer, who can then submit claims against their own policies and attach supporting documents. Claims officers review assigned claims, add remarks, approve/reject, and record a settlement. Admins can assign claims officers.
- **Premium payments:** Admins and agents record payment entries. Policyholders see the amount paid and remaining balance for each policy, then can record the full remaining amount as a simulated bank transfer. No bank details are collected and no real money moves.
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
- `GET /api/payments/balances` — see the signed-in policyholder's remaining premium amounts
- `POST /api/payments/repay` — record a demo bank transfer for a policy's remaining premium
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

## Deployment

### Single-container deployment (Docker)

The root `Dockerfile` builds the React frontend and serves it and the API from one Node.js service. This avoids separate frontend/API CORS configuration.

1. Build the image from the repository root:

   ```sh
   docker build -t insurance-policy .
   ```

2. Run it with a production MongoDB connection and a private JWT secret:

   ```sh
   docker run --name insurance-policy \
     -p 5000:5000 \
     -e MONGODB_URI="your-production-mongodb-uri" \
     -e JWT_SECRET="$(openssl rand -hex 32)" \
     -v insurance-uploads:/app/backend/uploads \
     insurance-policy
   ```

3. Configure the hosting platform's health check as `GET /api/health`. Keep the `insurance-uploads` volume persistent so claim documents survive restarts and redeploys.

Set secrets in the hosting provider's environment settings rather than committing them. Use a managed MongoDB database with a dedicated, least-privilege database user. Never run the demo seed script on production.

### Separate frontend and API services

The frontend and API can also be deployed separately:

### Backend service

- Build/install command: `npm ci` (run from `backend/`)
- Start command: `npm start`
- Configure these environment variables in the hosting dashboard:
  - `MONGODB_URI`: production MongoDB connection string. Use a dedicated database user with only the required database permissions.
  - `JWT_SECRET`: a private random value with at least 32 characters. Do not reuse the example value.
  - `CORS_ORIGIN`: the exact public frontend origin, without a trailing slash. Multiple origins can be comma-separated.
  - `NODE_ENV`: `production`
  - `PORT`: use the value supplied by the host.
  - `UPLOAD_DIR`: optional path to persistent storage for claim documents. If omitted, files are written to `backend/uploads`.
- Configure the API host's health check to use `GET /api/health`. It returns `503` until MongoDB is connected.
- Uploaded documents need durable storage. Attach a persistent volume and point `UPLOAD_DIR` at it, or use a storage service before deploying to a host with an ephemeral filesystem.

### Frontend static site

- Install and build from `frontend/`:
  ```sh
  npm ci
  npm run build
  ```
- Publish directory: `frontend/dist`
- Set `VITE_API_URL` at build time to the deployed API base URL, including `/api` (for example, `https://your-api.example.com/api`).
- Configure the static host to serve `index.html` for client-side routes such as `/dashboard` and `/payments`.
- Add the static site's exact origin to the backend's `CORS_ORIGIN`, then rebuild/redeploy the frontend if its API URL changes.

### Deploy the frontend to Vercel

The frontend is a static Vite application. The API must remain deployed separately (for example, as the Render backend service described above).

1. Import this repository into Vercel.
2. Set **Root Directory** to `frontend` and enable **Include files outside the root directory** only if Vercel requests it. The frontend build does not require files outside `frontend/`.
3. Use these build settings:
   - Framework preset: **Vite**
   - Install command: `npm ci`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add `VITE_API_URL` as a Vercel environment variable for the deployment environments you use. Set it to the full backend API URL, including `/api`, for example `https://your-backend.onrender.com/api`. Do not add a trailing slash.
5. Deploy the site, then set the backend service's `CORS_ORIGIN` to the exact Vercel site origin (for example, `https://your-project.vercel.app`, without a trailing slash). Include your custom domain too if you use one. Save the backend environment change and redeploy/restart the backend.
6. Redeploy the frontend after changing `VITE_API_URL`; Vite embeds it into the build. The included `vercel.json` rewrite sends client-side routes such as `/dashboard` and `/payments` back to `index.html`.
7. Check `https://your-backend.onrender.com/api/health` and confirm it returns `{"status":"ok"}` before testing the Vercel site. A frontend deployment does not fix a backend that cannot connect to MongoDB.

Do not run `npm run seed` on production; it creates well-known demo accounts and demonstration records. The project is a college/demo application: premium repayment records a simulated transfer and does not process real money.
