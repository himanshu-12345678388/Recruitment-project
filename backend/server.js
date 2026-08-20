

//---- NO AI USED HERE ----//

require('dotenv').config();

// importing our database js file /config/db.js
const { pool , initDb } = require('./config/db');





//import other core packages
const express=require('express');  // to setup our server 
const cors=require('cors');    //so out frontend and backend can connect easily

const app=express();


app.use(cors({
  origin: function (origin, callback) {
    // This automatically approves whatever address the browser uses (localhost or 127.0.0.1)
    if (!origin) return callback(null, true);
    return callback(null, true);
  }
}));

app.use(express.json()); 

//GET request just for checking is json array is showing up 
app.get('/api/questions',async  (req,res)=>{

    try{
        const { rows } = await pool.query( 'SELECT id,question,option1,option2,option3,option4 FROM aptitude_questions' );

        res.json(rows);
    }
    catch (err){
        res.status(500).json({error: err.message});
    }
});

//POST request for answer check
app.post('/api/verify', async (req, res) => {
  const { id, selectedAnswer } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT correct_answers FROM aptitude_questions WHERE id = $1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Question not found" });
    const isCorrect = rows[0].correct_answers === selectedAnswer;
    res.json({ correct: isCorrect });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//POST request for leaderboard
app.post('/api/leaderboard', async (req, res) => {
  const { name, score, classification, time_taken } = req.body;
  try {
    await pool.query(
      'INSERT INTO leaderboard(name,score,classification,time_taken) VALUES ($1,$2,$3,$4)',
      [name, score, classification, time_taken]
    );
    res.json({ succes: true, message: "scorecard saved successfully!!" });
  } catch (err) {
    console.log("Postgres insert crash cause:", err.message);
    res.status(500).json({ error: err.message });
  }
});


//GET request for leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM leaderboard ORDER BY score DESC, time_taken ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



//fetched random puzzles excluding answers
app.get('/api/crypto/questions', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id,encrypted_message,hint FROM encrypted_messages ORDER BY RANDOM() LIMIT 3'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//validates answer
app.post('/api/crypto/verify', async (req, res) => {
  const { id, decodedSubmission } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT correct_decoded FROM encrypted_messages WHERE id = $1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Puzzle not found" });

    const dbAnswer = (rows[0].correct_decoded || "").toString().trim().toLowerCase();
    const clientAnswer = (decodedSubmission || "").toString().trim().toLowerCase();
    console.log(`[Crypto Verify] Comparing DB: "${dbAnswer}" vs Client: "${clientAnswer}"`);

    res.json({ correct: dbAnswer === clientAnswer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5000;

//using port 5000 for runnig our backend server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server successfully running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });