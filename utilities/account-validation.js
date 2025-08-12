const utilities = require(".")
const {body, validationResult} = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}



/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
 validate.registrationRules = () => {
    return [
        //firstname is required and must be a string
        body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min:1})
        .withMessage("Please provide a first a first name."),

        //lastname is required
        body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min:2})
        .withMessage("Please provide a last name."),

        //valid email address is required
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists) {
                throw new Error ( "Email exists. please log in or use different email.")
            }
        }),

        //password is required and must be a strong password
        body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password does not meet requirements.")
    ]
 }


 /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */

validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email} = req.body
    let errors = []
    errors = validationResult(req)
    if(!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/registration", {
            errors,
            title: "Registration",
            nav, 
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    } 
    next()
}


// -------------log in form --------------------


/*  **********************************
  *  Login Data Validation Rules
  * ********************************* */
 validate.loginRules = () => {
    return [
        // email required and must be valid yo!
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()
        .withMessage("Please enter a valid email address"),
        

        body("account_password")
        .trim()
        .notEmpty()
        .withMessage("The provided password does not meet requirements.")
    ]
 }


validate.checkLoginData = async (req, res, next) => {
    const { account_email} = req.body
    let errors = []
    errors = validationResult(req)
    if(!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            title: "Login",
            nav, 
            account_email,
        })
        return
    } 
    next()
}


validate.checkNewclassificationRules = () => {
      return [
        // email required and must be valid yo!
        body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("classification name cannot be empty")
        .isLength({min:1})
        .withMessage("Please provide a first a first name."),

    ]
}


validate.checkNewClassification = async (req, res, next) => {
    const {classification_name} = req.body
    let errors = []
    errors = validationResult(req)
    if(!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/management", {
            errors,
            nav,
            title: "Management",
            classification_name,
            messages: "Failed to add. Try again!"

        })
        return  
    }
    next()

}

// validate add inventory
validate.addInventory = () => {
    return [
       
        body("inv_make")
            .trim()
            .notEmpty()
            .withMessage("Make is required."),

        body("inv_model")
            .trim()
            .notEmpty()
            .withMessage("Model is required."),

        body("inv_year")
            .notEmpty()
            .isInt({ min: 1900, max: 2099 })
            .withMessage("Enter a valid year."),

        body("inv_price")
            .isFloat({ min: 1 })
            .withMessage("Price must be a positive number."),
        
        body("inv_description")
            .trim()
            .notEmpty()
            .withMessage("Description is required."),

        body("inv_miles")
            .notEmpty()
            .trim()
            .withMessage("Mileage is required"),

        body("inv_color")
            .trim()
            .notEmpty()
            .withMessage("Color is required."),

        body("classification_id")
            .notEmpty()
            .withMessage("Classification is required.")
  
    ]
}

validate.checkAddedInventory = async (req, res, next) => {
    
    let errors = []
    errors = validationResult(req)

    console.log(">>> checkAddedInventory running - req.body:", req.body)
    console.log(">>> validationResult: ", errors)


    const { inv_make, 
  inv_model, 
  inv_year, 
  inv_description, 
  inv_image,
  inv_miles, 
  inv_thumbnail,
  inv_price, 
  inv_color,
  classification_id }  = req.body
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)

    if(!errors.isEmpty()) {
        let nav = await utilities.getNav()
         console.log(">>> checkAddedInventory: rendering form with errors") // here we go
   
        res.render("inventory/add-inventory", {
            errors,
            nav,
            title: "Add New Inventory",
            classificationList,
            inv_make,
            inv_model,
            inv_miles,
            inv_year,
            inv_description,
            inv_color,
            inv_price,
            classification_id,
            inv_image,         // No file uploaded yet
            inv_thumbnail,

        })
        return  
    } 
     console.log(">>> checkAddedInventory:no validation errors, calling next()")
   
    
    next()
    
}

validate.updateRules = () => {
    
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    
      body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a last name."),
    
      body("account_email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email.")
      .custom(async (account_email, { req }) => {
        const account = await accountModel.getAccountById(req.body.account_id)
        if (account.account_email !== account_email) {
          // Email changed → check if new email exists
          const existing = await accountModel.getAccountByEmail(account_email)
          if (existing) {
            throw new Error("Email already in use. Choose another.")
          }
        }
      }),
  ]
}

validate.passwordRules = () => {
    return [
    body("account_password")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      })
      .withMessage("Password must be at least 12 characters and include uppercase, lowercase, number, and special character.")
  ]
}

validate.checkUpdateData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render("account/update", {
        title: "Update Account",
        errors: errors.array(),
        account_firstname: req.body.account_firstname,
        account_lastname: req.body.account_lastname,
        account_email: req.body.account_email
        })
  }
  next()

}

module.exports  = validate