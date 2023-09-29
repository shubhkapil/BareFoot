const express = require("express");
const router = express.Router();
const {
  getAllTouristDestinations,
  generateBestTour,
} = require("../controllers/index");

router.route("/:cityName").get(getAllTouristDestinations);
router.route("/:cityName/:timeLimit/:long/:lat").get(generateBestTour);

module.exports = router;
