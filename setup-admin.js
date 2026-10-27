
const bcrypt = require("bcryptjs");
const { connectDB, closeDB } = require("./db");

const USERNAME = process.env.ADMIN_USERNAME || "admin";
const PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function main() {
  const db = await connectDB();
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  await db.collection("users").updateOne(
    { username: USERNAME },
    { $set: { username: USERNAME, password_hash: passwordHash, role: "admin" } },
    { upsert: true }
  );

  console.log(`admin user ready -> username: "${USERNAME}", password: "${PASSWORD}"`);
  console.log("(change these with ADMIN_USERNAME / ADMIN_PASSWORD env vars if you want something else)");

  await closeDB();
}

main().catch((err) => {
  console.error("admin setup failed:", err);
  process.exit(1);
});
