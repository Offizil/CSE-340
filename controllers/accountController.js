// Required 
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
// require jasonwebtoken and dotenv packages
const jwt = require("jsonwebtoken")
require("dotenv").config()


const accountController = {}

/* ****************************************
*  Deliver login view
* *************************************** */
accountController.buildLogin =  async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "login",
        message: req.flash("notice"),
        nav,
        errors: null,
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
    // here we go
    account_firstname: "",
    account_lastname: "",
    account_email: ""
      
  })  
}


/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount =  async function(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password} = req.body
  
  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password,10)
  }  catch (error) {
    req.flash("notice", 'sorry, there an error processing the registration.')
    req.status(500).render("account/registration", {
      title: "Registration",
      nav,
      errors: null,
    })
  }


  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword,
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registerd ${account_firstname}. Please Log in.`
    )

    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
   } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/registration", {
      title: "Register",
      nav,
      errors: null
    })
   }

}



/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async function(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      message: null
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

// create the accout management page
accountController.buildAccountManagement = async function(req, res, next) {
const accountData = res.locals.accountData 
  
  try{
    const nav = await utilities.getNav()

    res.render('account/account-management', {
      title: 'Account Management',
      nav,
      // message: req.flash("notice"),
      errors: null,

      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_type: accountData.account_type,
      account_id: accountData.account_id,
    });
  } catch (error) {
    next(error)
  }
};
 

// create the account update form page
// accountController.buildUpdateAccountForm = async function (req, res, next) {
//   try {
//   let nav = await utilities.getNav()

//     const account_id = req.params.account_id
//     const accountData = await accountModel.getAccountById(account_id)
//     res.render("account/update-account", {
//       nav,
//       title: "Update Account",
//       account: accountData,
//       errors: null,
//     })
//   } catch (err) {
//     next(err)
//   }
// }

/* ************
* build forms for account update form, 
password and account details update
* *************/
// Render the account update view
accountController.buildAccountUpdate = async function (req, res, next) {
  let nav = await utilities.getNav()
  try {
  const account_id = req.params.account_id
  const accountData = await accountModel.getAccountById(account_id)
  console.log(">>>>account data fetchec:", {accountData})
  res.render("account/update-account", {
    nav,
    title: "Update Account",
    account: accountData,
    errors: null, 
    message: req.flash("notice"),

    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email
  })
} catch (error) {
  next(error)
}
}

/* Update account info */
accountController.updateAccountInfo = async function (req, res, next) {
  
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const updateResult = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email)
  
  if (updateResult) {
    req.flash("notice", "Account information updated successfully.")
    res.redirect("/account/")

 
}else {
    req.flash("notice", "Update failed. Please try again.")
    res.redirect(`/account/update-account/${account_id}`)
  }

}

/* Update password */
accountController.updatePassword = async function (req, res, next) {
  const { account_id, account_password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)
    
    if (updateResult) {
      req.flash("notice", "Password updated successfully.")
      res.redirect(`/account/`)
    } else {
      req.flash("notice", "Password update failed. Please try again.")
      res.redirect(`/account/update-account/${account_id}`)
  }
    // let nav = await utilities.getNav()
    // const updatedAccountData = await accountModel.getAccountById(account_id)
    // res.render("account/account-management",  {
    //   title: "Account management",
    //   accountData: updatedAccountData,
    //   nav,
    // }) 
  } catch (error) {
    req.flash("notice", "An error occured while updating the password.")
    res.redirect("/account/update-account")
  }
}


// logout process. 
accountController.logoutAccount = async function(req, res) {
  console.log(">>>>>Logout route hit")
  res.clearCookie("jwt") // this line deletes the token cookie
  req.flash("notice", `You've been logged out.`)
  return res.redirect("/")

}



module.exports = accountController