const express = require("express"); //引入express
const router = express.Router(); // 使用express Router
const Lab = require("../../models/Lab");
// POST /lab/clear
router.post("/clear", async (req, res) => {
  console.log(res);
  try {
    await Lab.deleteMany({});
    res.status(200).json({ message: "All Lab documents deleted successfully" });
  } catch (error) {
    console.error("Lab clear failed:", error);
    res.status(500).json({ error: "Failed to clear labs" });
  }
});

// POST /lab/add
router.post("/add", async (req, res) => {
  const { title, content, type, status = "open", category } = req.body;
  if (!title || !type || !category) {
    return res
      .status(400)
      .json({ error: "Missing required fields: title, content, or type" });
  }

  try {
    const lab = new Lab({
      title,
      content,
      type,
      status,
      category,
    });

    await lab.save();
    res.status(200).json({
      message: "Lab created successfully",
      data: lab,
    });
  } catch (error) {
    console.error("Lab creation failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /labs/list
router.get("/list", async (req, res) => {
  const { type, status } = req.query;
  let query = {};

  if (type) {
    query.type = type; // "bug" | "issue" | "idea"
  }
  if (status) {
    query.status = status; // "open" | "inProgress" | "done"
  }

  try {
    const labs = await Lab.find(query)
      .sort({ createdAt: -1 })
      .select("title type status content category createdAt updatedAt");

    const data = labs.map((doc) => {
      const { _id, _doc } = doc;
      return { id: _id, ..._doc };
    });
    res.status(200).json({
      message: "Labs retrieved successfully",
      data: data,
    });
  } catch (error) {
    console.error("Lab list fetch failed:", error);
    res.status(500).json({ error: "Failed to fetch labs" });
  }
});

// GET /lab/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const lab = await Lab.findById(id);
    if (!lab) {
      return res.status(404).json({ error: "Lab not found" });
    }
    res.status(200).json({
      message: "Lab retrieved successfully",
      data: lab,
    });
  } catch (error) {
    console.error("Lab fetch failed:", error);
    res.status(400).json({ error: "Invalid lab ID" });
  }
});

// POST /labs/update
router.post("/update", async (req, res) => {
  const { id, title, content, type, status, category } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (type) updateData.type = type;
    if (status) updateData.status = status;
    if (category) updateData.category = category;

    const lab = await Lab.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!lab) {
      return res.status(404).json({ error: "Lab not found" });
    }

    res.status(200).json({
      message: "Lab updated successfully",
      data: lab,
    });
  } catch (error) {
    console.error("Lab update failed:", error);
    res.status(400).json({ error: "Failed to update lab" });
  }
});

// POST /labs/delete
router.post("/delete", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    const lab = await Lab.findByIdAndDelete(id);
    if (!lab) {
      return res.status(404).json({ error: "Lab not found" });
    }
    res.status(200).json({
      message: "Lab deleted successfully",
      data: lab,
    });
  } catch (error) {
    console.error("Lab deletion failed:", error);
    res.status(400).json({ error: "Failed to delete lab" });
  }
});

module.exports = router; // 导出路由模块
