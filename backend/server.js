

//---- NO AI USED HERE ----//

// importing our database js file /config/db.js
const db=require('./config/db');

//import other core packages
const express=require('express');
const cors=require('cors');

const app=express();

app.use(cors()); //allows the frontend on port 3000 to fetch data 
app.use(express.json()); 






const PORT = 5000;
app.listen(PORT,()=> {
    console.log(`Backend server successfully running on http://localhost:${PORT}`);
});