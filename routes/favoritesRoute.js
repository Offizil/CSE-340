const express = require("express")
const router = new express.Router()
const favoritesController = require("../controllers/favoritesController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/favorites-validation") // optional validation file

// Protect all favorites routes
router.use(utilities.checkLogin)

// View all favorites
router.get("/", 
    utilities.handleErrors(favoritesController.buildFavoritesView))

// Add favorite
router.post("/add/:inv_id", 
    utilities.handleErrors(favoritesController.addFavorite))

// Remove favorite
router.post("/remove/:favorite_id", 
    utilities.handleErrors(favoritesController.removeFavorite))




module.exports = router
