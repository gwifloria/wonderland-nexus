// @routes/api/users.js
const express = require("express"); //引入express
const router = express.Router(); // 使用express Router
const Auth = require("../../models/Auth"); //

router.get("/", (req, res) => {
  res.status(200).send({ ok: 1 });
  return;
});

// 清空Auth集合
router.post("/clear", async (req, res) => {
  try {
    await Auth.deleteMany({}); // 使用Mongoose的deleteMany方法清空集合
    res.status(200).send({ message: "All auth records cleared successfully." });
  } catch (error) {
    res.status(500).send({ message: "Error clearing auth records.", error });
  }
});

router.post("/init", (req, res) => {
  const { gitToken, mapKey } = req.body;
  if (!gitToken || !mapKey) {
    res.status(401).json({ error: "please input gitToken or mapKey" });
    return;
  }
  const newAccount = new Auth({ gitToken, mapKey });
  newAccount
    .save()
    .then((auth) => {
      console.log(auth);
      res.json({
        msg: "key init success",
        data: auth,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/info", async (req, res) => {
  try {
    const documents = await Auth.find({}).select("mapKey -_id"); // 只选择mapKey字段且不包括_id字段
    const result = documents[0];
    res.status(200).json(result);
  } catch (error) {
    console.error("failed:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; // 导出路由模块
