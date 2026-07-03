const mongoose = require("mongoose")
const connectionString =process.env.DBCONNECTIONSTRING

mongoose.connect(connectionString).then(res=>{
    console.log("Database connection Successful!!");
    
}).catch(err=>{
    console.log("DB connection Failed");
    console.log(err);
})
