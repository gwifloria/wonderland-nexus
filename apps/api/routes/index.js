var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
  next();
});

router.get("/options", function (req, res, next) {
  res.status(200).send({ name: 1 });
});

module.exports = router;
