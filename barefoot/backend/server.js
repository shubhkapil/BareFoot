require("dotenv").config({ path: `${__dirname}/.env` });
const mongoose = require("mongoose");

// global synchronous error handler
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("unhandled EXCEPTION 💥 shutting down");
  process.exit(1);
});

const connectionURL = process.env.DB_URL;

mongoose
  .connect(connectionURL, {
    useNewUrlParser: true,
  })
  .then((con) => {
    console.log("[INFO] DB connection successful");
  })
  .catch((err) => console.log("ERROR 💥", err.message));

const app = require("./app");

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`[INFO] running at port ${port}`);
});

// global unhandledRejection catcher (async code exception handler)
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("unhandled REJECTION 💥 shutting down");
  server.close(() => {
    process.exit(1);
  });
});
