const City = require("../../cityScraper/cityModel");
const TouristDestination = require("../../touristDestinationScraper/TouristDestinationModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const haversine = require("haversine-distance");

const AVG_SPEED = 15;

const capitalizeString = (str) => {
  let lsTemp = str.split(" ");

  for (let i = 0; i < lsTemp.length; i++) {
    ls = [];
    for (let j = 0; j < lsTemp[i].length; j++) {
      if (j == 0) {
        ls.push(lsTemp[i][j].toUpperCase());
      } else {
        ls.push(lsTemp[i][j].toLowerCase());
      }
    }

    lsTemp[i] = ls.join("");
  }

  return lsTemp.join(" ");
};

const generateMatrix = (touristDestinations) => {
  mat = [];

  for (let i = 0; i < touristDestinations.length; i++) {
    ls = [];
    for (let j = 0; j < touristDestinations.length; j++) ls.push(0);
    mat.push(ls);
  }

  for (let i = 0; i < touristDestinations.length; i++) {
    for (let j = i; j < touristDestinations.length; j++) {
      const distance = haversine(
        touristDestinations[i].geometry,
        touristDestinations[j].geometry
      );
      
      const timeTaken = distance / parseFloat(AVG_SPEED) / (60 * 60); //converting to hrs
        console.log(distance + " " + timeTaken);
      mat[i][j] = timeTaken;
      mat[j][i] = timeTaken;
    }
  }

  return mat;
};

const calculateBestRoute = (cmdList, route, adjList, timeRem, current) => {
  // console.log("test")
  route.push({
    touristDestination: cmdList[current].dest,
    timeTaken: 0,
  });

  let selectedIndex,
    maxValue = -1 * Number.MAX_VALUE;

  for (let i = 0; i < cmdList.length; i++) {
    if (i == current) cmdList[i].value = Number.MAX_VALUE;
    else if (i == 0 && current == 0) cmdList[i].value = Number.MAX_VALUE;
    else if (
      adjList[i][current] + adjList[0][i] + cmdList[i].dest.timeSpent >
      timeRem
    )
      cmdList[i].value = Number.MAX_VALUE;
    else if (cmdList[i].visited) cmdList[i].value = Number.MAX_VALUE;
    else {
      cmdList[i].value =
        0.3 * cmdList[i].dest.timeSpent - 0.7 * adjList[current][i];

      if (cmdList[i].value > maxValue) {
        selectedIndex = i;
        maxValue = cmdList[i].value;
      }
    }
  }

  if (!selectedIndex) return;

  route[route.length - 1].timeTaken = adjList[selectedIndex][current];
  timeRem -=
    adjList[selectedIndex][current] + cmdList[selectedIndex].dest.timeSpent;
  cmdList[selectedIndex].visited = true;

  return calculateBestRoute(cmdList, route, adjList, timeRem, selectedIndex);
};

//Need to send a cityname according to what is registered inside database
module.exports.getAllTouristDestinations = catchAsync(
  async (req, res, next) => {
    const cityName = await City.findOne({
      cityName: capitalizeString(req.params.cityName),
    });

    if (!cityName)
      return next(new AppError("No City Found with this name", 404));

    console.log(cityName);
    const document = await TouristDestination.find({
      city: cityName._id,
    });

    res.status(200).json({
      status: "success",
      results: document.length,
      reqTime: req.requestTime,
      data: {
        document,
      },
    });
  }
);

module.exports.generateBestTour = catchAsync(async (req, res, next) => {
  const cityName = await City.findOne({
    cityName: capitalizeString(req.params.cityName),
  });

  if (!cityName) return next(new AppError("No City Found with this name", 404));

  const timeLimit = parseFloat(req.params.timeLimit);

  const long = parseFloat(req.params.long);
  const lat = parseFloat(req.params.lat);

  const touristDestinations = await TouristDestination.find({
    city: cityName._id,
  });

  touristDestinations.unshift({
    name: "Your Location",
    geometry: [long, lat],
    rating: 0,
  });

  const adjMat = generateMatrix(touristDestinations);

  route = [];
  const cmdList = [];
  for (let i = 0; i < touristDestinations.length; i++) {
    cmdList.push({
      dest: touristDestinations[i],
      visited: false,
      value: 0,
    });
  }

  calculateBestRoute(cmdList, route, adjMat, timeLimit, 0);

  res.status(200).json({
    status: "success",
    results: route.length,
    reqTime: req.requestTime,
    data: {
      route,
    },
  });
});
