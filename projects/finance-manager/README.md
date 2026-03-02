# 💰 MERN Finance Tracker

A full-stack personal finance tracker built with **MongoDB**, **Express**, **React**, and **Node.js**. Track income & expenses, set budgets, manage multiple accounts, and view insightful reports — all in a clean, responsive UI with dark mode.

---

## ✨ Features

- **Dashboard** — Monthly summary with income/expense charts and category breakdown
- **Transactions** — Paginated list with filters (date range, category, type, search)
- **Budgets** — Per-category monthly limits with progress bars and alerts
- **Reports** — Yearly trends with charts and exportable CSV/JSON
- **Accounts** — Manage bank accounts, wallets, credit cards with balance aggregation
- **Settings** — Profile, password, theme (light/dark/system), notification preferences
- **Auth** — JWT-based login & registration
- **Recurring Transactions** — Automatic scheduling with configurable intervals
- **Responsive** — Mobile-friendly with collapsible sidebar

---

## 🗂 Project Structure

```
finance-manager/
├── client/                   # React frontend (Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/       # Recharts-based chart components
│   │   │   ├── common/       # Modal, Loader, EmptyState, StatCard, ProtectedRoute
│   │   │   ├── features/     # TransactionForm, BudgetForm, AccountCard, etc.
│   │   │   └── layout/       # AppLayout, Sidebar, Topbar
│   │   ├── context/          # AuthContext, ThemeContext
│   │   ├── lib/              # API client, utility functions
│   │   ├── pages/            # Dashboard, Transactions, Budgets, Reports, etc.
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                   # Express backend
│   ├── controllers/          # Route handlers
│   ├── middleware/            # Auth middleware, error handler
│   ├── models/               # Mongoose schemas (User, Transaction, Budget, Account)
│   ├── routes/               # Express route definitions
│   ├── utils/                # DB connection, logger, recurring scheduler
│   ├── index.js
│   ├── .env.example
│   └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local or Atlas)

### 1. Clone & Install

```bash
# From the project root
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

Copy the server `.env.example` to `.env` and fill in your values:

```bash
cp server/.env.example server/.env
```

```env
PORT=5050
MONGODB_URI=mongodb://localhost:27017/finance-tracker
JWT_SECRET=your-secret-key-here
ORIGIN=http://localhost:5173
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend on port `5050`.

---

## 🛠 Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | React 19, React Router 7, Recharts        |
| Styling    | Tailwind CSS v4, Lucide Icons             |
| Backend    | Express.js, Mongoose, JWT                 |
| Database   | MongoDB                                   |
| Tooling    | Vite 6, ESLint                            |
| UX         | react-hot-toast, dark/light/system theme  |

---

## 📡 API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | `/api/auth/register`      | Register a new user      |
| POST   | `/api/auth/login`         | Login & receive JWT      |
| GET    | `/api/auth/me`            | Get current user         |
| PUT    | `/api/auth/profile`       | Update profile           |
| PUT    | `/api/auth/password`      | Change password          |
| GET    | `/api/transactions`       | List (paginated, filtered)|
| POST   | `/api/transactions`       | Create transaction       |
| PUT    | `/api/transactions/:id`   | Update transaction       |
| DELETE | `/api/transactions/:id`   | Delete transaction       |
| GET    | `/api/budgets`            | List budgets             |
| POST   | `/api/budgets`            | Create budget            |
| PUT    | `/api/budgets/:id`        | Update budget            |
| DELETE | `/api/budgets/:id`        | Delete budget            |
| GET    | `/api/accounts`           | List accounts            |
| POST   | `/api/accounts`           | Create account           |
| PUT    | `/api/accounts/:id`       | Update account           |
| DELETE | `/api/accounts/:id`       | Delete account           |
| GET    | `/api/reports/dashboard`  | Dashboard summary        |
| GET    | `/api/reports/trends`     | Monthly trends           |
| GET    | `/api/reports/categories` | Category breakdown       |
| GET    | `/api/reports/export`     | Export CSV/JSON          |

---

## 📄 License

MIT
