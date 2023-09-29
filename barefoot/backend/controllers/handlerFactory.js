const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const { generateJWT } = require("./jwt");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!req.params.id)
      next(new AppError("The id param was not supplied", 400));

    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) return next(new AppError("No document with that ID", 404));

    res.status(204).json({
      status: "success",
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // now the modified document will be returned
      runValidators: true, // does type checking as defined by the schema
    });

    if (!document)
      return next(new AppError("no document found with that ID", 404)); // if no tours are found with the given ID in the db

    res.status(200).json({
      status: "success",
      reqTime: req.requestTime,
      data: {
        document,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //creating the document
    const document = await Model.create(req.body);

    res.status(200).json({
      status: "success",
      reqTime: req.requestTime,
      data: {
        document,
      },
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    const document = await query;

    if (!document)
      return next(new AppError("no document found with that ID", 404)); // if no tours are found with the given ID in the db

    res.status(200).json({
      status: "success",
      results: document.length,
      reqTime: req.requestTime,
      data: {
        document,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.find();

    res.status(200).json({
      status: "success",
      results: document.length,
      reqTime: req.requestTime,
      data: {
        document,
      },
    });
  });
