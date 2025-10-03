const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/apis/users");
const excerptRoutes = require("./routes/apis/excerpt");
const accountRoutes = require("./routes/apis/account");
const casterRoutes = require("./routes/apis/caster");
const onewayRoutes = require("./routes/apis/oneway");
const markdownRoutes = require("./routes/apis/markdown");
const labRoutes = require("./routes/apis/lab");

const authRoutes = require("./routes/apis/auth");
const destinationRoutes = require("./routes/apis/destination");
const messageRoutes = require("./routes/apis/message");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/excerpt", excerptRoutes);
app.use("/account", accountRoutes);
app.use("/caster", casterRoutes);
app.use("/auth", authRoutes);
app.use("/oneway", onewayRoutes);
app.use("/destination", destinationRoutes);
app.use("/markdown", markdownRoutes);
app.use("/lab", labRoutes);
app.use("/message", messageRoutes);

const mongoose = require("mongoose");
// MongoDB 连接 URI
const uri = require("./config/index").mongoURI;

main()
  .catch((err) => console.log(err))
  .finally((res) => console.log(res));

async function main() {
  await mongoose.connect(uri);
}
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
