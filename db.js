/** Database setup for BizTime. */

import pkg from "pg";
const { Client } = pkg;

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///biztime_test";
} else {
  DB_URI = "postgresql:///biztime";
}

let db = new Client({
  connectionString: DB_URI
});

db.connect();

export default db;