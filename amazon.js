const puppeteer = require("puppeteer");
const express = require("express");
const WebSocket = require("ws");
const wsPort = 8004;
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
  console.log("Amazon.it scraping By Davide Balice.");
  console.log(" ");
  console.log(" ");
  if (typeSearch == "desktop") {
    console.log("login dektop started, wait...");
  } else {
    console.log("login mobile started, wait...");
  }

  // Vado alla pagina di Login;
  

  // Avviso che siamo pronti a partire con la ricerca;
  console.clear();
  console.log(" ");

  if (typeSearch == "desktop") {
    console.log("inzio ricerca desktop, attendere...");
  } else {
    console.log("inzio ricerca mobile, attendere...");
  }

  page.setDefaultNavigationTimeout(2 * 60 * 1000);

const key = "videogiochi";


    // navigate to a website and set the viewport
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`https://www.amazon.it/s?k=${key}&__mk_it_IT=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=L8FRLM64UZ0S&sprefix=${key}%2Caps%2C125&ref=nb_sb_noss_1`, {
      timeout: 3000000
    });

    // search and wait the product list
    await page.type('#twotabsearchtextbox', 'iphone x 64gb');
    await page.click('input.nav-input');
    await page.waitForSelector('.s-result-item');

    // create a screenshots
    await page.screenshot({path: 'search-iphone-x.png'});

    const products = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.s-result-item'));
      return links
        .map(link => {
          const nameElement = link.querySelector('.a-size-base-plus.a-color-base.a-text-normal');
          const priceElement = link.querySelector('.a-price-whole');
          const imageElement = link.querySelector('.s-image');
    
          if (nameElement && priceElement && imageElement) {
            return {
              name: nameElement.textContent.trim(),
              url: link.querySelector('.a-link-normal.a-text-normal').href,
              image: imageElement.src,
              price: parseFloat(priceElement.textContent.replace(/[,.]/g, m => (m === ',' ? '.' : ''))),
            };
          } else {
            return null;
          }
        })
        .filter(product => product !== null)
        .slice(0, 20);
    });
    

    await products.forEach(product => {
      console.log(`<div style='display:flex;border:1px solid #ddd;padding:10px;gap:10px;align:items:center'><img src='${product.image}' width='100'></div>`);
      console.log("Name:", product.name);
      console.log("URL:", product.url);
      console.log(`<img src='${product.image}' width='200'>`);
      console.log("Price:", product.price);
      console.log("</div>");
      console.log("-----------------------");
    });
/*
    console.log(products.sort((a, b) => {
      return a.price - b.price;
    }));
*/
    // close the browser
    await browser.close();




  const htmlContent = await page.evaluate(
    () => document.documentElement.outerHTML
  );

  //console.log(htmlContent);

  console.clear();
}

async function stopSearch() {
  shouldRun = false;
}

module.exports = { startScrape, stopSearch };
