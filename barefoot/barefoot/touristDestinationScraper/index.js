require("dotenv").config();

const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const City = require("../cityScraper/cityModel");
const TouristDestination = require("./TouristDestinationModel");

const SEARCHURL = "https://www.bing.com/search?q=";

const sleep = async (miliseconds) => {
  return new Promise((res, rej) => {
    setTimeout(res, miliseconds);
  });
};

//This will hold the execution thread using sleep() for 3 to 7 (random) miliseconds
const waitRandomTime = async () => {
  const miliseconds = Math.trunc(Math.random() * (7 - 3 + 1) * 1000 + 3000); //generates a random number between 3 to 7
  await sleep(miliseconds);
};

const wikipediaScraper = async (city, page) => {
  try {
    console.log(`Finding Information for ${city.cityName} ${city.state}`)
    // let searchQuery = ` https://en.wikipedia.org/wiki/Category:Tourist_attractions_in_${city.cityName}`;
    let searchQuery = `category tourist attractions of ${city.cityName} ${city.state} wikipedia`;
   
    searchQuery = SEARCHURL + searchQuery.split(" ").join("+");

    console.log(searchQuery);

    await page.goto(searchQuery);

    await waitRandomTime();

    let html = await page.content();
    let $ = cheerio.load(html);

    let cityUrl = $($("ol#b_results > li.b_algo h2 a")[0]).attr("href");

    console.log(cityUrl);

    await page.goto(cityUrl);

    await waitRandomTime();

    html = await page.content();
    $ = cheerio.load(html);

    const destinations = $(
      "#mw-pages .mw-category.mw-category-columns .mw-category-group ul li"
    );
    for (let i = 0; i < destinations.length; i++) {
      const name = $(destinations[i]).text().trim();

      const oldDestination = await TouristDestination.findOne({
        name,
        city: city._id,
      });

      if (oldDestination) {
        console.log(
          "[INFO] The tourist destination has already been registered..."
        );
        continue;
      }

      const destination = new TouristDestination({
        name,
        city,
        timeSpent: Math.trunc(Math.random() * 2) + 1,
      });

      await destination.save();
      console.log("[INFO] The destination has been saved...");
    }
  } catch (err) {
    console.log("[WIKI SCRAPER ERROR] ", err);
  }
};

const main = async () => {
  await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
  console.log("[INFO] Database is now connected...");

  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();

  const cities = await City.find();

  for (let i = 0 ; i < cities.length ; i++) {
    await wikipediaScraper (cities[i] , page);
  }

  console.log(
    "[INFO] All the tourist deestinations have been scraaped successfully"
  );

  await browser.close();
  mongoose.connection.close();
};

main();
