const express = require("express");
const router = express.Router();
const bing = require("./bing");
const google = require("./google");
const bookingcom = require("./bookingcom");
const amazon = require("./amazon");
const path = require("path");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const config = require("./config");

// Funzione per scrivere un messaggio nel file di log
const logFilePath = path.join(__dirname, "app_routes.log");
function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Errore durante la scrittura del log:", err);
    }
  });
}

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
    res.render("index", {
      htmlContent: data,
      header: res.locals.header,
      footer: res.locals.footer,
      serverUrl: config.serverUrl,
    });
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
    res.render("bing", {
      htmlContent: data,
      header: res.locals.header,
      footer: res.locals.footer,
      serverUrl: config.serverUrl,
    });
  });
});

router.post("/bing-desktop-search", limiter, (req, res) => {
  const { key } = req.body;
  res.send("Search start, please wait.");
  bing.startSearch("desktop", "new", key);
});

router.post("/bing-search-stop", (req, res) => {
  bing.stopSearch();
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
    console.log(config.serverUrl);
    res.render("google", {
      htmlContent: data,
      header: res.locals.header,
      footer: res.locals.footer,
      serverUrl: config.serverUrl,
    });
  });
});


router.post("/google-desktop-search", limiter, async (req, res) => {
  await google
    .searchGoogle(req.body.key)
    .then(() => {
      res.send("Search start, please wait google.");
    })
    .catch((err) => {
      res.status(500).send("Errore durante l'esecuzione della ricerca" + err);
    });
  res.send("Search start, please wait google.");
});

router.post("/google-search-stop", (req, res) => {
  google.stopSearch();
  console.log("Function stopped");
});

router.get("/bookingcom", (req, res) => {
  const filePath = path.join(__dirname, "views", "bookingcom.ejs");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error html file");
    }
    res.render("bookingcom", {
      htmlContent: data,
      header: res.locals.header,
      footer: res.locals.footer,
      serverUrl: config.serverUrl,
    });
  });
});

router.post("/bookingcom-desktop-search", (req, res) => {
  res.send("Start scraping, please wait.");
  bookingcom.startScrape(
    "desktop",
    "new",
    req.body.key,
    req.body.datein,
    req.body.dateout
  );
});

router.get("/amazon", (req, res) => {
  const filePath = path.join(__dirname, "views", "amazon.ejs");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error html file");
    }
    res.render("amazon", {
      htmlContent: data,
      header: res.locals.header,
      footer: res.locals.footer,
      serverUrl: config.serverUrl,
    });
  });
});

router.post("/amazon-desktop-search", (req, res) => {
  res.send("Start scraping, please wait.");
  amazon.startScrape("desktop", "new", req.body.key);
});

module.exports = router;
