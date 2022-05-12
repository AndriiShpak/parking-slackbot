const { Client } = require("pg");

const connectionString = process.env.DATABASE_URL;

async function createTables() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const now = await client.query("SELECT NOW()");
  await client.end();

  return now;
}

async function clientDemo() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const now = await client.query("SELECT NOW()");
  await client.end();

  return now;
}

module.exports = {
  clientDemo,
}
