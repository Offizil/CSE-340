// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");
const { addInventory, checkAddedInventory } = require("../utilities/account-validation")
const {newInventoryRules, checkUpdateData} = require("../utilities/inventory-validation")
const checkAccountType = require("../utilities/checkAccountType")
const acctValidate = require("../utilities/account-validation")
const in_validate = require("../utilities/inventory-validation")
// multer setuppp, lets go
const multer = require("multer")
const path = require("path");
// const { checkUpdateData } = require("../utilities/inventory-validation");
// Define where to store images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/vehicles")
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

// ---------------------


// Route to build inventory by classification view
router.get("/type/:classificationId", 
  utilities.handleErrors(invController.buildByClassificationId));


//Route to build and deliver a specific inventory item detail view.
router.get("/detail/:inv_id", 
  utilities.handleErrors(invController.buildDetailView))

//Post route to add new classifciation process
router.post("/add-classification", 
  checkAccountType,
  acctValidate.checkNewclassificationRules(),
  acctValidate.checkNewClassification,
  utilities.handleErrors(invController.addClassification))

// get add inventory
router.get("/add-inventory", 
  checkAccountType,
  utilities.handleErrors(async (req, res) => {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList
    
  })
}))

// get the add-classfication
router.get("/add-classification", 
  checkAccountType,

  // checkNewClassification,
  // checkNewclassificationRules(),

  utilities.handleErrors(async (req, res) => {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    classification_name: ""
  })
}))

// Route to build new iventory
router.post(
  "/add-inventory",
  upload.fields([
    { name: "inv_image", maxCount: 1 },
    { name: "inv_thumbnail", maxCount: 1 }
  ]),
  checkAccountType,
  addInventory(),                            // validation rules
  checkAddedInventory,                       // validate the result
  utilities.handleErrors(invController.addInventory) // run controller only if valid
)

// build inventory management page
router.get("/", 
  checkAccountType,
  utilities.handleErrors(invController.buildManagement))


// route for  --- Inventory by the Classification As JSON
router.get("/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

// route to get to modify inventory items page
router.get("/edit/:inv_id",
  checkAccountType,
  utilities.handleErrors(invController.editInventoryView)
)


// route to  handle the outgoing request  to modify inventory items
router.post("/editInventoryView", 
  checkAccountType,

   upload.fields([
    { name: "inv_image", maxCount: 1 },
    { name: "inv_thumbnail", maxCount: 1 }
  ]),

  in_validate.newInventoryRules(),
  in_validate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// route to get delete inv items
router.get("/delete/:inv_id",
  checkAccountType,
  utilities.handleErrors(invController.deleteInventoryItemView)
)

// route to handle dele einv items post request
router.post("/delete-confirm", 
  checkAccountType,

  // newInventoryRules(),
  // checkUpdateData,
  utilities.handleErrors(invController.deleteInventory)
)

module.exports = router;