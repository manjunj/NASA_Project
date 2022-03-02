const API_URI = "v1"

// Load planets and return as JSON.
async function httpGetPlanets() {
  const response = await fetch(`${API_URI}/planet`)
  return response.json()
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
  const response = await fetch(`${API_URI}/launch`)
  const fetchedLaunches = await response.json();
  return fetchedLaunches.sort((a, b) => {
    return a.flightNumber - b.flightNumber;
  });
  // return response.json().sort((a,b)=>a.flightNumber-b.flightNumber)
}

// Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
  try{
    return await fetch(`${API_URI}/launch`,{
    method:"post",
    headers: {
        "Content-Type": "application/json",
      },
    body:JSON.stringify(launch)
    })
  } catch(err){
    return {
      ok:false
    }
  }
}

// Delete launch with given ID.
async function httpAbortLaunch(id) {
  try{
    return fetch(`${API_URI}/launch/${id}`,{
      method:"delete"
    })
  }catch(err){
    return {
      ok:false
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};