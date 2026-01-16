import { MongoClient } from "mongodb";

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

let db;

export async function connectdb() {
  await client.connect();
  db = client.db("db_1");
  console.log("connected to db");
}

export function getdb() {
  return db;
}
