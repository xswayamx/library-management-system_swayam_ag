

const { connectDB, closeDB } = require("./db");

async function main() {
  const db = await connectDB();

  console.log("\n--- CREATE ---");
  const category = await db.collection("categories").findOne({ category_name: "Computer Science" });
  const newBook = {
    isbn: "978-0000000001",
    title: "Grokking Algorithms",
    author: ["Aditya Bhargava"],
    category_id: category._id,
    total_copies: 4,
    available_copies: 4,
    publication_year: 2016,
    publisher: "Manning Publications",
    added_on: new Date(),
  };
  const insertResult = await db.collection("books").insertOne(newBook);
  console.log("inserted new book with _id:", insertResult.insertedId);

  console.log("\n--- READ ---");
  const csBooks = await db.collection("books")
    .find({ category_id: category._id })
    .project({ title: 1, author: 1, available_copies: 1, _id: 0 })
    .toArray();
  console.log(`found ${csBooks.length} Computer Science books, e.g.:`, csBooks.slice(0, 3));

  const anyMember = await db.collection("members").findOne({ membership_status: "active" });
  console.log("sample active member:", anyMember.name, anyMember.member_id);

  console.log("\n--- UPDATE ---");
  const updateResult = await db.collection("books").updateOne(
    { _id: insertResult.insertedId },
    { $set: { available_copies: 3 }, $inc: { total_copies: 0 } }
  );
  console.log("books matched/modified:", updateResult.matchedCount, updateResult.modifiedCount);

  const suspendResult = await db.collection("members").updateOne(
    { _id: anyMember._id },
    { $set: { membership_status: "active" } } 
  );
  console.log("member update acknowledged:", suspendResult.acknowledged);

  console.log("\n--- DELETE ---");
  const deleteResult = await db.collection("books").deleteOne({ _id: insertResult.insertedId });
  console.log("deleted book count:", deleteResult.deletedCount);

  await closeDB();
}

main().catch((err) => {
  console.error("crud demo failed:", err);
  process.exit(1);
});
