# Library Management System — Review 3 (full web app)

BCSE302P Database Systems Lab. Builds on Reviews 1 and 2 — same MongoDB
collections, same seed/CRUD/aggregation/transaction logic — now wrapped in
an actual Express server with a login-protected dashboard UI.

## Setup

1. Same `.env`/connection string as Review 2:
   ```
   export MONGODB_URI="your-atlas-connection-string"
   ```
   (Windows PowerShell: `$env:MONGODB_URI="..."`)

2. Install dependencies:
   ```
   npm install
   ```

3. If you haven't already (or want a fresh dataset), reload the data:
   ```
   npm run seed
   npm run indexes
   ```

4. Create the admin login (one-time):
   ```
   npm run setup-admin
   ```
   Default login is `admin` / `admin123`. Override with
   `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars if you want something else,
   e.g. `set ADMIN_PASSWORD=yourpassword && npm run setup-admin` (Windows) or
   `ADMIN_PASSWORD=yourpassword npm run setup-admin` (Mac/Linux).

5. Start the server:
   ```
   npm start
   ```

6. Open **http://localhost:3000** in your browser and log in.

## What's in the dashboard

- **Overview** — live counts: books in catalog, active members, loans
  currently out, overdue loans, total unpaid fines.
- **Books** — search/filter by title, author, ISBN, or category; add, edit,
  delete.
- **Members** — search, add, edit, delete.
- **Loans** — issue a book to a member (runs the Review 2 transaction:
  decrements `available_copies` and creates the loan atomically) and return
  a book (closes the loan, restores the copy, auto-creates a fine if it's
  late).
- **Fines** — view and mark fines as paid.
- **Reports** — the 5 aggregation pipelines from Review 2 (most borrowed, overdue, category stats, top unpaid fines, average fine by reason), plus a new
  **recommendation engine**: pick a member, see books in categories they've
  already borrowed from that they haven't read yet and that have copies
  available.

## Project structure

| File/folder | What it does |
|---|---|
| `server.js` | Express app — wires up sessions, static files, and all API routes |
| `middleware/auth.js` | blocks API routes unless you're logged in |
| `routes/` | one file per resource (`auth`, `books`, `members`, `loans`, `fines`, `reports`) |
| `public/` | the frontend — `login.html`, `dashboard.html`, `style.css`, `app.js` (vanilla JS, no framework) |
| `db.js`, `seed.js`, `indexes.js`, `crud.js`, `aggregations.js`, `transactions.js` | unchanged from Review 2 — the server reuses these directly |
| `setup-admin.js` | creates/resets the one admin login |

## How this maps to the rubric

- **Complete working demonstration (3 marks)** — log in, issue a book,
  return it late, watch a fine appear, mark it paid. Every piece of the
  system is exercised through the UI.
- **Advanced queries/analytics (2 marks)** — the Reports tab, including the
  new recommendation query (`recommendationsForMember` in
  `aggregations.js`), which wasn't part of Review 2.
- **User interface and usability (3 marks)** — responsive dashboard with
  login, search/filter, modals for add/edit, and inline status badges.
  Collapses to a mobile-friendly layout under ~760px width.
- **Presentation, viva voce (2 marks)** — see the presentation slides and
  user manual delivered alongside this code.
