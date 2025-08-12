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






router.post (
    "/login", 
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin))


    
// default route for accounts management view
router.get (
    "/",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccountManagement)
)



// // Get accout update form
// router.get(
//     "update/:account_id",
//     utilities.checkLogin,
//     accountController.buildAccountUpdateForm
// )


// account update routes. get Form, post password and details
router.get("/update-account/:account_id", 
    utilities.checkLogin, 
    accountController.buildAccountUpdate,
    // accountController.buildUpdateAccountForm
     )

    router.post("/update-info", 
    utilities.checkLogin, 
    accountController.updateAccountInfo)

    router.post("/update-password", 
    utilities.checkLogin, 
    accountController.updatePassword)

// logout route 
router.get("/logout", 
    utilities.checkLogin, 
    accountController.logoutAccount);


module.exports = router
