const path = require("path");
const express = require("express");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const app = express();

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/globalErrorController");

const cityRouter = require("./routes/cityRouter");

// creating middleware
app.use(express.json({ limit: "10kb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // to enable logging
}

// for preventing DoS
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});

app.use("/api", limiter);

// for security
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next(); // to make sure next middleware gets executed
});

//All the routes go here

app.use("/api", cityRouter);

// if the above routes don't get triggered, we can fire another middleware
// for catching errors
app.all("*", (req, res, next) => {
  //global error handler
  next(new AppError(`cannot find ${req.originalUrl} on this server!`, 404));
});

// error handling middleware
app.use(globalErrorHandler);

// server
module.exports = app;
