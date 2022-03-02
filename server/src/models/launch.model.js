const axios = require("axios")
const launchesData = require("./launch.mongo");
const planets = require("./planet.mongo")
const DEFAULT_FLIGHT_NUMBER = 100;

async function existsLaunchWithId(launchId){
    return await findLaunch({flightNumber:launchId})
}

async function findLaunch(filter){
    return await launchesData.findOne(filter)
}

const SPACEX_API_URL="https://api.spacexdata.com/v4/launches/query"

async function populateLaunch(){
     const response = await axios.post(SPACEX_API_URL,
        {
        query:{},
        options:{
            pagination:false,
            populate:[
            {    
                path:"rocket",
                select:{
                    name:1
                }
            },
            {
                path:"payloads",
                select:{
                    customers:1
                }
            }
            ]
        }
    })
    if (response.status!=200){
        console.log("Problem downloading launch data")
        throw new Error("Launch data downloaded failed")
    }
    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs){
        const payloads = launchDoc['payloads']
        const customers = payloads.flatMap((payload)=>{
            return payload['customers']
        })
        const launch = {
            flightNumber:launchDoc['flight_number'],
            mission:launchDoc['name'],
            rocket:launchDoc['rocket']['name'],
            launchDate:launchDoc['date_local'],
            upcoming:launchDoc['upcoming'],
            success:launchDoc['success'],
            customers,
        }
        console.log(launch.flightNumber)
        await saveLaunch(launch)
    }
}
async function loadLaunchdata(){
    const firstLaunch = await findLaunch({
        flightNumber:1,
        rocket:"Falcon 1",
        mission:"FalconSat"
    })
    if(firstLaunch){
        console.log("Launch data already loaded")
    } else {
        populateLaunch()
    }
}

async function getLatestFlightNumber(){
    const latestLaunch = await launchesData
    .findOne({})
    .sort('-flightNumber')

    if (!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER
    }
    return latestLaunch.flightNumber
}

async function getAllLaunches(skip,limit){
    return await launchesData
    .find({},{'_id':0, '__v':0})
    .sort({flightNumber:1})
    // .skip(skip)
    // .limit(limit)
}

async function saveLaunch(data){
    try{
        await launchesData.findOneAndUpdate({flightNumber:data.flightNumber},
            data,{upsert:true})
    }catch(err){
        console.error(`Save launch ${data} failed`)
    }
}

async function scheduleNewLaunch(launch){
     const planet = await planets.findOne({
        keplerName: launch.destination
    })
    if (!planet){
        throw new Error('No matching planet found')
    }
    const newFlightNumber = await getLatestFlightNumber() +1
    const newLaunch = Object.assign(launch,{
        success:true,
        upcoming:true,
        customers:['Clara'],
        flightNumber:newFlightNumber
    })
    await saveLaunch(newLaunch)
}

async function abortLaunchbyId(launchId){
    const aborted =  await launchesData.updateOne({
        flightNumber:launchId
    },{
        upcoming:false,
        success:false
    })
    return aborted.modifiedCount === 1;
}

module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchbyId,
    loadLaunchdata
}