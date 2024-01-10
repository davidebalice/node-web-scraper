const puppeteer = require("puppeteer");
const express = require("express");
const WebSocket = require("ws");
const wsPort = 8003;

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

async function startScrape(
  typeSearch,
  mode,
  location,
  checkinDate,
  checkoutDate
) {
  const allTitles = [];
  // Lancio il browser false=vedo l'anteprima, "new"= stealth;
  const browser = await puppeteer.launch({ headless: mode });
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

  // Avviso che siamo pronti a partire con la ricerca;
  console.clear();
  console.log(" ");

  page.setDefaultNavigationTimeout(2 * 60 * 1000);

  await page.goto(
    `https://www.booking.com/searchresults.it.html?ss=${location}&ssne=${location}&ssne_untouched=${location}&label=gen173nr-1BCAEoggI46AdIM1gEaHGIAQGYARS4ARfIAQzYAQHoAQGIAgGoAgO4AsyR4KwGwAIB0gIkM2EwYzI2Y2UtZWIzNC00NDAzLWE3NWQtNzU1N2NlM2RiN2Y02AIF4AIB&sid=abe094b117223d06babb0564c512c7ee&aid=304142&lang=it&sb=1&src_elem=sb&src=searchresults&dest_id=&dest_type=city&checkin=${checkinDate}&checkout=${checkoutDate}&group_adults=2&no_rooms=1&group_children=0`
  );

  const htmlContent = await page.evaluate(
    () => document.documentElement.outerHTML
  );
  //console.log(htmlContent);

  //Numero massimo di pagine da visitare
  const maxPages = 4;

  console.clear();
  console.log(" ");
  console.log("Node Booking.com scraper by Davide Balice");
  console.log(`<div class="resultRowScroll">Start search...</div>`);

  //cicla le pagine
  for (let pageNum = 0; pageNum < maxPages; pageNum++) {
    await page.waitForSelector('div[data-testid="property-card"]');

    //Estrai data strutture ricettive
    const hotels = await page.$$('div[data-testid="property-card"]');

    if (hotels.length === 0) {
      console.log("La pagina non ha trovato nessun elemento ");
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
      hotelDict["link"] = await hotel.$eval(
        'div[data-testid="property-card"] a',
        (el) => el.href
      );

      try {
        hotelDict["price"] = await hotel.$eval(
          'span[data-testid="price-and-discounted-price"]',
          (el) => el.innerText
        );
      } catch (error) {
        hotelDict["price"] = " - ";
      }

      try {
        hotelDict["score"] = await hotel.$eval(
          'div[data-testid="review-score"] > div:nth-child(1)',
          (el) => el.innerText
        );
      } catch (error) {
        hotelDict["score"] = " - ";
      }
      hotelsList.push(hotelDict);
    }

    hotelsList.map((hotel, index) => {
      if (!allTitles.includes(hotel.hotel)) {
        allTitles.push(hotel.hotel);
        const formattedPrice = hotel.price.toLocaleString("it-IT", {
          style: "currency",
          minimumFractionDigits: 2,
        });

        console.log(
          `<a href="${hotel.link}" target="_blank" class="resultA"><div class="resultHotelRow"><img src="${hotel.image}" class="hotelImg"><div class="resultHotelText"><span><b>${hotel.hotel}</b><br /><span style="color:#333">rating: <b>${hotel.score}</b></span></span><span style="color:#333">${formattedPrice}</span></div></div></a>`
        );
      }
    });

    const nextPageLink = await page.waitForSelector(
      'button[aria-label="pagina successiva"]'
    );

    if (nextPageLink && pageNum < maxPages - 1) {
      console.log(
        `<div class="resultRowScroll">Caricamento prossima pagina...</div>`
      );
      await page.evaluate((link) => link.click(), nextPageLink);
      console.log("Pulsante cliccato");
      await page.waitForTimeout(5000);
      //await page.waitForNavigation({ waitUntil: "domcontentloaded" });
    } else {
      //break;
    }
  }

  /*
  //estrazione dei risultati su file csv
  const csvData = hotelsList
    .map((hotel) => Object.values(hotel).join(","))
    .join("\n");
  fs.writeFileSync("hotels_list.csv", csvData);
  */

  console.log(`<div class="resultRowStop">Search finished</div>`);

  // Aspetto 2 secondi e chiudo tutto;
  await page.waitForTimeout(2000);
  await browser.close();
  console.clear();
}

module.exports = { startScrape };
