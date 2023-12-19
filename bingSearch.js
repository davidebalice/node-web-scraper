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

async function startSearch(typeSearch, mode, userId, password) {
  // Lancio il browser false=vedo l'anteprima, "new"= stealth;
  const browser = await puppeteer.launch({ headless: mode });
  const page = await browser.newPage();
  const fs = require("fs");
  // Array che conterrà le parole da ricercare;
  let randomWordsDesktop = [];
  let n;

  // Leggi il contenuto del file dizionario.txt
  fs.readFile("dizionario.txt", "utf8", function (err, data) {
    if (err) throw err;
    let words = data.split("\n");

    // A seconda del tipo di ricerca estraggo 40 o 25 parole, ne estraggo un po' di più così siamo sicuri dia rrivare al 100%;
    if (typeSearch == "desktop") {
      // Estrai 40 parole casuali per la ricerca desktop
      for (let i = 0; i < 40; i++) {
        randomWordsDesktop.push(
          words[Math.floor(Math.random() * words.length)]
        );
      }
    } else {
      // Estrai 25 parole casuali per la ricerca mobile
      for (let i = 0; i < 25; i++) {
        randomWordsDesktop.push(
          words[Math.floor(Math.random() * words.length)]
        );
      }
    }
  });

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
  console.log("Risolutore di ricerche Rewards. ");
  console.log("(C) 2023 By Davide Balice V. 1.03.");
  console.log(" ");
  console.log(" ");
  if (typeSearch == "desktop") {
    console.log("login dektop started, wait...");
  } else {
    console.log("login mobile started, wait...");
  }

  // Vado alla pagina di Login;
  await page.goto("https://login.live.com");

  // Controlla se sei già connesso
  let loggedIn = await page.$("#id_l");
  if (!loggedIn) {
    // Non sei connesso, quindi inserisci il tuo nome utente
    await page.type("#i0116", userId);
    // Attendi che la pagina successiva sia caricata
    await page.waitForTimeout(2000);
    // Fai clic sul pulsante Avanti
    await page.click("#idSIButton9");
    // Attendi che la pagina successiva sia caricata
    await page.waitForTimeout(2000);
    // Inserisci la tua password
    await page.type("#i0118", password);
    // Attendi che la pagina successiva sia caricata
    await page.waitForTimeout(2000);
    // Fai clic sul pulsante di accesso
    await page.click("#idSIButton9");
    // Attendi che la pagina successiva sia caricata
    await page.waitForTimeout(2000);
  }

  // Avviso che siamo pronti a partire con la ricerca;
  console.clear();
  console.log(" ");

  if (typeSearch == "desktop") {
    console.log("inzio ricerca desktop, attendere...");
  } else {
    console.log("inzio ricerca mobile, attendere...");
  }

  // Loop principale di ricerca;
  for (let word of randomWordsDesktop) {
    if (!shouldRun) {
      // Interrompi il ciclo se la variabile flag diventa falsa
      console.log("Execution stopped");
      break;
    }

    // Vai alla pagina principale di Bing
    await page.goto("https://www.bing.com");

    // Attendi che la casella di ricerca sia visibile;
    await page.waitForSelector("#sb_form_q");

    // Trova la casella di ricerca;
    await page.type("#sb_form_q", word);

    // aspetta 3 secondi così se ci sono i cookie li togliamo;
    await page.waitForTimeout(3000);

    try {
      // Cerca l'elemento sulla pagina per i cookie;
      const button = await page.$("#bnp_btn_accept");

      // Se l'elemento esiste (non è null), allora fa clic su di esso;
      if (button !== null) {
        await page.click("#bnp_btn_accept");
      }
    } catch (error) {
      // Se c'è un errore durante il clic sul pulsante, l'errore verrà catturato e registrato nella console;
      console.error("Errore durante il clic sul pulsante: ", error);
    }

    // Premi il tasto Invio per effettuare la ricerca;
    await page.keyboard.press("Enter");

    // Attendi 7 secondi + 3 per i cookie = 10
    await page.waitForTimeout(7000);

    console.clear();
    console.log(" ");
    if (typeSearch == "desktop") {
      console.log("ricerca desktop completata al " + n + "%");
      n = n + 2.5;
    } else {
      console.log("ricerca mobile completata al " + n + "%");
      n = n + 4;
    }
  }

  // Aspetto 2 secondi e chiudo tutto;
  await page.waitForTimeout(2000);
  await browser.close();
  console.clear();
}

async function stopSearch() {
  shouldRun = false;
}

module.exports = { startSearch, stopSearch };
