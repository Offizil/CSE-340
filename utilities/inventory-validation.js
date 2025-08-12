const utilities = require(".")
const {body, validationResult} = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}



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





// validate modify inventory
validate.newInventoryRules = () => {
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

// check the updated inventory data
validate.checkUpdateData = async (req, res, next) => {
    
    let errors = []
    errors = validationResult(req)

    console.log(">>> updatedInventory running - req.body:", req.body)
    console.log(">>> validationResult: ", errors)


    const { inv_make, 
        inv_id, 
        inv_model, 
        inv_year, 
        inv_description, 
        inv_image,
        inv_miles, 
        inv_thumbnail,
        inv_price, 
        inv_color,
        classification_id }  = req.body
        
        const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
        //extract filenames from req.files
        const files = req.files
        const inv_img = files?.inv_image?.[0]?.filename || req.body.inv_image
        const inv_thumb = files?.inv_thumbnail?.[0]?.filename || req.body.inv_thumbnail



    if(!errors.isEmpty()) {
        let nav = await utilities.getNav()
         console.log(">>> checkupdatedInventory: rendering form with validation errors") // here we go
   
        return res.render("inventory/editInventoryView", {
            errors: errors.array(),
            nav,
            title: `Edit ${inv_make} ${inv_model}`,
            classificationSelect,
            inv_make,
            inv_model,
            inv_miles,
            inv_year,
            inv_description,
            inv_color,
            inv_price,
            classification_id,
            inv_img,         // No file uploaded yet
            inv_thumb,
            inv_id, // also returnedn

        })
        return  
    } 
     console.log(">>> updatedInventory:no validation errors, calling next()")
   
    
    next()
    
}



module.exports  = validate