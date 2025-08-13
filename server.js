/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
// added utilities index file to scope of server.js
const utilities = require("./utilities/")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute") 
// adding the Session package and DB connection
const session = require("express-session")
const pool = require('./database')
// require the account route file
const accountRoute = require("./routes/accountRoute")
// Add body parser
const bodyParser = require("body-parser")
// add error route
const errorRoute = require("./routes/errorRoute")
// add favorites routes 
const favoriteRoute = require("./routes/favoritesRoute")
// require the cookie parser
const cookierParser = require("cookie-parser")



/* ***********************
 * Middleware
 * ************************/
app.use(session ({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware ---flash
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages') (req, res)
  next()
})

// add  middleware for cookieParser
app.use(cookierParser())


// latest universal middleware i guess --here we both go
app.use(utilities.checkJWTToken)


// me - here we go again - trial
// Enable POST data parsing (for future forms) - gpt advice
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Task 1 -- so that every route request has these variables - to acccess login status in every page
app.use(utilities.injectLoginStatus)


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


// make body parser available to the app
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded


/* ***********************
 * Routes
 *************************/
app.use(static) 


// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))


// Inventory routes
app.use("/inv", inventoryRoute)


// Account Routes
app.use("/account", accountRoute)


// add error route
app.use("/errors", errorRoute)

// add favorites route
app.use("/favorites", favoriteRoute)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry boys, we appear to have lost that page. Desole!'})
})


/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if (err.status == 404) {message = err.message} else {message= 'oh no! Sorry Chief, There was a little crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})



/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})


