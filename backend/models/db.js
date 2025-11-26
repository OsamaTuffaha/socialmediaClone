const { Pool } = require("pg");

const connectionString = process.env.CONNECTION_URL; // ← صح

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then(() => {
    console.log("DB Connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = pool;
