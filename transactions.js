
const { connectDB, closeDB, getClient } = require("./db");

async function issueBook(db, client, bookId, memberId) {
  const session = client.startSession();
  try {
    let newLoanId;
    await session.withTransaction(async () => {
      const book = await db.collection("books").findOne({ _id: bookId }, { session });
      if (!book || book.available_copies < 1) {
        throw new Error("book not available");
      }

      await db.collection("books").updateOne(
        { _id: bookId },
        { $inc: { available_copies: -1 } },
        { session }
      );

      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const result = await db.collection("loans").insertOne(
        {
          book_id: bookId,
          member_id: memberId,
          issue_date: issueDate,
          due_date: dueDate,
          return_date: null,
          status: "issued",
        },
        { session }
      );
      newLoanId = result.insertedId;
    });
    return newLoanId;
  } finally {
    await session.endSession();
  }
}

async function returnBook(db, client, loanId) {
  const session = client.startSession();
  try {
    let fineCreated = null;
    await session.withTransaction(async () => {
      const loan = await db.collection("loans").findOne({ _id: loanId }, { session });
      if (!loan) throw new Error("loan not found");

      const now = new Date();
      await db.collection("loans").updateOne(
        { _id: loanId },
        { $set: { status: "returned", return_date: now } },
        { session }
      );

      await db.collection("books").updateOne(
        { _id: loan.book_id },
        { $inc: { available_copies: 1 } },
        { session }
      );

      if (now > loan.due_date) {
        const daysLate = Math.ceil((now - loan.due_date) / (1000 * 60 * 60 * 24));
        const fine = {
          loan_id: loanId,
          member_id: loan.member_id,
          amount: daysLate * 5,
          reason: "Overdue return",
          paid_status: false,
          generated_date: now,
        };
        const result = await db.collection("fines").insertOne(fine, { session });
        fineCreated = { ...fine, _id: result.insertedId };
      }
    });
    return fineCreated;
  } finally {
    await session.endSession();
  }
}

async function main() {
  const db = await connectDB();
  const client = getClient();

  const book = await db.collection("books").findOne({ available_copies: { $gt: 0 } });
  const member = await db.collection("members").findOne({ membership_status: "active" });

  console.log(`issuing "${book.title}" to ${member.name}...`);
  const loanId = await issueBook(db, client, book._id, member._id);
  console.log("book issued successfully (copies decremented + loan created), loan id:", loanId);

  console.log("returning the same loan...");
  const fine = await returnBook(db, client, loanId);
  console.log("book returned successfully (loan closed + copies incremented)", fine ? `- fine created: Rs.${fine.amount}` : "- no fine (on time)");

  await closeDB();
}

if (require.main === module) {
  main().catch((err) => {
    console.error("transaction demo failed:", err.message);
    process.exit(1);
  });
}

module.exports = { issueBook, returnBook };
