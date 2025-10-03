const express = require("express"); //引入express
const router = express.Router(); // 使用express Router
const Excerpt = require("../../models/Excerpt");

router.get("/list", async (req, res) => {
  try {
    const documents = await Excerpt.find({});
    const data = documents.map((doc) => {
      const { _id, _doc } = doc;
      return { id: _id, ..._doc };
    });
    res.status(200).json({ blogs: data });
  } catch (error) {
    console.error("failed:", error);
    res.status(500).json({ error: error.message });
  }
});

router.use(express.json());

router.post("/upload", async (req, res) => {
  const { bookName, content } = req.body;
  if (!bookName || !content) {
    res.status(401).json({ error: "please complete the required info" });
    return;
  }

  try {
    const excerpt = new Excerpt({ bookName, content });
    await excerpt.save();
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.error("failed:", error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/delete", async (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(401).json({ error: "please complete id" });
    return;
  }

  try {
    await Excerpt.findOneAndDelete(id);
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.error("failed:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/edit", async (req, res) => {
  const { id, content } = req.body;
  if (!id) {
    res.status(401).json({ error: "please complete id" });
    return;
  }

  try {
    await Excerpt.update({ _id, id }, { content: content });
    console.log("success");
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.error("failed:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; // 导出路由模块
