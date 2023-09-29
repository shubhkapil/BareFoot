const { Schema, model } = require("mongoose");

const touristDestinationSchema = new Schema({
  name: String,
  address: String,
  rating: Number,
  city: {
    type: Schema.Types.ObjectId,
    ref: "City",
  },
  geometry: [Number],
  timeSpent: Number,
});

module.exports = model("TouristDestination", touristDestinationSchema);
