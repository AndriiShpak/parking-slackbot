const { Client } = require("pg");

const connection = `${process.env.DATABASE_URL}?sslmode=require`

async function createTables() {
  const client = new Client(connection);
  await client.connect();
  const now = await client.query("SELECT NOW()");
  await client.end();

  return now;
}

async function clientDemo() {
  const client = new Client(connection);
  await client.connect();
  const now = await client.query("SELECT NOW()");
  await client.end();

  return now;
}

module.exports = {
  clientDemo,
}
