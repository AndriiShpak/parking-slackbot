const { Client } = require("pg");

async function createTables() {
  const client = new Client(process.env.DATABASE_URL);
  await client.connect();
  const now = await client.query("SELECT NOW()");
  await client.end();

  return now;
}

async function clientDemo() {
  const client = new Client(process.env.DATABASE_URL);
  await client.connect();
  const now = await client.query("SELECT NOW()");
  await client.end();

  return now;
}

module.exports = {
  clientDemo,
}
