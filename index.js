require('dotenv').config();
const WebScraper = require("./src/Scraper.js");

(async () => {
    const scraper = new WebScraper();

    await scraper.init();
    await scraper.run();
})();