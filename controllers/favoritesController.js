const favoritesModel = require("../models/favorites-model");
const utilities = require("../utilities/");
const { validationResult} = require("express-validator")


const favoritesController = {};

// Add a favorite
favoritesController.addFavorite = async function (req, res, next) {
  // try {
  //   const { inv_id } = req.body;
  //   const account_id = res.locals.accountData.account_id;

  //   if (!inv_id) {
  //     req.flash("notice", "Invalid item selection.");
  //     return res.redirect("/inv");
  //   }

  //   await favoritesModel.addFavorite(account_id, inv_id);
  //   req.flash("notice", "Item saved to favorites!");
  //   res.redirect(`/inv/detail/${inv_id}`);
  // } catch (err) {
  //   next(err);
  // }
  
  try {
    const account_id = res.locals.accountData.account_id
    const inv_id = parseInt(req.params.inv_id) // changed from req.body
    

     // Check if already in favorites
    const exists = await favoritesModel.isFavorite(account_id, inv_id);
    if (exists) {
      req.flash("notice", "Item is already in your favorites.");
      return res.redirect(`/inv/detail/${inv_id}`)

    }

    await favoritesModel.addFavorite(account_id, inv_id)
    console.log("addFavorite controller:", 
      { account_id, inv_id })

    


    req.flash("notice", "Item added to favorites!")
    return res.redirect(`/inv/detail/${inv_id}`)

  } catch (error) {
    console.error("addFavorite controller error:", error)
    req.flash("notice", "Failed to add favorite.")
    res.redirect(`/inv/detail/${req.body.inv_id}`)
  }


};

// List all favorites for logged-in user
favoritesController.buildFavoritesView = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id;
    const favorites = await favoritesModel.getFavoritesByAccount(account_id);
    const nav = await utilities.getNav();

    res.render("account/favorites", {
      title: "My Saved Favorites",
      nav,
      favorites,
      message: req.flash("notice"),
    });
  } catch (err) {
    next(err);
  }
};

// Remove a favorite
favoritesController.removeFavorite = async function (req, res, next) {
  try {
    const favorite_id = parseInt(req.params.favorite_id) // changed from req.body
    const account_id = res.locals.accountData.account_id

    await favoritesModel.removeFavorite(favorite_id, account_id)
    req.flash("notice", "Item removed from favorites.")
    res.redirect("/favorites/");
  } catch (err) {
    next(err)
  }
};



module.exports = favoritesController;
