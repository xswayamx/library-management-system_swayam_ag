

const { connectDB, closeDB } = require("./db");

async function main() {
  const db = await connectDB();

  // isbn should never repeat across books, and it's the field we search by most
  const i1 = await db.collection("books").createIndex({ isbn: 1 }, { unique: true });

  // member_id is the library card number - also unique, also searched a lot
  const i2 = await db.collection("members").createIndex({ member_id: 1 }, { unique: true });

  // speeds up "give me all overdue loans" / "give me all loans for this member"
  const i3 = await db.collection("loans").createIndex({ status: 1 });
  const i4 = await db.collection("loans").createIndex({ member_id: 1 });

  console.log("indexes created:", [i1, i2, i3, i4]);

  const bookIndexes = await db.collection("books").indexes();
  const memberIndexes = await db.collection("members").indexes();
  const loanIndexes = await db.collection("loans").indexes();

  console.log("\nbooks indexes:", bookIndexes.map((i) => i.name));
  console.log("members indexes:", memberIndexes.map((i) => i.name));
  console.log("loans indexes:", loanIndexes.map((i) => i.name));

  await closeDB();
}

main().catch((err) => {
  console.error("index creation failed:", err);
  process.exit(1);
});
