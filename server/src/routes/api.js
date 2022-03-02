const express = require("express")
const launchRouter = require("./launch/launch.router")
const planetRouter = require("./planet/planet.router")
const api = express.Router()

api.use('/planet',planetRouter)
api.use('/launch',launchRouter)

module.exports = api;