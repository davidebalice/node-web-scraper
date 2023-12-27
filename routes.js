const express = require("express");
const router = express.Router();
const bingSearch = require("./bingSearch");
const googleSearch = require("./googleSearch");
const bookingcom = require("./bookingcom");
const amazon = require("./amazon");
const path = require("path");
const rateLimit = require("express-rate-limit");
const fs = require("fs");

//impostazione di un limiter per evitare uso eccessivo ed eventuali ban dell'ip
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // limita a 10 richieste ogni 10 minuti
});

//Rotta iniziale
router.get("/", (req, res) => {
  const filePath = path.join(__dirname, "views", "index.ejs");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error html file");
    }
    res.render("index", { htmlContent: data, header: res.locals.header });
  });
});

//Rotta per la pagina bing.html
router.get("/bing", (req, res) => {
  const filePath = path.join(__dirname, "views", "bing.ejs");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error html file");
    }
    res.render("bing", { htmlContent: data, header: res.locals.header });
  });
});

router.post("/bing-desktop-search", limiter, (req, res) => {
  const { email, password } = req.body;
  res.send("App start");
  bingSearch.startSearch("desktop", "new", email, password);
});

router.post("/bing-search-stop", (req, res) => {
  bingSearch.stopSearch();
  console.log("Function stopped");
});

//Rotta per la pagina google.html
router.get("/google", (req, res) => {
  const filePath = path.join(__dirname, "views", "google.ejs");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error html file");
    }
    res.render("google", { htmlContent: data, header: res.locals.header });
  });
});

router.post("/google-desktop-search", limiter, (req, res) => {
  res.send("App start");
  googleSearch.searchGoogle("desktop");
});

router.post("/google-search-stop", (req, res) => {
  googleSearch.stopSearch();
  console.log("Function stopped");
});

router.get("/bookingcom", (req, res) => {
  const filePath = path.join(__dirname, "views", "bookingcom.ejs");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error html file");
    }
    res.render("bookingcom", { htmlContent: data, header: res.locals.header });
  });
});

router.post("/bookingcom-desktop-search", (req, res) => {
  res.send("App start");
  bookingcom.startScrape("desktop");
});

router.get("/amazon", (req, res) => {
  const filePath = path.join(__dirname, "views", "amazon.ejs");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error html file");
    }
    res.render("amazon", { htmlContent: data, header: res.locals.header });
  });
});

router.post("/amazon-desktop-search", (req, res) => {
  res.send("App start");
  amazon.startScrape("desktop");
});

module.exports = router;
