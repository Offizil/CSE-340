const { body } = require("express-validator");

const addFavoriteRules = [
  body("inv_id")
    .isInt({ min: 1 })
    .withMessage("Invalid item ID.")
];

module.exports = { addFavoriteRules };
