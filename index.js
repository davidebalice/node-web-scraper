/////////////////////////////////////////
// Bing search                         //
// (C) 2023 By Davide Balice V. 1.03.  //
/////////////////////////////////////////

const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");
const app = express();
const port = 8000;
const fs = require("fs");
const path = require("path");

// Configura Express per utilizzare i file statici (html,css,js,ecc...)
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Middleware per analizzare i dati della richiesta
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//header
app.use((req, res, next) => {
  fs.readFile(__dirname + "/public/header.html", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error load header");
    }
    res.locals.header = data;
    next();
  });
});

//Importa le rotte
app.use(routes);

// Avvia il server
app.listen(port, () => {
  console.clear();
  console.log(" ");
  console.log(`Server start on http://localhost:${port}`);
});
