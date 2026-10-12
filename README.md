# Node Web Scraper

A real-time web scraper built with Node.js, Puppeteer and WebSocket.
It includes four example scrapers (Google, Bing, Amazon and Booking.com): the scraping runs on the server and every result is streamed live to the browser through a WebSocket connection.

> This project is for study and demonstration purposes only. No data is stored.

**Live demo:** https://web-scraper.davidebalice.dev

![Screenshot](https://www.aroundweb.it/screenshot/scraper.jpg)

## Features

- Four scrapers: Google search, Bing search, Amazon products and Booking.com hotels
- Results streamed to the client in real time over WebSocket
- Headless Chrome automation with Puppeteer
- Rate limiting on search endpoints
- CORS restricted to allowed origins
- Server-side rendered pages with EJS

## Tech stack

- [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/)
- [Puppeteer](https://pptr.dev/)
- [Cheerio](https://cheerio.js.org/)
- [ws](https://github.com/websockets/ws)
- [EJS](https://ejs.co/)

## Getting started

### Requirements

- Node.js 20 or later
- npm

### Installation

```bash
git clone https://github.com/davidebalice/node-web-scraper.git
cd node-web-scraper
npm install
```

Puppeteer downloads a compatible version of Chrome automatically during installation.

### Configuration

The WebSocket URL used by the frontend is set in `config.js`. For local development, use:

```js
const config = {
  serverUrl: "ws://localhost:8002",
};
```

### Run

| Command       | Description                                 |
| ------------- | ------------------------------------------- |
| `npm start`   | Start the server on `http://localhost:8002` |
| `npm run dev` | Start the server and restart on changes     |

## Project structure

```
├── index.js        # Express server and WebSocket setup
├── routes.js       # Pages and search endpoints
├── google.js       # Google scraper
├── bing.js         # Bing scraper
├── amazon.js       # Amazon scraper
├── bookingcom.js   # Booking.com scraper
├── utils.js        # Shared helpers
├── views/          # EJS templates
└── public/         # Static assets
```

## Notes

Websites change their markup often, so selectors may need to be updated over time.
Always respect the terms of service of the websites you scrape.

## Author

**Davide Balice** – [davidebalice.dev](https://www.davidebalice.dev)
