

const { ObjectId } = require("mongodb");
const { connectDB, closeDB } = require("./db");

const categoryNames = [
  "Computer Science", "Fiction", "History", "Mathematics", "Physics",
  "Biology", "Philosophy", "Economics", "Psychology", "Literature",
];

// [title, author, category] - real book titles so the sample data looks realistic
const bookPool = [
  ["Effective Java", "Joshua Bloch", "Computer Science"],
  ["Clean Code", "Robert C. Martin", "Computer Science"],
  ["Introduction to Algorithms", "Thomas H. Cormen", "Computer Science"],
  ["The Pragmatic Programmer", "Andrew Hunt", "Computer Science"],
  ["Design Patterns", "Erich Gamma", "Computer Science"],
  ["Database System Concepts", "Abraham Silberschatz", "Computer Science"],
  ["Computer Networking: A Top-Down Approach", "James Kurose", "Computer Science"],
  ["Operating System Concepts", "Abraham Silberschatz", "Computer Science"],
  ["1984", "George Orwell", "Fiction"],
  ["To Kill a Mockingbird", "Harper Lee", "Fiction"],
  ["The Great Gatsby", "F. Scott Fitzgerald", "Fiction"],
  ["Pride and Prejudice", "Jane Austen", "Fiction"],
  ["The Catcher in the Rye", "J. D. Salinger", "Fiction"],
  ["One Hundred Years of Solitude", "Gabriel Garcia Marquez", "Fiction"],
  ["Brave New World", "Aldous Huxley", "Fiction"],
  ["The Kite Runner", "Khaled Hosseini", "Fiction"],
  ["Sapiens", "Yuval Noah Harari", "History"],
  ["Guns, Germs, and Steel", "Jared Diamond", "History"],
  ["A People's History of the United States", "Howard Zinn", "History"],
  ["The Diary of a Young Girl", "Anne Frank", "History"],
  ["The Silk Roads", "Peter Frankopan", "History"],
  ["Introduction to Linear Algebra", "Gilbert Strang", "Mathematics"],
  ["Calculus", "James Stewart", "Mathematics"],
  ["Discrete Mathematics and Its Applications", "Kenneth Rosen", "Mathematics"],
  ["A Mathematician's Apology", "G. H. Hardy", "Mathematics"],
  ["How to Solve It", "George Polya", "Mathematics"],
  ["A Brief History of Time", "Stephen Hawking", "Physics"],
  ["The Elegant Universe", "Brian Greene", "Physics"],
  ["Six Easy Pieces", "Richard Feynman", "Physics"],
  ["Cosmos", "Carl Sagan", "Physics"],
  ["Astrophysics for People in a Hurry", "Neil deGrasse Tyson", "Physics"],
  ["The Selfish Gene", "Richard Dawkins", "Biology"],
  ["On the Origin of Species", "Charles Darwin", "Biology"],
  ["The Gene: An Intimate History", "Siddhartha Mukherjee", "Biology"],
  ["Silent Spring", "Rachel Carson", "Biology"],
  ["Why We Sleep", "Matthew Walker", "Biology"],
  ["Meditations", "Marcus Aurelius", "Philosophy"],
  ["The Republic", "Plato", "Philosophy"],
  ["Thus Spoke Zarathustra", "Friedrich Nietzsche", "Philosophy"],
  ["Man's Search for Meaning", "Viktor Frankl", "Philosophy"],
  ["Sophie's World", "Jostein Gaarder", "Philosophy"],
  ["Freakonomics", "Steven Levitt", "Economics"],
  ["Thinking, Fast and Slow", "Daniel Kahneman", "Economics"],
  ["The Wealth of Nations", "Adam Smith", "Economics"],
  ["Capital in the Twenty-First Century", "Thomas Piketty", "Economics"],
  ["Nudge", "Richard Thaler", "Economics"],
  ["Influence", "Robert Cialdini", "Psychology"],
  ["The Power of Habit", "Charles Duhigg", "Psychology"],
  ["Quiet", "Susan Cain", "Psychology"],
  ["Flow", "Mihaly Csikszentmihalyi", "Psychology"],
  ["Emotional Intelligence", "Daniel Goleman", "Psychology"],
  ["War and Peace", "Leo Tolstoy", "Literature"],
  ["Crime and Punishment", "Fyodor Dostoevsky", "Literature"],
  ["Don Quixote", "Miguel de Cervantes", "Literature"],
  ["The Odyssey", "Homer", "Literature"],
  ["Hamlet", "William Shakespeare", "Literature"],
];

const firstNames = [
  "Arjun", "Priya", "Rohan", "Sneha", "Karthik", "Ananya", "Vikram", "Divya",
  "Aditya", "Meera", "Rahul", "Pooja", "Siddharth", "Neha", "Arnav", "Kavya",
  "Rajesh", "Shreya", "Manoj", "Isha", "Varun", "Riya", "Sanjay", "Tanvi", "Nikhil",
];
const lastNames = [
  "Kumar", "Sharma", "Reddy", "Iyer", "Nair", "Gupta", "Rao", "Patel", "Singh",
  "Menon", "Verma", "Joshi", "Pillai", "Mehta", "Agarwal", "Bose", "Chatterjee",
  "Desai", "Kapoor", "Malhotra",
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function randomIsbn() {
  let digits = "";
  for (let i = 0; i < 9; i++) digits += randInt(0, 9);
  return `978-0${digits}`;
}

function buildCategories() {
  return categoryNames.map((name) => ({
    _id: new ObjectId(),
    category_name: name,
    description: `Books related to ${name}`,
  }));
}

function buildBooks(categories) {
  const catIdByName = {};
  categories.forEach((c) => (catIdByName[c.category_name] = c._id));

  return bookPool.map(([title, author, category]) => {
    const totalCopies = randInt(2, 8);
    const availableCopies = randInt(0, totalCopies);
    return {
      _id: new ObjectId(),
      isbn: randomIsbn(),
      title,
      author: [author],
      category_id: catIdByName[category],
      total_copies: totalCopies,
      available_copies: availableCopies,
      publication_year: randInt(1950, 2024),
      publisher: "Sample Publishing House",
      added_on: daysAgo(randInt(30, 400)),
    };
  });
}

function buildMembers(count) {
  const members = [];
  const usedEmails = new Set();

  for (let i = 1; i <= count; i++) {
    const first = pick(firstNames);
    const last = pick(lastNames);
    let email = `${first.toLowerCase()}.${last.toLowerCase()}@vitstudent.ac.in`;
    if (usedEmails.has(email)) email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@vitstudent.ac.in`;
    usedEmails.add(email);

    members.push({
      _id: new ObjectId(),
      member_id: `LIB2026${String(i).padStart(3, "0")}`,
      name: `${first} ${last}`,
      email,
      phone: `9${randInt(100000000, 999999999)}`,
      membership_date: daysAgo(randInt(10, 500)),
      membership_status: Math.random() < 0.92 ? "active" : "suspended",
    });
  }
  return members;
}

// returns { loans, fines } - fines are built alongside loans since a fine
// only makes sense once we know a loan was overdue or returned late
function buildLoansAndFines(books, members, count) {
  const loans = [];
  const fines = [];
  const FINE_PER_DAY = 5; // Rs. 5/day, same idea used in the Review 1 sample doc

  for (let i = 0; i < count; i++) {
    const book = pick(books);
    const member = pick(members);
    const issueDate = daysAgo(randInt(1, 60));
    const dueDate = addDays(issueDate, 14);
    const now = new Date();

    const loanId = new ObjectId();
    let status, returnDate;

    if (dueDate > now) {
      // due date hasn't arrived yet - still with the member
      status = "issued";
      returnDate = null;
    } else if (Math.random() < 0.7) {
      // due date has passed but the book DID come back - could be on time or late
      status = "returned";
      const lateBy = Math.random() < 0.35 ? randInt(1, 10) : 0;
      returnDate = addDays(dueDate, lateBy - randInt(0, 3)); // small chance of early/on-time
      if (returnDate < issueDate) returnDate = issueDate;
      if (lateBy > 0) {
        fines.push({
          _id: new ObjectId(),
          loan_id: loanId,
          member_id: member._id,
          amount: lateBy * FINE_PER_DAY,
          reason: "Overdue return",
          paid_status: Math.random() < 0.6,
          generated_date: returnDate,
        });
      }
    } else {
      // due date passed and it's still out - genuinely overdue right now
      status = "overdue";
      returnDate = null;
      const daysLate = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
      fines.push({
        _id: new ObjectId(),
        loan_id: loanId,
        member_id: member._id,
        amount: Math.max(daysLate, 1) * FINE_PER_DAY,
        reason: "Overdue return",
        paid_status: false,
        generated_date: now,
      });
    }

    loans.push({
      _id: loanId,
      book_id: book._id,
      member_id: member._id,
      issue_date: issueDate,
      due_date: dueDate,
      return_date: returnDate,
      status,
    });
  }

  // sprinkle in a few "damaged item" fines unrelated to overdue returns
  for (let i = 0; i < 5; i++) {
    const loan = pick(loans);
    fines.push({
      _id: new ObjectId(),
      loan_id: loan._id,
      member_id: loan.member_id,
      amount: randInt(100, 400),
      reason: "Damaged item",
      paid_status: Math.random() < 0.5,
      generated_date: loan.issue_date,
    });
  }

  return { loans, fines };
}

async function main() {
  const db = await connectDB();

  const categories = buildCategories();
  const books = buildBooks(categories);
  const members = buildMembers(50);
  const { loans, fines } = buildLoansAndFines(books, members, 90);

  console.log("clearing old data...");
  await Promise.all([
    db.collection("categories").deleteMany({}),
    db.collection("books").deleteMany({}),
    db.collection("members").deleteMany({}),
    db.collection("loans").deleteMany({}),
    db.collection("fines").deleteMany({}),
  ]);

  await db.collection("categories").insertMany(categories);
  await db.collection("books").insertMany(books);
  await db.collection("members").insertMany(members);
  await db.collection("loans").insertMany(loans);
  await db.collection("fines").insertMany(fines);

  const total = categories.length + books.length + members.length + loans.length + fines.length;

  console.log("done seeding:");
  console.log("  categories:", categories.length);
  console.log("  books:     ", books.length);
  console.log("  members:   ", members.length);
  console.log("  loans:     ", loans.length);
  console.log("  fines:     ", fines.length);
  console.log("  TOTAL:     ", total);

  await closeDB();
}

// only auto-run when this file is executed directly (node seed.js),
// not when it's required elsewhere for its helper functions
if (require.main === module) {
  main().catch((err) => {
    console.error("seed failed:", err);
    process.exit(1);
  });
}

module.exports = { buildCategories, buildBooks, buildMembers, buildLoansAndFines };
