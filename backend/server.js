

//---- NO AI USED HERE ----//

// importing our database js file /config/db.js
const db=require('./config/db');

//import other core packages
const express=require('express');  // to setup our server 
const cors=require('cors');    //so out frontend and backend can connect easily

const app=express();

app.use(cors()); //allows the frontend on port 3000 to fetch data 
app.use(express.json()); 

//GET request just for checking is json array is showing up 
app.get('/api/questions', (req,res)=>{

    const sql="SELECT id,question,option1,option2,option3,option4 FROM aptitude_questions";

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
    const {id,selctedanswer}=req.body;

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



const PORT = 5000;

//using port 5000 for runnig our backend server
app.listen(PORT,()=> {
    console.log(`Backend server successfully running on http://localhost:${PORT}`);
});