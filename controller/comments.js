const MyError = require("../utils/myError");
// const asyncHandler = require("../middleware/asyncHandler");
const asyncHandler = require("express-async-handler");

const paginateSequelize = require("../utils/paginate-sequelize");

exports.createComment = asyncHandler(async (req, res, next) => {
  const comment = await req.db.comment.create(req.body);

  res.status(200).json({
    success: true,
    data: comment,
  });
});

// /api/v1/comments/:id
exports.updateComment = asyncHandler(async (req, res, next) => {
  // mongoose-iin findById = tei adilhan
  let comment = await req.db.comment.findByPk(req.params.id);

  if (!comment) {
    throw new MyError(`${req.params.id} id тэй коммент олдсонгүй`, 400);
  }

  comment = await comment.update(req.body);

  res.status(200).json({
    success: true,
    data: comment,
  });
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
  // mongoose-iin findById = tei adilhan
  let comment = await req.db.comment.findByPk(req.params.id);

  if (!comment) {
    throw new MyError(`${req.params.id} id тэй коммент олдсонгүй`, 400);
  }

  //mogoose-iin remove esvel delete-tei adilhan
  comment = await comment.destroy(req.body);

  res.status(200).json({
    success: true,
    data: comment,
  });
});

exports.getComment = asyncHandler(async (req, res, next) => {
  // mongoose-iin findById = tei adilhan
  let comment = await req.db.comment.findByPk(req.params.id);

  if (!comment) {
    throw new MyError(`${req.params.id} id тэй коммент олдсонгүй`, 400);
  }

  // doorh sequelize ni config dotorh db-mysql file dahi db tei holboj ugsun sequelize

  // mysql-iig query bishij data avj bna
  const [result] = await req.db.sequelize.query(
    "SELECT u.name, c.comment, c.createdAt  FROM `user` u left join comment c on u.id = c.userId where c.comment like '%холтой%"
  );

  res.status(200).json({
    success: true,
    result,
    meta,
    //dood taliin code magiz methos ashiglasan jishee
    user: await comment.getUser(),
    book: await comment.getBook(),
    // magic geed sequelize-iin tusgai function baidag. Ene ni hasmany, belongsTo zergees, belen functionuudiig harah bolomj olgodog
    magic: Object.keys(req.db.comment.prototype),
    data: comment,
  });
});

exports.getComments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  let select = req.query.select;

  if (select) {
    select = select.split(" ");
  }

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  //Pagination
  const pagination = await paginateSequelize(page, limit, req.db.comment);

  let query = { offset: pagination.start - 1, limit: limit };

  if (req.query) {
    query.where = req.query;
  }

  if (select) {
    query.attributes = select;
  }

  if (sort) {
    query.order = sort
      .split(" ")
      .map((el) => [
        el.charAt(0) === "-" ? el.substring(1) : el,
        el.charAt(0) === "-" ? "DESC" : "ASC",
      ]);
  }

  const comments = await req.db.comment.findAll(query);

  res.status(200).json({
    success: true,
    // array: select,
    // data: query,
    data: comments,
    pagination,
  });
});

//LAZY arga
exports.getUserComments = asyncHandler(async (req, res, next) => {
  // mongoose-iin findById = tei adilhan
  let user = await req.db.user.findByPk(req.params.id);

  if (!user) {
    throw new MyError(`${req.params.id} id тэй хэрэглэгч олдсонгүй`, 400);
  }

  const comments = await user.getComments();

  res.status(200).json({
    success: true,
    user,
    comments,
  });
});

//EAGER arga
exports.getBookComments = asyncHandler(async (req, res, next) => {
  // mongoose-iin findById = tei adilhan
  let book = await req.db.book.findByPk(req.params.id, {
    include: req.db.comment,
  });

  if (!book) {
    throw new MyError(`${req.params.id} id тэй хэрэглэгч олдсонгүй`, 400);
  }

  const comments = await book.getComments();
  res.status(200).json({
    success: true,
    book,
  });
});
