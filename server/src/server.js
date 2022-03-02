const PORT = process.env.PORT || 8000
const app = require("./app")
const {loadPlanetData} = require("./models/planet.model")
const {loadLaunchdata} = require("./models/launch.model")
const {mongoConnect} = require("./services/mongo")
const http = require('http')
const mongoose = require("mongoose")
const server = http.createServer(app)

async function startServer(){
    await mongoConnect();
    await loadPlanetData();
    await loadLaunchdata();
    server.listen(PORT,()=>{
    console.log(`listening on ${PORT}`)
    })
}
startServer();