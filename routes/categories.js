const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

//buh categoriig controller-ees import hiij bna
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/categories");

//Arga 1 !!!!!!!!

// "/api/v1/categories/:id/books"
const { getCategoryBooks } = require("../controller/books");
router.route("/:categoryId/books").get(getCategoryBooks);

// //Arga 2 !!!!!!!!!!!!
// const booksRouter = require("./books");
// router.use("/:categoryId/books", booksRouter);

// "/api/v1/categories"
router
  .route("/")
  .get(getCategories)
  .post(protect, authorize("admin"), createCategory);

router
  .route("/:id")
  .get(getCategory)
  .put(protect, authorize("admin", "operator"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

// export hiij bna
module.exports = router;
