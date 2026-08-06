
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


    //force drop any old table
    db.run(`DROP TABLE IF EXISTS aptitude_questions`);
    db.run(`DROP TABLE IF EXISTS leaderboard`);

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


    db.run(`DROP TABLE IF EXISTS encrypted_messages`);

        //create encrypted messages table 
    db.run(`CREATE TABLE IF NOT EXISTS encrypted_messages (id INTEGER PRIMARY KEY AUTOINCREMENT,
      encrypted_message TEXT NOT NULL,
      correct_decoded TEXT NOT NULL,
      hint TEXT NOT NULL)
      `);


      //clear encrypted_message table
      db.run(`DELETE FROM encrypted_messages`,[],()=>{
        console.log('seeding encrypted messages...');
        const sql = `INSERT INTO encrypted_messages (encrypted_message,correct_decoded,hint) VALUES (?,?,?)`;


        //decoding pairs
        db.run(sql,["IFMMP","HELLO","Caesar cipher shifted by +1 point"]);
        db.run(sql,["YWNjZXNz","access","Based encoded string format"]);
        db.run(sql,["M0FJUg==","3AIR","Base64 encoded string format"]);
        db.run(sql,["I0NPREU=","#CORE","Based encoded string format"]);
      });



        //clear data 
        db.run(`DELETE FROM aptitude_questions`, [], () => {
    console.log("Seeding fresh questions cleanly...");
        

        const stmt=db.prepare(`INSERT INTO aptitude_questions (question,option1,option2,option3,option4,correct_answers) VALUES (?,?,?,?,?,?)`);

        //array of 10 Q's
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
      ["What is the primary port for a standard HTTP connection?", "80", "443", "3000", "8080", "80"]
    ];

    
// loop to execute statements for each item
testQuestions.forEach((q) => {
  stmt.run(q);
});

// closes the statement stream safely
stmt.finalize(() => {
  console.log("Database tables seeded successfully with 10 questions!");
});

// This closes the db.run('DELETE FROM...') callback AND the db.serialize block cleanly
  });
});

// Testing the database table structure
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
  if (err) {
    console.error("Verification query failed:", err.message);
    return;
  }
  console.log("Database verified! Existing tables:", rows);
});

// Export this file for server.js
module.exports = db;
