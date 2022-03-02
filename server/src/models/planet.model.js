const {parse} = require('csv-parse');
const fs = require('fs');
const path = require("path");
const planets = require("./planet.mongo")

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

function loadPlanetData(){
    return new Promise ((resolve,reject)=>{
        fs.createReadStream(path.join(__dirname,"..","data",'kepler_data.csv'))
        .pipe(parse({
            comment: '#',
            columns: true,
        }))
        .on('data', async(data) => {
            if (isHabitablePlanet(data)) {
                await savePlanets(data)
            }
        })
        .on('error', (err) => {
            reject(err)
        })
        .on('end', async () => {
            const countPlanet = (await getAllPlanets()).length
            console.log(`${countPlanet} habitable planets found!`);
            resolve()
        });
    });
}

async function getAllPlanets(){
    return await planets.find({},{'_id':0, '__v':0})
}

async function savePlanets(data){
    try{
        await planets.updateOne({
            keplerName: data.kepler_name
        },{
            keplerName: data.kepler_name
        },{
            upsert:true
        });
    } catch(err){
        console.error(`Could not save planet ${err}`)
    }
}

module.exports = {getAllPlanets, loadPlanetData}