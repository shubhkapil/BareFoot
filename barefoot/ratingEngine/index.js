require("dotenv").config();

const SEARCHURL = "https://www.bing.com/search?q=";

const mongoose = require("mongoose");
const request = require("request-promise");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const City = require("../cityScraper/cityModel");
const TouristDestination = require("../touristDestinationScraper/TouristDestinationModel");

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

const ratingGenerator = async (touristDestination, page) => {
  try {
    if (touristDestination.rating) {
      console.log(`[INFO] ${touristDestination.name} skipped {already rated}`);
      return;
    }

    let searchQuery = `${touristDestination.name} ${touristDestination.city.cityName} all you need to know rating tripadvisor`;
    searchQuery = `${SEARCHURL}${searchQuery.split(" ").join("+")}`;

    await page.goto(searchQuery);
    await waitRandomTime();

    let html = await page.content();
    let $ = cheerio.load(html);

    let ratingUrl = $($("ol#b_results > li.b_algo h2 a")[0]).attr("href");

    await page.goto(ratingUrl);
    await waitRandomTime();

    html = await page.content();
    $ = cheerio.load(html);

    let rating;

    try {
      rating = parseFloat(
        $(".IuzAT.e .aVUMb:nth-child(1) .kUaIL:nth-child(1) a div")
          .attr("aria-label")
          .trim()
          .split(" ")[0]
      );
    } catch (err) {
      rating = Math.trunc(Math.random() * (6 - 5)); //generating a random place holder
    }

    touristDestination.rating = rating;

    await touristDestination.save();
    console.log(`[INFO] ${touristDestination.name} has been rated`);
  } catch (err) {
    console.log("[RATING ENGINE ERROR]: ", err);
  }
};

const main = async () => {
  await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
  console.log("[INFO] Database Connected");

  const browser = await puppeteer.launch({ headless: true });

  const page = await browser.newPage();

  const touristDestinations = await TouristDestination.find().populate("city");

  for (let i = 0; i < touristDestinations.length; i++) {
    await ratingGenerator (touristDestinations[i] , page);
  }

  console.log(
    "[INFO] Ratings has been gathered for all tourist destinations..."
  );

  await browser.close();
  await mongoose.connection.close();
};

main();
