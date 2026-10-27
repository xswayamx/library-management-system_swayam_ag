// server.js
// the web app - serves the dashboard frontend + the JSON API it talks to.
// run with: node server.js, then open http://localhost:3000

const path = require("path");
const express = require("express");
const session = require("express-session");
const { connectDB, getClient } = require("./db");
const { requireAuth } = require("./middleware/auth");

const PORT = process.env.PORT || 3000;

async function main() {
  const db = await connectDB();
  const client = getClient();

  const app = express();
  app.use(express.json());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "library-secret-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 * 4 }, // 4 hour login
    })
  );

  app.get("/", (req, res) => {
    res.redirect(req.session.username ? "/dashboard.html" : "/login.html");
  });

  // public assets (login page, dashboard html/css/js) - no auth needed to
  // load the files themselves, the API calls behind them are what's guarded
  app.use(express.static(path.join(__dirname, "public")));

  // auth routes are open (you need them to log in)
  app.use("/api/auth", require("./routes/auth")(db));

  // everything else requires a logged-in session
  app.use("/api/books", requireAuth, require("./routes/books")(db));
  app.use("/api/members", requireAuth, require("./routes/members")(db));
  app.use("/api/loans", requireAuth, require("./routes/loans")(db, client));
  app.use("/api/fines", requireAuth, require("./routes/fines")(db));
  app.use("/api/reports", requireAuth, require("./routes/reports")(db));

  app.listen(PORT, () => {
    console.log(`library management system running at http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("server failed to start:", err);
  process.exit(1);
});
