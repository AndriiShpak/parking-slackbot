const { Client } = require("pg");

async function executeQuery(query, parameters = null) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ...(process.env.IS_LOCAL ? {} : { ssl: { rejectUnauthorized: false } })
  });

  await client.connect();
  const result = await client.query(query, parameters);
  await client.end();

  return result;
}

function getDayStart() {
  var dayStart = new Date();
  dayStart.setUTCHours(0,0,0,0);
  return dayStart;
}

async function setupDb() {
  await executeQuery(`CREATE TABLE IF NOT EXISTS park_statements (
    id SERIAL,
    date timestamp with time zone,
    user_id varchar(32) NULL,
    parking_slot smallint NOT NULL
  )`);

  await executeQuery(`CREATE TABLE IF NOT EXISTS park_blames (
    id SERIAL,
    date timestamp with time zone,
    car_plate varchar(32),
    parking_slot smallint,
    created_by varchar(32)
  )`);
}

async function addParkingStatement(userId, parkingSlot) {
  await executeQuery(`INSERT INTO park_statements (date, user_id, parking_slot) VALUES ($1, $2, $3)`, [
    new Date(),
    userId,
    parkingSlot
  ]);
}

async function removeParkingStatement(userId) {
  await executeQuery(`DELETE FROM park_statements WHERE user_id = $1 AND date > $2`, [
    userId,
    getDayStart()
  ]);
}

async function getIsSlotAlreadyBooked(parkingSlot, userId) {
  const result = await executeQuery(`SELECT user_id, parking_slot FROM park_statements WHERE (parking_slot = $1 OR user_id = $2) AND date > $3`, [
    parkingSlot,
    userId,
    getDayStart()
  ]);

  return result.rows.length ? {
    userId: result.rows[0]['user_id'],
    parkingSlot: result.rows[0]['parking_slot']
  } : null;
}

async function getAllParked() {
  const result = await executeQuery(`SELECT * FROM park_statements WHERE date > $1`, [
    getDayStart()
  ]);

  return result.rows.map(user => ({
    parkingSlot: user['parking_slot'],
    userId: user['user_id']
  }));
}

async function addBlameStatement(carPlate, parkingSlot, whoBlamed) {
  await executeQuery(`INSERT INTO park_blames (date, car_plate, parking_slot, created_by) VALUES ($1, $2, $3, $4)`, [
    new Date(),
    carPlate,
    parkingSlot,
    whoBlamed
  ]);
}

async function getAllBlames() {
  const result = await executeQuery(`SELECT car_plate, count(*) as count FROM park_blames GROUP BY car_plate`);

  return result.rows.map(user => ({
    carPlate: user['car_plate'],
    count: user['count']
  }));
}

module.exports = {
  setupDb,
  addParkingStatement,
  removeParkingStatement,
  getIsSlotAlreadyBooked,
  getAllParked,
  addBlameStatement,
  getAllBlames
}
