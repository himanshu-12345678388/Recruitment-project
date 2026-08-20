const { Pool } = require('pg');
require('dotenv').config();

// Render gives you this automatically when you link a Postgres DB to your web service
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required for Render Postgres
});

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS aptitude_questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        option1 TEXT NOT NULL,
        option2 TEXT NOT NULL,
        option3 TEXT NOT NULL,
        option4 TEXT NOT NULL,
        correct_answers TEXT NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        classification TEXT NOT NULL,
        time_taken INTEGER NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS encrypted_messages (
        id SERIAL PRIMARY KEY,
        encrypted_message TEXT NOT NULL,
        correct_decoded TEXT NOT NULL,
        hint TEXT NOT NULL
      )
    `);

    // seed encrypted_messages only if empty
    const { rows: msgCount } = await client.query('SELECT COUNT(*) FROM encrypted_messages');
    if (parseInt(msgCount[0].count, 10) === 0) {
      console.log('seeding encrypted messages...');
      const pairs = [
        ["IFMMP", "HELLO", "Caesar cipher shifted by +1 point"],
        ["YWNjZXNz", "access", "Based encoded string format"],
        ["M0FJUg==", "3AIR", "Base64 encoded string format"],
        ["I0NPREU=", "#CORE", "Based encoded string format"],
      ];
      for (const [msg, decoded, hint] of pairs) {
        await client.query(
          'INSERT INTO encrypted_messages (encrypted_message, correct_decoded, hint) VALUES ($1,$2,$3)',
          [msg, decoded, hint]
        );
      }
    }

    // seed aptitude_questions only if empty
    const { rows: qCount } = await client.query('SELECT COUNT(*) FROM aptitude_questions');
    if (parseInt(qCount[0].count, 10) === 0) {
      console.log('Seeding aptitude questions for the first time...');
      const testQuestions = [
        ["What is 15% of 200?", "35", "20", "30", "15", "30"],
        ["If a code uses CAT to mean DBW, what does DOG mean?", "EPH", "FPI", "CPV", "FQH", "EPH"],
        ["Find the next number in the pattern: 2, 4, 8, 16, ...", "20", "32", "40", "18", "32"],
        ["Which HTML5 element is used to display video files?", "<media>", "<video>", "<movie>", "<embed>", "<video>"],
        ["What is the correct syntax for a CSS ID selector?", ".header", "#header", "header", "*header", "#header"],
        ["Which JavaScript array method removes the last element?", "pop()", "push()", "shift()", "unshift()", "pop()"],
        ["What is the output of 2 + '2' in JavaScript?", "4", "22", "NaN", "Error", "22"],
        ["Which HTTP method is used to update existing data?", "GET", "POST", "PUT", "DELETE", "PUT"],
        ["What does JSON stand for?", "Java Object Notation", "JavaScript Object Notation", "JavaScript Output Name", "Just Structure Objects", "JavaScript Object Notation"],
        ["What is the primary port for a standard HTTP connection?", "80", "443", "3000", "8080", "80"],
      ];
      for (const q of testQuestions) {
        await client.query(
          `INSERT INTO aptitude_questions (question,option1,option2,option3,option4,correct_answers)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          q
        );
      }
      console.log('Database tables seeded successfully with 10 questions!');
    }

    console.log('Database verified and ready.');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDb };