const express = require("express")
const router = new express.Router()
const errorController = require("../controllers/errorController")
const util = require("../utilities/")

router.get("/test", util.handleErrors(errorController.IntError))

module.exports = router