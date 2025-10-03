// @routes/api/users.js
const express = require("express"); //引入express
const router = express.Router(); // 使用express Router
const Account = require("../../models/Account"); // 引入User模型

router.get("/", (req, res) => {
  res.status(200).send({ ok: 1 });
  return;
});

router.post("/add", (req, res) => {
  const { address, privateKey } = req.body;

  const newAccount = new Account({ address, privateKey });
  newAccount
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

router.get("/info", async (req, res) => {
  try {
    const documents = await Account.find({});
    res.status(200).json({ data: documents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; // 导出路由模块
