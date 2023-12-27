const puppeteer = require("puppeteer");
const express = require("express");
const WebSocket = require("ws");
const wsPort = 8002;
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

/*
const searchGoogle = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36"
  );

  await page.goto("https://www.google.com/search?q=prova+ricerca&gl=it&hl=it");

  // Scroll down to the bottom of the page to load more results
  await autoScroll(page);

  const html = await page.content();
  const $ = cheerio.load(html);

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

    console.log("<b>titles[i]</b>");
    console.log(titles[i]);
  }

  await browser.close();
};

// Function to simulate scrolling in Puppeteer
const autoScroll = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 100;
      const maxScrollAttempts = 100;

      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight || maxScrollAttempts <= 0) {
          clearInterval(timer);
          resolve();
        }
        maxScrollAttempts--;
      }, 100);
    });
  });
};
*/

const searchGoogle = async () => {
  const allTitles = [];
  const scrollLimit = 15000;
  let scrollY = 0;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let currentHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36"
  );
  await page.goto("https://www.google.com/search?q=prova+ricerca&gl=it&hl=it");

  while (scrollY < scrollLimit) {
    console.log("ciclo:" + scrollY + " " + scrollLimit);

    const html = await page.content();
    // console.log(html);
    const $ = cheerio.load(html);

    currentHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log("currentHeight:" + currentHeight);

    await page.waitForSelector("#L2AGLb");

    // Ora clicchiamo sul pulsante
    await page.evaluate(() => {
      // Selezioniamo il pulsante tramite l'ID
      const button = document.getElementById("L2AGLb");

      // Clicchiamo sul pulsante
      if (button) {
        button.click();
      } else {
        console.error("Pulsante non trovato");
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
        console.log("<b>titles[i]</b>");
        console.log(titles[i]);
        allTitles.push(titles[i]);
      }
    }

    await page.evaluate(() => {
      window.scrollTo(0, window.document.body.scrollHeight);
    });

    //await page.keyboard.press("PageDown");
    await page.waitForTimeout(2000);

    const newHeight = await page.evaluate(
      () => window.document.body.scrollHeight
    );
    console.log("Nuova altezza della pagina:", newHeight);

    // Update scroll position
    scrollY = scrollY + 4000;
    /*
    scrollY = await page.evaluate(() => {
      return document.body.scrollHeight;
    });
*/
    console.log("scrollY" + scrollY);
    console.log("scrollLimit" + scrollLimit);

    await page.waitForTimeout(3000);
  }
};

module.exports = { searchGoogle };
