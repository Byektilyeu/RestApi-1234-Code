const mongoose = require("mongoose");
const { token } = require("morgan");
const { transliterate, slugify } = require("transliteration");

const BookScheme = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "номын нэрийг оруулна уу"],
      unique: true,
      trim: true,
      maxlength: [250, "Номын нэрийн урт дээд тал нь 250 тэмдэгт байх ёстой"],
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    author: {
      type: String,
      required: [true, "Зохиогчийн нэрийг оруулна уу"],
      trim: true,
      maxlength: [
        20,
        "Зогиогчийн нэрийн урт дээд тал нь 20 тэмдэгт байх ёстой",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "rating хамгийн багадаа 1 байх ёстой"],
      max: [10, "rating хамгийн ихдээ 10 байх ёстой"],
    },
    price: {
      type: Number,
      required: [true, "Номын үнийг оруулна уу"],
      min: [500, "Номын үнэ хамгийн багадаа 500 байх ёстой"],
    },
    balance: {
      type: Number,
    },
    content: {
      type: String,
      required: [true, "Номын тайлбарыг оруулна уу?"],
      trim: true,
      maxlength: [5000, "Номын нэрийн урт дээд тал нь 20 тэмдэгт байх ёстой"],
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    available: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },

    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    updateUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

BookScheme.statics.computeCategoryAveragePrice = async function (catId) {
  const obj = await this.aggregate([
    { $match: { category: catId } },
    { $group: { _id: "$category", avgPrice: { $avg: "$price" } } },
  ]);
  console.log(obj);

  let avgPrice = null;

  if (obj.length > 0) {
    avgPrice = obj[0].avgPrice;
  }

  await this.model("Category").findByIdAndUpdate(catId, {
    averagePrice: avgPrice,
  });

  return obj;
};

BookScheme.post("save", function () {
  this.constructor.computeCategoryAveragePrice(this.category);
});

BookScheme.pre("remove", function () {
  this.constructor.computeCategoryAveragePrice(this.category);
});

BookScheme.virtual("zohiogch").get(function () {
  // this.author
  if (!this.author) return " ";
  let tokens = this.author.split(" ");
  if (tokens.length === 1) tokens = this.author.split(".");
  if (tokens.length === 2) return tokens[1];

  return token[0];
});

module.exports = mongoose.model("Book", BookScheme);
