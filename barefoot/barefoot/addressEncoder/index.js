/**
 * #b_context .bm_details_overlay
 */

require("dotenv").config();

const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const request = require("request-promise");

const TouristDestination = require("../touristDestinationScraper/TouristDestinationModel");
const City = require("../cityScraper/cityModel");

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

const addressAndGeoStampGenerator = async (touristDestination, page) => {
  try {

    // console.log(touristDestination);
    const city = await City.findById(touristDestination.city);
    // console.log(city);

    let searchString = `${SEARCHURL}${touristDestination.name
      .split(" ")
      .join("+")}+${city.cityName.split(" ").join("+")}+address`;

    await page.goto(searchString);

    await waitRandomTime();

    const html = await page.content();
    const $ = cheerio.load(html);

    // let address = $("#b_context .bm_details_overlay").text().trim();
    let address = $("[class = 'iconDataList'] > span > a ").text().trim();
    // if (!address) address = `${touristDestination.name} ${city.cityName}`;
    if(!address)
    {
      let s = touristDestination.name.split(" ").join("+")
      const url = "https://www.google.com/search?q="+ s + "&sca_esv=6c300049f602ecc4&sca_upv=1&rlz=1C1ONGR_enIN1061IN1061&biw=1536&bih=730&sxsrf=ACQVn0-4eNyiHG9679DCo5QW-VxO7_giiw%3A1712257860456&ei=RPsOZovBG9iQ4-EPtZ-IkA4&gs_ssp=eJzj4tZP1zcsySgwS8vNMWC0UjWoME5KTDU0tUhOSjWzNDCyTLIyqDBLMkw1STJMNjE2MbM0TTHwkkwqTc9JVSjKT85WKEgsylZISsxLT8zJL0oFAKFGGHs&oq=Bugle+Rock+Park+b&gs_lp=Egxnd3Mtd2l6LXNlcnAiEUJ1Z2xlIFJvY2sgUGFyayBiKgIIADIQEC4YgAQYFBiHAhjHARivATIGEAAYFhgeMgYQABgWGB4yBhAAGBYYHjILEAAYgAQYigUYhgMyHxAuGIAEGBQYhwIYxwEYrwEYlwUY3AQY3gQY4ATYAQNIqQ5QhAVY0QhwAXgBkAEAmAGkAaABtAKqAQMwLjK4AQHIAQD4AQGYAgOgAskCwgIKEAAYRxjWBBiwA8ICDRAAGIAEGIoFGEMYsAPCAg4QABjkAhjWBBiwA9gBAcICExAuGIAEGIoFGEMYyAMYsAPYAQLCAhkQLhiABBiKBRhDGMcBGK8BGMgDGLAD2AECwgIKEAAYgAQYigUYQ8ICBRAAGIAEmAMAiAYBkAYTugYGCAEQARgJugYGCAIQARgIugYGCAMQARgUkgcDMS4yoAePDw&sclient=gws-wiz-serp#ip=1";
      
      await page.goto(url);

      await waitRandomTime();
  
      const html = await page.content();

      const $ = cheerio.load(html);

      address = $("[class = 'LrzXr']").text();
    }

    if (!address) address = `${touristDestination.name} ${city.cityName}`;

    touristDestination.address = address;
    console.log(address)

    if (touristDestination.geometry.length) {
      console.log("[INFO] already geo-encoded skipping...");
      return;
    }

    const requestUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${process.env.ACCESS_TOKEN}`;

    const response = await request.get(requestUrl);

    const geometry = JSON.parse(response).features[0].geometry.coordinates;

    touristDestination.geometry = geometry;

    await touristDestination.save();

    console.log(`[INFO] ${touristDestination.name} geo-encoded`);
  } catch (err) {
    console.log("[ADD-GEO FUNC ERROR] ", err);
  }
};

const main = async () => {
  await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
  console.log("[INFO] Databse Connected");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const touristDestinations = await TouristDestination.find();

  for (let i = 0; i < touristDestinations.length; i++) {
    await addressAndGeoStampGenerator(touristDestinations[i], page);
  }

  await browser.close();
  await mongoose.connection.close();
};

main();
