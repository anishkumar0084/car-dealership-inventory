# 🚗 Car Dealership Inventory System

A full-stack inventory management system for car dealerships, built with a RESTful backend API and a React single-page application frontend. Users can register, log in, browse and search vehicles, and purchase them. Admin users get additional privileges to add, edit, delete, and restock vehicles.

---

## Tech Stack

**Backend**
- Node.js + Express + TypeScript
- PostgreSQL (via Prisma ORM)
- JWT-based authentication
- bcrypt for password hashing
- Jest + Supertest for testing

**Frontend**
- React + TypeScript (Vite)
- Tailwind CSS
- React Router
- Axios

---

## Features

- User registration and login with JWT authentication
- Role-based access control (regular users vs. admin)
- Browse all available vehicles
- Search/filter vehicles by make, model, category, and price range
- Purchase a vehicle (decreases stock; disabled when out of stock)
- Admin-only: Add, edit, delete, and restock vehicles
- Protected routes on the frontend (redirects unauthenticated users to login)

---

## Project Structure

```
car-dealership-inventory/
├── backend/                 # Express + TypeScript API
│   ├── src/
│   │   ├── controllers/     # Route handler logic
│   │   ├── routes/          # Express route definitions
│   │   ├── middleware/      # Auth middleware (JWT verification, admin check)
│   │   ├── lib/             # Prisma client instance
│   │   └── tests/           # Jest + Supertest test suites
│   └── prisma/
│       └── schema.prisma    # Database schema (User, Vehicle models)
├── frontend/                # React + Tailwind SPA
│   └── src/
│       ├── pages/           # Login, Register, Dashboard
│       ├── components/      # VehicleCard, VehicleFormModal, ProtectedRoute
│       ├── context/         # AuthContext (global auth state)
│       └── api/             # Axios instance with JWT interceptor
├── screenshots/             # Application screenshots
├── test-report.txt          # Backend test suite results
├── PROMPTS.md                # AI tool chat history
└── README.md
```
---

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL installed and running locally

### 1. Clone the Repository

```bash
git clone https://github.com/anishkumar0084/car-dealership-inventory.git
cd car-dealership-inventory
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder with the following:

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/car_dealership"
JWT_SECRET="your-secret-key-here"


Create the database (using `psql` or pgAdmin):

```sql
CREATE DATABASE car_dealership;
```

Run Prisma migrations to create the tables:

```bash
npx prisma migrate dev
```

Start the backend server:

```bash
npm run dev
```

The API will run on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.

### 4. Running Tests (Backend)

```bash
cd backend
npm test
```

To generate a coverage report:

```bash
npx jest --coverage
```
---

## Making a User an Admin

Currently, admin promotion is done directly in the database (no admin-invite flow was in scope for this kata). After registering a user normally:

1. Open pgAdmin (or `psql`)
2. Update the `role` column for that user from `user` to `admin` in the `User` table
3. Log out and log back in on the frontend to receive a token with the updated role

---

## API Endpoints

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Log in and receive a JWT | No |
| POST | `/api/vehicles` | Add a new vehicle | Yes |
| GET | `/api/vehicles` | List all vehicles | Yes |
| GET | `/api/vehicles/search` | Search by make/model/category/price | Yes |
| PUT | `/api/vehicles/:id` | Update a vehicle | Yes |
| DELETE | `/api/vehicles/:id` | Delete a vehicle | Yes (Admin only) |
| POST | `/api/vehicles/:id/purchase` | Purchase a vehicle (decrement quantity) | Yes |
| POST | `/api/vehicles/:id/restock` | Restock a vehicle (increment quantity) | Yes (Admin only) |

---

## Screenshots

### Login Page
![Login](./screenshots/Login.png)

### Register Page
![Register](./screenshots/Register.png)

### Dashboard
![Dashboard](./screenshots/Dashboard.png)

### Admin Dashboard (with Edit/Restock/Delete actions)
![Admin Dashboard](./screenshots/AdminDashboard.png)

### Add New Vehicle
![Add Vehicle](./screenshots/AddNewVechicle.png)

---

## Test Report

The backend was built using Test-Driven Development (Red-Green-Refactor). All 22 tests pass, covering authentication, vehicle CRUD, search, purchase, and admin-only restrictions.

See [test-report.txt](./test-report.txt) for the full Jest output, including ~90% statement coverage across controllers, middleware, and routes.

Summary:
```
Test Suites: 2 passed, 2 total
Tests:       22 passed, 22 total
```

---

## My AI Usage

I used **Claude** (Anthropic) throughout this project as a pair-programming assistant, guiding me step-by-step through the entire build.

**How I used it:**
- **Project scaffolding**: Setting up the Express + TypeScript backend, Prisma + PostgreSQL integration, and the Vite + React + Tailwind frontend.
- **Debugging dependency/version conflicts**: I ran into several environment issues (e.g., Prisma 7's breaking config changes, TypeScript 7 incompatibility with `ts-jest`/`ts-node-dev`), and Claude helped me diagnose the errors and pick stable, compatible versions instead of bleeding-edge ones.
- **TDD workflow**: For every backend feature, Claude helped me write the failing test first (RED), confirm it failed for the right reason, then write the minimal implementation to make it pass (GREEN). This was done for registration, login, vehicle CRUD, search, purchase, and restock.
- **Frontend components**: Claude generated the initial structure for pages (Login, Register, Dashboard) and reusable components (VehicleCard, VehicleFormModal, ProtectedRoute), which I then tested and adjusted through manual QA in the browser.
- **Test resilience fix**: When I noticed that some search tests could fail depending on pre-existing data in the database (a real fragility issue), Claude helped me refactor those tests to assert against specific expected vehicles instead of exact result counts, making them independent of other data in the DB.
- **Documentation**: This README, along with commit message conventions and AI co-authorship formatting, was structured with Claude's help.

**Reflection:**
Using AI as a guided, step-by-step pair programmer significantly sped up environment setup and reduced time spent debugging obscure version-compatibility errors. It also reinforced good practices I might have otherwise skipped under time pressure — like writing tests before implementation, cleaning up test data between runs, and keeping generated build artifacts (like `coverage/`) out of version control. That said, I made sure to run and verify every test, endpoint, and UI interaction myself before committing, and to understand the code being added rather than blindly accepting it — the goal was to use AI as an accelerant for my own decision-making, not a replacement for it.

---

## Deliverables Checklist

- [x] Public GitHub repository
- [x] README with setup instructions, screenshots, AI usage section
- [x] Test report (`test-report.txt`)
- [x] `PROMPTS.md` with full AI chat history
- [ ] (Optional) Live deployment link