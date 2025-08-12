const jwt = require("jsonwebtoken")
require("dotenv").config()


module.exports = function checkAccountType(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash("notice", "Please log in to access this page.");
    return res.redirect("/account/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      // store decoded token in locals for later use
      res.locals.accountData = decoded;
      return next();
    } else {
      req.flash("notice", "Access denied. Employees or Admins only.");
      return res.redirect("/account/login");
    }
  } catch (err) {
    console.error("JWT verification error:", err);
    req.flash("notice", "Invalid session. Please log in again.");
    return res.redirect("/account/login");
  }
};
