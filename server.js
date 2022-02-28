const express = require("express");
const dotenv = require("dotenv");
var path = require("path");
var rfs = require("rotating-file-stream");
const connectDB = require("./config/db");
const colors = require("colors");
const errorHandler = require("./middleware/error");
var morgan = require("morgan");
const logger = require("./middleware/logger");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

// Router oruulj ireh
const categoriesRoutes = require("./routes/categories");
const booksRoutes = require("./routes/books");
const usersRoutes = require("./routes/users");
const commentsRoutes = require("./routes/comments");
const injectDb = require("./middleware/injectDb");
const cors = require("cors");
var cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");

const fileUpload = require("express-fileupload");

// App-iin tohirgoog process.env ruu achaalah
dotenv.config({ path: "./config/config.env" });

const db = require("./config/db-mysql");

const app = express();

connectDB();

// create a rotating write stream
var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});

// cors tohirgoo
var whitelist = ["http://localhost:3000"];
var corsOptions = {
  origin: function (origin, callback) {
    if (origin === undefined || whitelist.indexOf(origin) !== -1) {
      //bolno
      callback(null, true);
    } else {
      //bolohgui
      callback(new Error("Not allowed by CORS"));
    }
  },
  allowedHeaders: "Authorization, Set-Cookie, Content-Type",
  methods: "GET, POST, PUT, DELETE",
  credentials: true,
};

// index.html-ийг public хавтас дотроос ол гэсэн тохиргоо
app.use(express.static(path.join(__dirname, "public")));

// Express rate limit: Дуудалтын тоог хчзгаарлана

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "15 Минутанд 3 удаа л хандах боломжтой",
  // standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  // legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// http parametr pollution халдлагын эсрэг books?name=aa&name=bbb ---> name="bbb"
app.use(hpp());
// Body parser
app.use(express.json());
app.use(cookieParser());
app.use(logger);
app.use(cors(corsOptions));
app.use(helmet());
app.use(xss());
// to  remove data, use
app.use(mongoSanitize());
app.use(fileUpload());
// app ruu middleqare-iig holbohdoo USE gedgiig hereglene
app.use(injectDb(db));
app.use(morgan("combined", { stream: accessLogStream }));
// use gedgiig ahsiglan turul buriin middleware-uudiig holboj uguh bolomjtoi
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/books", booksRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/comments", commentsRoutes);
app.use(errorHandler);

// 1bagsh olon hicheel zaaaj boldog
// 1 ba olon gesen holboosoor  hiij bna
db.user.belongsToMany(db.book, { through: db.comment });
db.book.belongsToMany(db.user, { through: db.comment });

db.user.hasMany(db.comment);
db.comment.belongsTo(db.user);

db.book.hasMany(db.comment);
db.comment.belongsTo(db.book);

// neg nom neg category-d
// neg category-d olon nom baij bolno gesen tohirgoonii heseg
db.category.hasMany(db.book);
db.book.belongsTo(db.category);

//mysql-tei sync hiij bna
db.sequelize
  .sync()
  .then((result) => {
    console.log("sync hiigdlee");
  })
  .catch((err) => console.log(err));

app.listen(
  process.env.PORT,
  console.log(`Express server ${process.env.PORT} deer aslaa...........`)
);
