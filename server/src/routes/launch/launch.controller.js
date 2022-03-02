const {getAllLaunches, 
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchbyId
    } = require("../../models/launch.model")

const {
    getPagination
} = require("../../services/query")

async function httpGetAllLaunches(req,res){
    const {skip,limit} = getPagination(req.query);
    return res.status(200).json(await getAllLaunches(skip,limit))
}

async function httpAddNewLaunch(req,res){
    const launch = req.body;
    if (!launch.mission||!launch.rocket||!launch.launchDate||!launch.destination){
        return res.status(400).json({error:"Missing required launch property"})
    }
    launch.launchDate = new Date(launch.launchDate)
    if (isNaN(launch.launchDate)){
        return res.status(400).json({error:"Invalid date"})
    }
    await scheduleNewLaunch(launch)
    return res.status(201).json(launch)
}

async function httpAbortLaunch(req,res){
    const launchId = +req.params.id;
    const existLaunch = await existsLaunchWithId(launchId);
    if (!existLaunch){
        return res.status(404).json({
            error:'Launch not found'
        })
    } else {
        const aborted = await abortLaunchbyId(launchId)
        if (!aborted){
            return res.status(400).json({
                error:"Launch not aborted"
            })
        }
        return res.status(200).json({
            okay:true
        })
    }

}

module.exports={httpGetAllLaunches,httpAddNewLaunch, httpAbortLaunch}