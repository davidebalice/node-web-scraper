// Pause execution for the given number of milliseconds
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Escape scraped values before sending them to the browser as HTML
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

module.exports = { delay, escapeHtml };
