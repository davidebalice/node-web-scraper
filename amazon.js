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



async function startScrape(typeSearch, mode, key) {
  // Lancio il browser false=vedo l'anteprima, "new"= stealth;
  //const browser = await puppeteer.launch({ headless: mode });
   const browser = await puppeteer.launch({
    headless: mode,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // A seconda della ricerca apro o meno l'emulazione iPhone X;
  if (typeSearch == "desktop") {
    n = 2.5;
  } else {
    const iPhone = puppeteer.devices["iPhone X"];
    await page.emulate(iPhone);
    n = 4;
  }

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36"
  );

  // Altri header della richiesta
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
  });

  console.clear();


  sendToWebSocket(" ");
  sendToWebSocket("Amazon.it scraping By Davide Balice.");
  sendToWebSocket(" ");
  sendToWebSocket(" ");

  // Avviso che siamo pronti a partire con la ricerca;
  console.clear();

  page.setDefaultNavigationTimeout(2 * 60 * 1000);

  // navigate to a website and set the viewport
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(
    `https://www.amazon.it/s?k=${key}&__mk_it_IT=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=L8FRLM64UZ0S&sprefix=${key}%2Caps%2C125&ref=nb_sb_noss_1`,
    {
      timeout: 3000000,
    }
  );

  // search and wait the product list
  await page.type("#twotabsearchtextbox", "iphone x 64gb");
  await page.click("input.nav-input");
  await page.waitForSelector(".s-result-item");

  // create a screenshots
  await page.screenshot({ path: "search-iphone-x.png" });

  const products = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll(".s-result-item"));
    return links
      .map((link) => {
        const nameElement = link.querySelector(
          ".a-size-base-plus.a-color-base.a-text-normal"
        );
        const priceElement = link.querySelector(".a-price-whole");
        const imageElement = link.querySelector(".s-image");

        if (nameElement && priceElement && imageElement) {
          return {
            name: nameElement.textContent.trim(),
            url: link.querySelector(".a-link-normal.a-text-normal").href,
            image: imageElement.src,
            price: parseFloat(
              priceElement.textContent.replace(/[,.]/g, (m) =>
                m === "," ? "." : ""
              )
            ),
          };
        } else {
          return null;
        }
      })
      .filter((product) => product !== null)
      .slice(0, 20);
  });

  await products.forEach((product) => {
    sendToWebSocket(
      `<a href="${product.url}" target="_blank" class="resultA"><div class="resultHotelRow"><img src="${product.image}" class="hotelImg"><div class="resultHotelText"><span><b>${product.name}</b><br /></span><span style="color:#333">€ ${product.price}</span></div></div></a>`
    );
  });

  // close the browser
  await browser.close();

  console.clear();
}

module.exports = { startScrape };
