/* Module Dependencis */
const path = require("path");

const express = require("express");
const session = require("express-session");
const expressStatusMonitor = require("express-status-monitor");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const chalk = require("chalk");
const dotenv = require("dotenv");
const multer = require("multer");

const upload = multer({ dest: path.join(__dirname, "uploads") });

/* Load environment variables from .env file, where API keys and passwords are configured. */
dotenv.config({ path: ".env.example" });

/* Initialize Express App */
const app = express();

/* Express View Engine */
app.set("view engine", "ejs");

/* Middleware for Favicon, BodyParser, Static File */
app.use("/favicon.ico", express.static("public/images/favicon.ico"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Express Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1209600000 } // two weeks in milliseconds
  })
);

/* Express Status Monitor */
app.use(expressStatusMonitor());

/* Flash Message and Session */
app.use(flash());
app.use((req, res, next) => {
  req.user = req.session.user;
  res.locals.info = req.flash("info");
  res.locals.warning = req.flash("warning");
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
app.get("*", (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

/* Primary App Routes */
app.get("/", (req, res, next) => {
  res.render("index");
});
app.get("/login", (req, res, next) => {
  res.render("pages/login");
});
app.get("/signup", (req, res, next) => {
  res.render("pages/signup");
});
app.get("/contact", (req, res, next) => {
  res.render("pages/contact");
});

/* Define Express Server PORT */
const PORT = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;

/* MongoDb connection using Mongoose */
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log(`✓ Successfully Connected to MongoDB..`);

    /* Start Express Server */
    app.listen(PORT, () => {
      console.log(`✓ Server is running at http://localhost:${PORT}..`);
      console.log("  Press CTRL+C to stop\n");
    });
  })
  .catch(err => {
    console.log("ERROR! MongoDB Connection...!!\n", err);
    process.exit();
  });
