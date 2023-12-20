const puppeteer = require("puppeteer");
const express = require("express");
const WebSocket = require("ws");
const app = express();
const wsPort = 8003;
const unirest = require("unirest");
const cheerio = require("cheerio");

let shouldRun = true;

const wss = new WebSocket.Server({ port: wsPort });
wss.on("connection", (ws) => {
  const originalConsoleLog = console.log;

  console.log = function (...args) {
    const message = args.join(" ");
    originalConsoleLog.apply(console, args);
    // Invia i log al client HTML
    ws.send(message);
  };
});

async function startScrape(typeSearch, mode, userId, password) {
  // Lancio il browser false=vedo l'anteprima, "new"= stealth;
  const browser = await puppeteer.launch({ headless: mode });
  const page = await browser.newPage();
  const fs = require("fs");

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
  console.log(" ");
  console.log("Booking.com scraping. ");
  console.log("(C) 2023 By Davide Balice V. 1.03.");
  console.log(" ");
  console.log(" ");
  if (typeSearch == "desktop") {
    console.log("login dektop started, wait...");
  } else {
    console.log("login mobile started, wait...");
  }

  // Vado alla pagina di Login;
  await page.goto("https://www.booking.com");

  // Avviso che siamo pronti a partire con la ricerca;
  console.clear();
  console.log(" ");

  if (typeSearch == "desktop") {
    console.log("inzio ricerca desktop, attendere...");
  } else {
    console.log("inzio ricerca mobile, attendere...");
  }

  page.setDefaultNavigationTimeout(2 * 60 * 1000);

  const checkinDate = "2024-02-10";
  const checkoutDate = "2024-02-17";

  await page.goto(
    `https://www.booking.com/searchresults.html?aid=304142&label=gen173nr-1FCAEoggI46AdIM1gEaKcBiAEBmAExuAEHyAEM2AEB6AEB-AECiAIBqAIDuALK69aqBsACAdICJGIyNTBjMTkyLWVjOGQtNDZhOC1iMzExLWM4MmYzZTNiYzlhNdgCBeACAQ&checkin=${checkinDate}&checkout=${checkoutDate}&dest_id=20014181&dest_type=city&nflt=ht_id%3D204&group_adults=0&req_adults=0&no_rooms=0&group_children=0&req_children=0`
  );

  //https://www.booking.com/searchresults.html?aid=304142&label=gen173nr-1FCAEoggI46AdIM1gEaKcBiAEBmAExuAEHyAEM2AEB6AEB-AECiAIBqAIDuALK69aqBsACAdICJGIyNTBjMTkyLWVjOGQtNDZhOC1iMzExLWM4MmYzZTNiYzlhNdgCBeACAQ&checkin=2024-02-10&checkout=2024-02-17&dest_id=20014181&dest_type=city&nflt=ht_id%3D204&group_adults=0&req_adults=0&no_rooms=0&group_children=0&req_children=0

  const htmlContent = await page.evaluate(
    () => document.documentElement.outerHTML
  );

  //console.log(htmlContent);

  await page.waitForSelector('div[data-testid="property-card"]');

  // Extract hotel data
  const hotels = await page.$$('div[data-testid="property-card"]');
  console.log(`There are: ${hotels.length} hotels.`);

  if (hotels.length > 0) {
    console.log(
      'La pagina ha trovato almeno un elemento div[data-testid="property-card"].'
    );
  } else {
    console.log(
      'La pagina non ha trovato nessun elemento div[data-testid="property-card"].'
    );
  }

  const hotelsList = [];
  for (const hotel of hotels) {
    const hotelDict = {};
    const imgElement = await hotel.$('div[data-testid="property-card"] img');
    const imgSrc = await (await imgElement.getProperty("src")).jsonValue();
    hotelDict["image"] = imgSrc;

    hotelDict["hotel"] = await hotel.$eval(
      'div[data-testid="title"]',
      (el) => el.innerText
    );
    hotelDict["price"] = await hotel.$eval(
      'span[data-testid="price-and-discounted-price"]',
      (el) => el.innerText
    );
    hotelDict["score"] = await hotel.$eval(
      'div[data-testid="review-score"] > div:nth-child(1)',
      (el) => el.innerText
    );
    hotelsList.push(hotelDict);
  }

  hotelsList.map((hotel, index) => {
    console.log(`Hotel ${index + 1}:`);
    console.log("Name:", hotel.hotel);
    console.log("Price:", hotel.price);
    console.log("Score:", hotel.score);
    console.log("Image:", hotel.image);
    console.log("--------------------------------");
  });

  const csvData = hotelsList
    .map((hotel) => Object.values(hotel).join(","))
    .join("\n");
  fs.writeFileSync("hotels_list.csv", csvData);

  // Aspetto 2 secondi e chiudo tutto;
  await page.waitForTimeout(2000);
  await browser.close();
  console.clear();
}

async function stopSearch() {
  shouldRun = false;
}

module.exports = { startScrape, stopSearch };
