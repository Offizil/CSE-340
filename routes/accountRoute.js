// Needed resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const acctController = require("../controllers/accountController")



// deliver login view
// Add a "GET" route for the path that will be sent when the "My Account" link is clicked
router.get("/login", utilities.handleErrors(acctController.buildLogin))

//add a route to the registration view
router.get("/registration", utilities.handleErrors(acctController.buildRegister))


// add a route for path to registration view
router.post("/registration", utilities.handleErrors(acctController.registerAccount))

module.exports = router
