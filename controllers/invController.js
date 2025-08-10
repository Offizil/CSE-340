const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

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

// add new inventory 
// invCont.addInventory = async function  (req, res, next) {
//   // controller loggin for troubleshooting-----------------------
//     console.log("Request body:", req.body)
//     console.log("Request files:", req.files)
// // -----------------------------------------------
//   const 
//     {inv_make, 
//     inv_model, 
//     inv_year, 
//     inv_price, 
//     inv_description, 
//     inv_miles, 
//     inv_color,
//     inv_image,
//     inv_thumbnail,
//     classification_id} = req.body

//   const nav = await utilities.getNav()
//   const classificationList = await utilities.buildClassificationList(req.body.classification_id)
  
//   // Handle uploaded file paths or fall back to default placeholders
//   const imagePath = req.files?.inv_image?.[0]?.path?.replace("public", "") || "/images/vehicles/no-image.png"
//   const thumbnailPath = req.files?.inv_thumbnail?.[0]?.path?.replace("public", "") || "/images/vehicles/no-image-tn.png"


//   try {
//     // Call model to insert into DB
//     await invModel.addNewInventory(
//     inv_make, 
//     inv_model, 
//     inv_year, 
//     inv_description, 
//     inv_image,
//     inv_miles, 
//     inv_thumbnail,
//     inv_price, 
//     inv_color,
//     classification_id 
//     )



//     console.log("Received form data:", req.body)


//     req.flash("success", "Inventory item successfully added.")
//     res.redirect("/inv")

//   } catch (error) {
//     console.error("Controller error:", error)


//     req.flash("error", "An error occurred while adding inventory.")
//     res.status(500).render("/add-inventory", {
//       title: "Add Inventory",
//       nav,
//       classificationList,
//       message: "An error occurred while adding inventory.",
//       errors: [],
//       inv_make, 
//       inv_model, 
//       inv_year, 
//       inv_description, 
//       inv_image: imagePath,
//       inv_miles, 
//       inv_thumbnail: thumbnailPath,
//       inv_price, 
//       inv_color,
//       classification_id,

//     })
//   }

// }

// modified - add new inventory
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

// add new inventory view i guess
// invCont.

  module.exports = invCont