/////////////////////////////////////////
// Node Web scraper                    //
// (C) 2023 By Davide Balice V. 1.03.  //
/////////////////////////////////////////

//set autoinstall:false, per compatibilità con plesk
if (typeof PhusionPassenger != "undefined") {
  PhusionPassenger.configure({ autoInstall: false });
}

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 8002;
const fs = require("fs");
const path = require("path");
const http = require("http").Server(app);
const cors = require("cors");
const WebSocket = require("ws");

//cors
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        /(^|\.)davidebalice\.dev$/.test(origin) ||
        /^http:\/\/localhost(:\d{1,5})?$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    optionsSuccessStatus: 200,
  })
);

app.use((req, res, next) => {
  res.setHeader("Vary", "Origin");
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Configura Express per utilizzare i file statici (html,css,js,ecc...)
app.use(express.static("public"));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
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

//footer
app.use((req, res, next) => {
  fs.readFile(__dirname + "/public/footer.html", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error load footer");
    }
    res.locals.footer = data;
    next();
  });
});

let server = null;

// Avvia il server
if (typeof PhusionPassenger != "undefined") {
  server = http.listen("passenger");
} else {
  server = http.listen(port, () => {
    console.clear();
    console.log(" ");
    console.log(`Server start on http://localhost:${port}`);
  });
}

const wss = new WebSocket.Server({ server });
wss.on("connection", (ws) => {
  // Invia un messaggio di benvenuto quando un client si connette
  ws.send("WebSocket client connected");

  ws.on("message", (message) => {
    ws.send(message);
  });

  ws.on("error", (error) => {
    ws.send("WebSocket error:", error);
  });
});

module.exports = { wss };

//Importa le rotte
const routes = require("./routes");
app.use(routes);
