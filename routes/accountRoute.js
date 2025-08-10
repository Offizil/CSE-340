// Needed resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')



// deliver login view
// Add a "GET" route for the path that will be sent when the "My Account" link is clicked
router.get("/login", utilities.handleErrors(accountController.buildLogin))

//add a route to the registration view
router.get("/registration", 

    utilities.handleErrors(accountController.buildRegister))


// add a route for path to registration view
router.post("/registration", 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))




//Process the login attempt
// router.post (
//     "/login", 
//     (req, res) => {
//         res.status(200).send('Login process')
//     }
// )


router.post (
    "/login", 
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin))


    
// default route for accounts management view
router.get (
    "/",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccount)
)


module.exports = router
