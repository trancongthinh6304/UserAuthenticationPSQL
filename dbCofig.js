require("dotenv").config();

const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
// command to connect to DB on termninal: psql -p 5000 -U thinhtran -d postgres

const pool = new Pool({
  connectionString: isProduction
    ? process.env.DB_DATABASE_URL
    : connectionString,
});

module.exports = { pool };
