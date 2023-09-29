const { Schema, model } = require("mongoose");

const citySchema = new Schema({
  cityName: String,
  state: String,
});

module.exports = model("City", citySchema);
