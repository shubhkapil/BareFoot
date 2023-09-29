require("dotenv").config(); //to load the env files

const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const City = require("./cityModel");

const CITYURL =
  "https://en.wikipedia.org/wiki/List_of_cities_in_India_by_population";

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

//This will save the cities into the database
const saveCities = async (cities) => {
  for (let i = 0; i < cities.length; i++) {
    const oldEntry = await City.findOne({
      cityName: cities[i].cityName,
      state: cities[i].state,
    });

    if (!cities[i].cityName || !cities[i].state) continue;

    if (oldEntry) {
      console.log("[INFO] City has already been scraped, Moving on...");
      continue;
    }

    const city = new City({
      cityName: cities[i].cityName,
      state: cities[i].state,
    });

    await city.save();
    console.log("[INFO] New City Saved");
  }
};

//This will scrape cities and state list from wikipedia URL described earlier
const scrapeCities = async (page, cities) => {
  try {
    await page.goto(CITYURL);

    const html = await page.content();
    const $ = cheerio.load(html);

    await waitRandomTime();

    const citiesRes = $("table.wikitable > tbody > tr");

    for (let i = 0; i < citiesRes.length; i++) {
      let city = $(citiesRes[i]).find("td:nth-child(2)").text().trim();
      let state = $(citiesRes[i]).find("td:nth-child(5)").text().trim();

      if (city.indexOf("[") !== -1) city = city.slice(0, city.length - 4);

      cities.push({ cityName: city, state });
    }
  } catch (err) {
    console.log("[CITY SCRAPER ERROR]", err);
  }
};

const main = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
    console.log("[INFO] The Database has been connected");

    const browser = await puppeteer.launch({ headless: true }); //!change this
    const page = await browser.newPage();

    const cities = [];

    await scrapeCities(page, cities);

    await browser.close();

    await saveCities(cities);

    mongoose.connection.close(); //closing the connection
  } catch (err) {
    console.log("[MAIN ERROR] ", err);
  }
};

main();
