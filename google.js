const puppeteer = require("puppeteer");
const WebSocket = require("ws");
const wsPort = 8002;
const cheerio = require("cheerio");

const wss = new WebSocket.Server({ port: wsPort });
wss.on("connection", (ws) => {
  const originalConsoleLog = console.log;

  console.log = function (...args) {
    const message = args.join(" ");
    originalConsoleLog.apply(console, args);
    // Invia i log al client HTML per visualizzazione sulla pagina
    ws.send(message);
  };
});

const searchGoogle = async (key) => {
  const allTitles = [];
  const scrollLimit = 15000;
  let scrollY = 0;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let currentHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36"
  );
  await page.setDefaultNavigationTimeout(30000);
  await page.goto(`https://www.google.com/search?q=${key}&gl=it&hl=it`);

  console.clear();
  console.log("Node Google search scraper by Davide Balice");
  console.log(`<div class="resultRowScroll">Start search...</div>`);

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
        if (snippets[i] !== undefined) {
          console.log(
            `<div class="resultRow"><a href="${links[i]}" target="_blank" class="resultA"><b style="color:#333">${titles[i]}</b><br /><span style="color:#333">${snippets[i]}</span></a></div>`
          );
        } else {
          console.log(
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
      console.log(`<div class="resultRowScroll">Scroll page...</div>`);

    await page.waitForTimeout(3000);
  }
  await page.waitForTimeout(1000);
  console.log(`<div class="resultRowStop">Search finished</div>`);
};

module.exports = { searchGoogle };
