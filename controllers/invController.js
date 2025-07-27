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
  })
}


// here we go prt 2 
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
      vehicleDetail: vehicleDetailHTML
    })
  } catch (error) {
    console.error("Error loading vehicle detail:", error)
    next(error)
  }
}


  module.exports = invCont