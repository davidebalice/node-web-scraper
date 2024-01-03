const puppeteer = require("puppeteer");
const express = require("express");
const WebSocket = require("ws");
const app = express();
const wsPort = 8001;

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

async function startSearch(typeSearch, mode, key) {
  // Lancio il browser false=vedo l'anteprima, "new"= stealth;
  const browser = await puppeteer.launch({ headless: mode });
  const page = await browser.newPage();
  const fs = require("fs");
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
  console.log(" ");
  console.log("Bing search. ");
  console.log("(C) 2023 By Davide Balice V. 1.03.");
  console.log(" ");
  console.log(" ");

  // Avviso che siamo pronti a partire con la ricerca;
  console.clear();
  console.log(" ");

  if (typeSearch == "desktop") {
    console.log("inizio ricerca desktop, attendere...");
  } else {
    console.log("inizio ricerca mobile, attendere...");
  }

  await page.setDefaultNavigationTimeout(60000);
  await page.goto(`https://bing.com/search?q=${key}&setmkt=en-WW&setlang=en`);
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
    console.log(`Risultato ${index + 1}:`);
    console.log("Link:", item.link);
    console.log("Titolo:", item.title);
    console.log("Snippet:", item.snippet);
    console.log("\n-----------------------------\n");
  });

  // Aspetto 2 secondi e chiudo tutto;
  await page.waitForTimeout(2000);
  await browser.close();
  //console.clear();
}

async function stopSearch() {
  shouldRun = false;
}

module.exports = { startSearch, stopSearch };
