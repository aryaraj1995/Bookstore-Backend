//1.import all packages
  //local .env file contents to process.env by default.
  require("dotenv").config()
  const express =require("express")
  const cors =require("cors")
  const routes =require("./routes/allRoutes")
  require("./config/db")

// 2. create server using express package
const server = express()
// 3. enable cors
server.use(cors())
// parse json in sercer
server.use(express.json())
// use routes
server.use(routes)
// /handling static file/folder
server.use("/uploads",express.static("./uploads"))
// 4. setup a port number to run server in internet
const PORT =process.env.PORT 
// 5. Start server
server.listen(PORT,()=>{
    console.log("server starter... ");  
})
// handling global errors in server using application specific middleware
server.use((err,req,res,next)=>{
    res.status(500).json(err.message)
})
// /resolve in browser : http://localhost:3000/
server.get('/',(req,res)=>{
    res.status(200).send(`<h1>Server Started!!!!</h1>`)
})

