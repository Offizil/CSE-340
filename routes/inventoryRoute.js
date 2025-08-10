// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");
const { addInventory, checkAddedInventory } = require("../utilities/account-validation");



// multer setuppp, lets go
const multer = require("multer")
const path = require("path")
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
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));


//Route to build and deliver a specific inventory item detail view.
router.get("/detail/:inv_id", 
  utilities.handleErrors(invController.buildDetailView));

//Route to build an deliver an add-classification view
router.post("/add-classification", 
  utilities.handleErrors(invController.addClassification))

// get add inventory
router.get("/add-inventory", utilities.handleErrors(async (req, res) => {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList
    
  })
}))

// get the add classfication
router.get("/add-classification", utilities.handleErrors(async (req, res) => {
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

  addInventory(),                            // validation rules
  checkAddedInventory,                       // validate the result
  utilities.handleErrors(invController.addInventory) // run controller only if valid
)

// build acct management page
router.get("/", utilities.handleErrors(invController.buildManagement))


// route for 
router.get("/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

// route to get to modify inventory items
// router.get("/edit/",
//   utilities.handleErrors(invController.xxxxxxxxxxx)
// )

module.exports = router;