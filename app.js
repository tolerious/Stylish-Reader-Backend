var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/user");
var articleRouter = require("./routes/article");
var wordRouter = require("./routes/word");
var logicRouter = require("./routes/logic");
const loggerMiddleware = require("./middleware/logger");
const userSettingRouter = require("./routes/userSetting");
const wordGroupRouter = require("./routes/wordGroup");
const smsCodeRouter = require("./routes/smsCode");
const auth = require("./middleware/auth");
const cors = require("cors");
var app = express();

mongoose.connect(process.env.DB_URL);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(loggerMiddleware);
app.use(auth);
app.use("/", indexRouter);
app.use("/user", usersRouter);
app.use("/article", articleRouter);
app.use("/word", wordRouter);
app.use("/sms", smsCodeRouter);
app.use("/logic", logicRouter);
app.use("/wordgroup", wordGroupRouter);
app.use("/usersetting", userSettingRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
