// @routes/api/users.js
const express = require("express"); //引入express
const router = express.Router(); // 使用express Router
const User = require("../../models/User"); // 引入User模型

router.get("/", (req, res) => {
  res.status(200).send({ ok: 1 });
  return;
});

router.get("/add", (req, res) => {
  const newUser = new User({
    username: "test",
    password: "test",
  });
  newUser
    .save()
    .then((user) => {
      res.json({
        msg: "用户新增成功",
        data: user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router; // 导出路由模块
