
const { connectDB, closeDB } = require("./db");

async function mostBorrowedBooks(db, limit = 5) {
  return db.collection("loans").aggregate([
    { $group: { _id: "$book_id", timesBorrowed: { $sum: 1 } } },
    { $sort: { timesBorrowed: -1 } },
    { $limit: limit },
    { $lookup: { from: "books", localField: "_id", foreignField: "_id", as: "book" } },
    { $unwind: "$book" },
    { $project: { _id: 0, title: "$book.title", timesBorrowed: 1 } },
  ]).toArray();
}

async function overdueList(db) {
  return db.collection("loans").aggregate([
    { $match: { status: "overdue" } },
    { $lookup: { from: "books", localField: "book_id", foreignField: "_id", as: "book" } },
    { $lookup: { from: "members", localField: "member_id", foreignField: "_id", as: "member" } },
    { $unwind: "$book" },
    { $unwind: "$member" },
    { $project: { _id: 0, title: "$book.title", member: "$member.name", due_date: 1 } },
  ]).toArray();
}

async function categoryStats(db) {
  return db.collection("books").aggregate([
    { $group: { _id: "$category_id", bookCount: { $sum: 1 }, totalCopies: { $sum: "$total_copies" } } },
    { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
    { $unwind: "$category" },
    { $project: { _id: 0, category: "$category.category_name", bookCount: 1, totalCopies: 1 } },
    { $sort: { bookCount: -1 } },
  ]).toArray();
}

async function topFineOwers(db, limit = 5) {
  return db.collection("fines").aggregate([
    { $match: { paid_status: false } },
    { $group: { _id: "$member_id", totalOwed: { $sum: "$amount" }, fineCount: { $sum: 1 } } },
    { $sort: { totalOwed: -1 } },
    { $limit: limit },
    { $lookup: { from: "members", localField: "_id", foreignField: "_id", as: "member" } },
    { $unwind: "$member" },
    { $project: { _id: 0, member: "$member.name", totalOwed: 1, fineCount: 1 } },
  ]).toArray();
}

async function avgFineByReason(db) {
  return db.collection("fines").aggregate([
    { $group: { _id: "$reason", avgAmount: { $avg: "$amount" }, count: { $sum: 1 } } },
    { $sort: { avgAmount: -1 } },
  ]).toArray();
}

async function recommendationsForMember(db, memberId, limit = 5) {
  return db.collection("loans").aggregate([
    { $match: { member_id: memberId } },
    { $lookup: { from: "books", localField: "book_id", foreignField: "_id", as: "book" } },
    { $unwind: "$book" },
    { $group: { _id: null, categoryIds: { $addToSet: "$book.category_id" }, borrowedBookIds: { $addToSet: "$book._id" } } },
    {
      $lookup: {
        from: "books",
        let: { catIds: "$categoryIds", borrowedIds: "$borrowedBookIds" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$category_id", "$$catIds"] },
                  { $not: [{ $in: ["$_id", "$$borrowedIds"] }] },
                  { $gt: ["$available_copies", 0] },
                ],
              },
            },
          },
          { $lookup: { from: "categories", localField: "category_id", foreignField: "_id", as: "category" } },
          { $unwind: "$category" },
          { $project: { _id: 0, title: 1, author: 1, category: "$category.category_name", available_copies: 1 } },
          { $limit: limit },
        ],
        as: "recommendations",
      },
    },
    { $project: { _id: 0, recommendations: 1 } },
  ]).toArray();
}

async function main() {
  const db = await connectDB();

  console.log("\n--- 1. Most borrowed books (top 5) ---");
  console.log(await mostBorrowedBooks(db));

  console.log("\n--- 2. Overdue loans right now ---");
  console.log(await overdueList(db));

  console.log("\n--- 3. Category-wise book counts ---");
  console.log(await categoryStats(db));

  console.log("\n--- 4. Top 5 members by unpaid fines ---");
  console.log(await topFineOwers(db));

  console.log("\n--- 5. Average fine amount by reason ---");
  console.log(await avgFineByReason(db));

  console.log("\n--- 6. Book recommendations for a sample member ---");
  const anyMember = await db.collection("members").findOne({});
  const recs = await recommendationsForMember(db, anyMember._id);
  console.log(`recommendations for ${anyMember.name}:`, recs[0] ? recs[0].recommendations : []);

  await closeDB();
}

if (require.main === module) {
  main().catch((err) => {
    console.error("aggregation demo failed:", err);
    process.exit(1);
  });
}

module.exports = {
  mostBorrowedBooks, overdueList, categoryStats, topFineOwers,
  avgFineByReason, recommendationsForMember,
};
