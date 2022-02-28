const Category = require("../models/Category");
const MyError = require("../utils/myError");
// const asyncHandler = require("../middleware/asyncHandler");
const asyncHandler = require("express-async-handler");

const paginate = require("../utils/paginate");

exports.getCategories = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  //Pagination
  const pagination = await paginate(page, limit, Category);

  const categories = await Category.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: categories,
    pagination,
  });
});

exports.getCategory = asyncHandler(async (req, res, next) => {
  req.db.teacher.create({
    id: 2,
    name: "Beka",
    phone: "88403124",
    password: "123456",
  });

  req.db.course.create({
    id: 1,
    name: "C++ algorithm",
    price: "33000",
    tailbar: "programming course",
  });

  const category = await Category.findById(req.params.id).populate("books");

  if (!category) {
    //aldaa tsatsaj bna
    throw new MyError(req.params.id + " ID-тэй gategory байхгүй", 400);
  }

  // category.name += "-";
  // category.save(function (err) {
  //   if (err) console.log("error : ", err);
  //   console.log("saved...");
  // });

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  console.log("data: ", req.body);
  const category = await Category.create(req.body);

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    throw new MyError(req.params.id + " ID-тэй gategory байхгүй", 400);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  console.log("removing .....");
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new MyError(req.params.id + " ID-тэй gategory байхгүй", 400);
  }
  category.remove();

  res.status(200).json({
    success: true,
    data: category,
  });
});
