# AI Tool Chat History

This document summarizes the prompts and interactions used with **Claude** (Anthropic) throughout the development of this project. The full raw conversation was conducted in the Claude chat interface across an extended session covering Git setup, backend development (TDD), frontend development, and documentation.

---

## 1. Project Setup & Git

**Prompts included:**
- "ye hame project mila create karne ko step by step kaise kya karna he" (initial request for step-by-step guidance)
- Requests to set up Git, initialize the repository, create `.gitignore`, and connect to a public GitHub repo
- Step-by-step guidance for creating the project folder structure (backend/frontend)

**Outcome:** Initialized Git repo, created `.gitignore`, README stub, connected to GitHub (`anishkumar0084/car-dealership-inventory`).

---

## 2. Backend Setup

**Prompts included:**
- Requests to scaffold an Express + TypeScript backend
- Debugging: `ts-node-dev` crashing due to TypeScript 7 incompatibility → switched to `tsx`
- Debugging: Prisma 7 breaking schema changes (datasource `url` no longer supported directly) → downgraded to Prisma 6 for stability
- Setting up PostgreSQL database connection via Prisma, defining `User` and `Vehicle` models, running migrations

**Outcome:** Working Express server connected to PostgreSQL via Prisma ORM.

---

## 3. TDD — Authentication

**Prompts included:**
- Requests to follow strict Red-Green-Refactor TDD for `POST /api/auth/register` and `POST /api/auth/login`
- Debugging: TypeScript couldn't recognize Jest globals (`describe`, `it`) → fixed `tsconfig.json` types array
- Debugging: tests failing due to leftover data from previous runs → added `beforeAll`/`afterAll` cleanup hooks

**Outcome:** 5 passing tests covering registration (with duplicate email handling) and login (with JWT generation, invalid password/email handling).

---

## 4. TDD — Vehicle CRUD & Inventory

**Prompts included:**
- Step-by-step RED-GREEN cycles for each vehicle endpoint:
  - `POST /api/vehicles` (create, auth-protected)
  - `GET /api/vehicles` (list)
  - `GET /api/vehicles/search` (filter by make/model/category/price range)
  - `PUT /api/vehicles/:id` (update)
  - `DELETE /api/vehicles/:id` (admin-only, using `requireAdmin` middleware)
  - `POST /api/vehicles/:id/purchase` (decrement quantity, reject if out of stock)
  - `POST /api/vehicles/:id/restock` (admin-only, increment quantity, reject invalid amounts)
- Debugging: TypeScript strict typing errors on `req.params.id`
- Refactor: Fixed search tests that were fragile to pre-existing database data — changed assertions from exact result counts to checking for specific expected vehicles

**Outcome:** 22 passing tests total, ~90% statement coverage across controllers, middleware, and routes.

---

## 5. Frontend Development

**Prompts included:**
- Setting up Vite + React + TypeScript + Tailwind CSS v4
- Debugging: incorrect Vite template scaffolded initially (Vanilla instead of React) → recreated project
- Building: AuthContext (global auth state with localStorage persistence), Axios instance with JWT interceptor
- Building pages: Login, Register, Dashboard
- Building components: VehicleCard (with purchase button disabled when out of stock), VehicleFormModal (add/edit vehicle), ProtectedRoute (redirect unauthenticated users)
- Debugging: `verbatimModuleSyntax` requiring `import type` for `ReactNode`
- Manual QA: registering a user, promoting to admin via pgAdmin, testing add/edit/delete/restock/purchase flows end-to-end

**Outcome:** Fully functional SPA connected to the backend API, with role-based UI (admin-only controls).

---

## 6. Documentation & Final Deliverables

**Prompts included:**
- Generating a Jest coverage report and saving it as `test-report.txt`
- Cleaning up the generated `coverage/` folder from version control (added to `.gitignore`)
- Writing the full `README.md` (tech stack, setup instructions, API reference, screenshots, test summary, this "My AI Usage" section)
- Creating this `PROMPTS.md` file

---

## Reflection on AI Usage

Claude was used as a step-by-step pair-programming guide rather than a one-shot code generator. Every piece of code was reviewed, tested, and run locally before committing — including catching and fixing a real test-fragility bug (search tests depending on exact database counts) that came from my own manual testing, not from Claude's original design. AI accelerated environment setup, debugging of version-compatibility issues, and boilerplate generation, while I retained responsibility for verifying correctness, running the test suite, and understanding every change before committing it to Git.