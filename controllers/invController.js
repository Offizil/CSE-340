const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult} = require("express-validator")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors:null,
  })
}


/* Build detail  view */
invCont.buildDetailView =  async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  try {
    const vehicle = await invModel.getVehicleById(inv_id)
    
    if (!vehicle || vehicle.length === 0) {
      return res.status(404).render("errors/error", {
      title: "Vehicle not Found",
      message: "Sorry, that vehicle could not be found.",
      nav: await utilities.getNav()
    })
  }

    const vehicleDetailHTML = await utilities.buildVehicleDetail(vehicle[0])

    res.render("./inventory/detail", {
      title: `${vehicle[0].inv_make} ${vehicle[0].inv_model}`,
      nav: await utilities.getNav(),
      vehicleDetail: vehicleDetailHTML,
      errors:null,
      message: null,
    })
  } catch (error) {
    console.error("Error loading vehicle detail:", error)
    next(error)
  }
}

// add new classification
invCont.addClassification = async (req, res, next) => {
  const {classification_name} = req.body;
  const nav = await utilities.getNav()
  
  try{
  const result = await invModel.addClassification(classification_name)

  // res.render("inventory/management", {
  //   title: "Management",
  //   nav,
  //   message: `Successfully added new classification: ${result.classification_name}`,
  //   errors: null,

    req.flash("success", `Successfully added new classification: ${classification_name}`)
    res.redirect("/inv")

 

  } catch (error) {
    console.error("Controller error", error)
    res.render("/add-classification", {
      title: "Add Classification",
      nav,
      message: "failed to add a new classification",
      errors:null,
    })
  }
}




// function to add new inventory
invCont.addInventory = async function (req, res, next) {
  console.log("Request body:", req.body)
  console.log("Request files:", req.files)
  console.log("📥 Received POST for add inventory")

  const {
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    inv_description,
    inv_miles,
    inv_color,
    classification_id
  } = req.body

  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)

  // Normalize file paths and remove "public" so they are browser-safe URLs
  const rawImagePath = req.files?.inv_image?.[0]?.path || null
  const rawThumbPath = req.files?.inv_thumbnail?.[0]?.path || null

  const imagePath = rawImagePath
    ? rawImagePath.replace(/\\/g, "/").replace("public", "")
    : "/images/vehicles/no-image.png"

  const thumbnailPath = rawThumbPath
    ? rawThumbPath.replace(/\\/g, "/").replace("public", "")
    : "/images/vehicles/no-image-tn.png"

  try {
    const classIdInt = classification_id ? parseInt(classification_id) : null
    const priceNum = inv_price ? parseFloat(inv_price) : null
    const yearNum = inv_year ? parseInt(inv_year) : null

    await invModel.addNewInventory(
      inv_make,
      inv_model,
      yearNum,
      inv_description,
      imagePath,       // IMPORTANT: pass computed image path
      inv_miles,
      thumbnailPath,   // IMPORTANT: pass computed thumbnail path
      priceNum,
      inv_color,
      classIdInt
    )

    req.flash("success", "Inventory item successfully added.")
    res.redirect("/inv")
    
  } catch (error) {
    console.error("Controller error:", error)

    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      message: "An error occurred while adding inventory.",
      errors: [],

      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image: imagePath,
      inv_miles,
      inv_thumbnail: thumbnailPath,
      inv_price,
      inv_color,
      classification_id,
    })
  }
}



invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  // req.flash("notice", "This is a flash message. Get it?")
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    classificationSelect,
  })
}



/* ***************************
 *  funtion to return Inventory by the Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

// build the "edit inventory" view
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemRows = await invModel.getVehicleById(inv_id)
  const itemData = itemRows[0]
  // console.log(itemData.rows[0])
  // console.log("Inventory ID:", inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/editInventoryView", {
    title: "Edit " + itemName,
    nav,
    message:"",
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
  
}


/* **************
* Update inventory data 
* ********************/
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  console.log("About to update inventory")
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )
  console.log("Inventory update result:", updateResult)

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } 
  else {
  
    console.log(">>>>>Starting editInventoryView resolver")
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
  
    const errors = validationResult(req) // see the v results
    console.log(">>>>Lets see some errors", errors)

    req.flash("notice", "Sorry, the insert failed.")

    res.status(501).render("inventory/editInventoryView", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: errors.array(),
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
} 


// build the delete inventory view
invCont.deleteInventoryItemView = async function (req, res, next) {
  
  // Collect the inv_id from the incoming request.
  const inv_id = parseInt(req.params.inv_id)
  // Build the navigation for the new view.
  let nav = await utilities.getNav()
  //Get the data for the inventory item from the database, using the existing model-based function and sending the inv_id to the function as a parameter.    
  const itemRows = await invModel.getVehicleById(inv_id)
  const itemData = itemRows[0]
  // Build a name variable to hold the inventory item's make and model.
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    
  })
  
}

/* **************
* Delete inventory data 
* ********************/
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  // const {
  //   inv_id,
  //       } = req.body

    // Collect the inv_id from the incoming request.
  
    const inv_id = parseInt(req.body.inv_id)
      // console error log
  console.log("About to delete inventory item with ID:", inv_id)
  console.log("Request body:", req.body)
  const deleteResult = await invModel.deleteInventory(inv_id)
  // const deleteResultMain = deleteResult[0]

  console.log("Inventory update result:", deleteResult)

  if (deleteResult) {
    req.flash("notice", `The inventory item was successfully deleted.`)
    res.redirect("/inv/")
    
  } 
  else {
    
    console.log(">>>>>Starting deleteInventoryView resolver")
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  

      }
} 




  module.exports = invCont