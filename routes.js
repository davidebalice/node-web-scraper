const express = require("express");
const router = express.Router();
const bingSearch = require("./bingSearch");
const googleSearch = require("./googleSearch");
const path = require("path");

//Rotta iniziale
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

//Rotta per la pagina bing.html
router.get("/bing", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/bing.html"));
});

router.post("/bing-desktop-search", (req, res) => {
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

router.post("/google-desktop-search", (req, res) => {
  res.send("App start");
  googleSearch.searchGoogle("desktop");
});

router.post("/google-search-stop", (req, res) => {
  googleSearch.stopSearch();
  console.log("Function stopped");
});

module.exports = router;
