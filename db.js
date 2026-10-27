
require("node:dns/promises").setServers(["8.8.8.8", "1.1.1.1"]);

const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "library_db";

let client;
let db;

async function connectDB() {
  if (db) return db; // already connected, reuse it
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log(`connected to MongoDB -> db: ${dbName}`);
  return db;
}

async function closeDB() {
  if (client) await client.close();
}

function getClient() {
  return client; 
}

module.exports = { connectDB, closeDB, getClient };
