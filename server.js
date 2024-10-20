const express = require("express")
const app = express()
const port = process.env.PORT || 8000
const session = require("express-session");
const cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

//parse ng form  body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({limit:"50mb"}));
app.use(cors());
app.use(morgan("common"));

//initialized and use session middleware
app.use(
    session({ secret: "ABCDefg", resave: false, saveUninitialized: true })
  );
app.use(cookieParser());
// middleware to make 'user' available to all templates
app.use(function (req, res, next) {
  res.locals.username = req.session.username;
  res.locals.loggedID = req.session.loggedID;
  next();
});

//Static Files
app.use("/public", express.static("public"))

//Templating Engine
app.set('views', './views')
app.set("view engine", "ejs")

//Routes
const shopRoute = require('./routes/shopRoutes')
app.use('/', shopRoute)
app.use(function(req, res, next) {
  if (!req.route)
      res.render('admin/errorPage') 
  next();
});
//Listening to Port
app.listen(port, () => console.log(`Server running at port:${port}`))