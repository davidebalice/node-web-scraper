/////////////////////////////////////////
// Bing search                         //
// (C) 2023 By Davide Balice V. 1.03.  //
/////////////////////////////////////////

const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");
const app = express();
const port = 8000;



// Configura Express per utilizzare i file statici (html,css,js,ecc...)
app.use(express.static("public"));

// Middleware per analizzare i dati della richiesta
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Importa le rotte
app.use(routes);

// Avvia il server
app.listen(port, () => {
  console.clear();
  console.log(" ");
  console.log(`Server start on http://localhost:${port}`);
});
