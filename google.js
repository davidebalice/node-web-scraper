const puppeteer = require("puppeteer");
const WebSocket = require("ws");
const cheerio = require("cheerio");
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

const searchGoogle = async (key) => {
  const allTitles = [];
  const scrollLimit = 15000;
  let scrollY = 0;

  //const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  let currentHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36"
  );
  await page.setDefaultNavigationTimeout(30000);
  await page.goto(`https://www.google.com/search?q=${key}&gl=it&hl=it`);

  console.clear();
  sendToWebSocket("Node Google search scraper by Davide Balice");
  sendToWebSocket(`<div class="resultRowScroll">Start search...</div>`);

  while (scrollY < scrollLimit) {
    console.clear();

    const html = await page.content();
    const $ = cheerio.load(html);

    currentHeight = await page.evaluate(() => document.body.scrollHeight);

    await page.waitForSelector("#L2AGLb");

    //Click sul pulsante
    await page.evaluate(() => {
      // Selezioniamo il pulsante tramite l'ID
      const button = document.getElementById("L2AGLb");

      // Clicchiamo sul pulsante
      if (button) {
        button.click();
      } else {
        sendToWebSocket("Pulsante non trovato");
      }
    });

    let titles = [];
    let links = [];
    let snippets = [];
    let displayedLinks = [];

    $(".g .yuRUbf h3").each((i, el) => {
      titles[i] = $(el).text();
    });
    $(".yuRUbf a").each((i, el) => {
      links[i] = $(el).attr("href");
    });
    $(".g .VwiC3b ").each((i, el) => {
      snippets[i] = $(el).text();
    });
    $(".g .yuRUbf .NJjxre .tjvcx").each((i, el) => {
      displayedLinks[i] = $(el).text();
    });

    const organicResults = [];

    for (let i = 0; i < titles.length; i++) {
      organicResults[i] = {
        title: titles[i],
        links: links[i],
        snippet: snippets[i],
        displayedLink: displayedLinks[i],
      };
      if (!allTitles.includes(titles[i])) {
        if (snippets[i] !== undefined) {
          sendToWebSocket(
            `<div class="resultRow"><a href="${links[i]}" target="_blank" class="resultA"><b style="color:#333">${titles[i]}</b><br /><span style="color:#333">${snippets[i]}</span></a></div>`
          );
        } else {
          sendToWebSocket(
            `<div class="resultRow"><a href="${links[i]}" target="_blank" class="resultA"><b>${titles[i]}</b></a></div>`
          );
        }

        allTitles.push(titles[i]);
      }
    }

    await page.evaluate(() => {
      window.scrollTo(0, window.document.body.scrollHeight);
    });

    await page.waitForTimeout(2000);

    //Aggiornamento posizione pagina
    scrollY = scrollY + 4000;
    if (scrollY < scrollLimit)
      sendToWebSocket(`<div class="resultRowScroll">Scroll page...</div>`);

    await page.waitForTimeout(3000);
  }
  await page.waitForTimeout(1000);
  sendToWebSocket(`<div class="resultRowStop">Search finished</div>`);
};

module.exports = { searchGoogle };
