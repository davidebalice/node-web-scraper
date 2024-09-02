const puppeteer = require("puppeteer");
const WebSocket = require("ws");
const { wss } = require("./index.js");
const fs = require("fs");
const path = require("path");

// Funzione per scrivere un messaggio nel file di log
const logFilePath = path.join(__dirname, "app.log");
function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Errore durante la scrittura del log:", err);
    }
  });
}

wss.on("connection", (ws) => {
 

  ws.on("message", (message) => {
    ws.send(message);
  });

  ws.on("error", (error) => {
    ws.send("WebSocket error:", error);
  });

  ws.on("message", (message) => {
    console.log("Received message:", message);
    ws.send(message);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", () => {
    ws.send("disconnetted");
  });
});


// Utilizza i WebSocket per inviare messaggi ai client connessi
function sendToWebSocket(message) {
  if (wss && wss.clients.size > 0) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}


async function startSearch(typeSearch, mode, key) {
  const allTitles = [];
  // Lancio il browser false=vedo l'anteprima, "new"= stealth;
  //const browser = await puppeteer.launch({ headless: mode });
  const browser = await puppeteer.launch({
    headless: mode,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  let n;

  // A seconda della ricerca apro o meno l'emulazione iPhone X;
  if (typeSearch == "desktop") {
    n = 2.5;
  } else {
    const iPhone = puppeteer.devices["iPhone X"];
    await page.emulate(iPhone);
    n = 4;
  }

  console.clear();
  sendToWebSocket(" ");
  sendToWebSocket("Node Bing search scraper by Davide Balice");
  sendToWebSocket(`<div class="resultRowScroll">Start search...</div>`);

  await page.setDefaultNavigationTimeout(10000);
  await page.goto(
    `https://bing.com/search?q=${key}&form=QBLH&sp=-1&ghc=1&lq=0&pq=34354%2B&sc=6-6&qs=n&sk=&cvid=F415083C789F475BBE9AC1D8B69A42C1&ghsh=0&ghacc=0&ghpl=`
  );
  // Numero massimo di pagine da visitare
  const maxPages = 4;

  //cicla le pagine
  for (let pageNum = 0; pageNum < maxPages; pageNum++) {
    await page.waitForSelector(".b_pag");
    const numberOfResults = await page.$$("#b_results > li");
    for (let i = 1; i <= numberOfResults.length; i++) {
      await page.hover(`#b_results > li:nth-child(${i})`);
      await page.waitForTimeout(1000);
    }
    await page.hover(".b_pag");

    const result = await page.evaluate(function () {
      return Array.from(document.querySelectorAll("li.b_algo")).map((el) => ({
        link: el.querySelector("h2 > a").getAttribute("href"),
        title: el.querySelector("h2 > a").innerText,
        snippet: el.querySelector("p, .b_mText div").innerText,
      }));
    });

    result.forEach((item, index) => {
      if (!allTitles.includes(item.title)) {
        if (item.title !== undefined && item.title !== "") {
          if (item.snippet !== undefined) {
            sendToWebSocket(
              `<div class="resultRow"><a href="${item.link}" target="_blank" class="resultA"><b style="color:#333">${item.title}</b><br /><span style="color:#333">${item.snippet}</span></a></div>`
            );
          } else {
            sendToWebSocket(
              `<div class="resultRow"><a href="${item.link}" target="_blank" class="resultA"><b>${item.title}</b></a></div>`
            );
          }
        }
        allTitles.push(item.title);
      }
    });

    await page.waitForSelector("a.sb_pagN");

    const nextPageLink = await page.$("a.sb_pagN");
    if (nextPageLink && pageNum < maxPages - 1) {
      sendToWebSocket(
        `<div class="resultRowScroll">Caricamento prossima pagina...</div>`
      );
      await page.evaluate((link) => link.click(), nextPageLink);
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });
    } else {
      //break;
    }
  }
  sendToWebSocket(`<div class="resultRowStop">Search finished</div>`);
  // Aspetto 2 secondi e chiudo tutto;
  await page.waitForTimeout(2000);
  await browser.close();
}

module.exports = { startSearch };
