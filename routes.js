const express = require("express");
const router = express.Router();
const bingSearch = require("./bingSearch");
const googleSearch = require("./googleSearch");
const bookingcom = require("./bookingcom");
const path = require("path");
const rateLimit = require("express-rate-limit");

//impostazione di un limiter per evitare uso eccessivo ed eventuali ban dell'ip
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // limit each IP to 100 requests per windowMs
});

//Rotta iniziale
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

//Rotta per la pagina bing.html
router.get("/bing", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/bing.html"));
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
  res.sendFile(path.join(__dirname, "public/google.html"));
});

router.post("/google-desktop-search", limiter, (req, res) => {
  res.send("App start");
  googleSearch.searchGoogle("desktop");
});

router.post("/google-search-stop", (req, res) => {
  googleSearch.stopSearch();
  console.log("Function stopped");
});

router.get("/bookingcom", limiter, (req, res) => {
  res.sendFile(path.join(__dirname, "public/bookingcom.html"));
});

router.post("/bookingcom-desktop-search", (req, res) => {
  res.send("App start");
  bookingcom.startScrape("desktop");
});

module.exports = router;
