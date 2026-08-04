
                  //NO AI SLOP BTW"

const sqlite3= require('sqlite3');
const path = require("path");

//point to the database directory
const dbpath=path.join(__dirname,'..' , 'database.sqlite');  
//_dirname=this files directory '..'=go back one level to backend dir and make database.sqlite file


//connect to the database
const db=new sqlite3.Database(dbpath,(err) =>{

    if(err){
        console.error("Database connection error:", err.message);}
    else {
        console.log("connected to Database.");}
});


//create the tables 

db.serialize(()=>{

    //1. creating the aptitue QuestionS 

    db.run(`CREATE TABLE IF NOT EXISTS aptitude_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        option1 TEXT NOT NULL, 
        option2 TEXT NOT NULL,
        option3 TEXT NOT NULL,
        option4 TEXT NOT NULL,
        correct_answers TEXT NOT NULL
        )
        `);

    //2. create leaderboard outline

    db.run(`CREATE TABLE IF NOT EXISTS leaderboard(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        classification TEXT NOT NULL,
        time_taken INTEGER NOT NULL)
        `);
});

//Testing the data base table 
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err,rows)=>{
    if (err){
        console.error("Verification query failed:",err.message);
        return;
    }
    else{
        console.log("database verified! Existing tables:",rows);
    }
});


//export this file for server.js
module.exports=db;

