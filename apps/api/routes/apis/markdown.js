const express = require("express"); //引入express
const router = express.Router(); // 使用express Router
const Markdown = require("../../models/Markdown");

// POST /markdown/add
router.post("/add", async (req, res) => {
  const { title, content, metadata } = req.body;
  console.log(req.body);
  if (!title || !content)
    return res.status(400).json({ error: "Missing title or content" });

  try {
    const md = new Markdown({ title, content, metadata });
    await md.save();
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.error("failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /markdown/list
router.get("/list", async (req, res) => {
  const docs = await Markdown.find({});
  const data = docs.map((doc) => {
    const { _id, createdAt, title } = doc;
    return { id: _id, createdAt, title };
  });
  res.status(200).json({ data: data });
});

// GET /markdown/:id
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const doc = await Markdown.findById(id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// POST /markdown/delete
router.post("/delete", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    const doc = await Markdown.findByIdAndDelete(id);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete failed:", error);
    res.status(400).json({ error: "Invalid ID or deletion failed" });
  }
});

module.exports = router; // 导出路由模块
