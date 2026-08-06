

//---- NO AI USED HERE ----//

// importing our database js file /config/db.js
const db=require('./config/db');

//import other core packages
const express=require('express');  // to setup our server 
const cors=require('cors');    //so out frontend and backend can connect easily

const app=express();

// Replace your old cors middleware with this dynamic block
app.use(cors({
  origin: function (origin, callback) {
    // This automatically approves whatever address the browser uses (localhost or 127.0.0.1)
    if (!origin) return callback(null, true);
    return callback(null, true);
  }
}));

app.use(express.json()); 

//GET request just for checking is json array is showing up 
app.get('/api/questions', (req,res)=>{

    const sql="SELECT id,question,option1,option2,option3,option4 FROM aptitude_questions LIMIT 10";

    db.all(sql,[],(err,rows)=>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        //send data arrays to browser connection
        res.json(rows);
    });
});


//POST request for answer check
app.post('/api/verify',(req,res)=>{

    //using the destructure
    const {id,selectedAnswer}=req.body;

    //fetching the correct answer
    const sql="SELECT correct_answers FROM aptitude_questions WHERE id= ?";

    db.get(sql,[id],(err,row)=>{
        if(err){
            return res.status(500).json({error: err.message});
        }

        //check if Q exists
        if(!row){
            return res.status(404).json({error: "Question not found"});
        }

        const isCorrect=row.correct_answers===selectedAnswer;

        res.json({correct: isCorrect});
    });
});


//POST request for leaderboard

app.post('/api/leaderboard',(req,res)=>{

    const {name, score, classification,time_taken}=req.body;

    const sql=`INSERT INTO leaderboard(name,score,classfication,time_taken) VALUES (?,?,?,?)`;

    db.run(sql,[name,score,classification,time_taken] , function(err) {
        if(err){
            return res.status(500).json({error:err.message});
        }

        res.json({
            succes:true,
            message:"scorecard saved successfully!!",
            id:this.lastID
        });
    });
});


//GET request for leaderboard

app.get('/api/leaderboard',(req,res)=>{

    const sql="SELECT * FROM leaderboard ORDER BY score DESC, time_taken ASC";

    db.all(sql,[],(err,rows)=>{
        if(err){
            return res.status(500).json({error: err.message});
        }

        res.json(rows);
    });
});

//fetched random puzzles excluding answers
app.get('/api/crypto/questions',(req,res)=>{
    const sql="SELECT id,encrypted_message,hint FROM encrypted_messages ORDER BY RANDOM() LIMIT 3";
    db.all(sql,[],(err,rows)=>{
        if( err ) return res.status(500).json({error:err.message});
        res.json(rows);
    });
});


//validates answer
app.post('/api/crypto/verify',(req,res)=>{
    const {id,decodeSubmission} =req.body;
    const sql = " SELECT  correct_decoded FROM encrypted_messages WHERE id=?";


    db.get(sql,[id],(errr,row)=>{
        if (err) return res.status(500).json({error: err.message});
        if (!row) return res.status(404).json({error:"Puzzle not found"});

        //case insensitive match
        const isCorrect = row.correct_decoded.trim().toLowerCase() === decodeSubmission.trim().toLowerCase();
        res.json({correct:isCorrect});
    });
});



const PORT = 5000;

//using port 5000 for runnig our backend server
app.listen(PORT,()=> {
    console.log(`Backend server successfully running on http://localhost:${PORT}`);
});