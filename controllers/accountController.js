// Required 
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")


const accountController = {}

/* ****************************************
*  Deliver login view
* *************************************** */
accountController.buildLogin =  async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "login",
        message: "",
        nav,
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegister = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/registration", {
    title: "Register",
    nav,
    errors: null,
      
  })  
}

/* ****************************************
*  Process Registration
* *************************************** *//* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount =  async function(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password} = req.body
  
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registerd ${account_firstname}. Please Log in.`
    )

    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
   } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/registration", {
      title: "Register",
      nav,
    })
   }

}
module.exports = accountController