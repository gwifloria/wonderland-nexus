const express = require("express");
const router = express.Router();
const Destination = require("../../models/Destination");

// 清空Auth集合
router.post("/add", async (req, res) => {
  const { destination, longitude, latitude, visited } = req.body;
  if (!destination || !longitude || !latitude) {
    res.status(401).json({ error: "please complete the required info" });
    return;
  }
  let hasVisited = visited || false;

  try {
    const destinationObj = new Destination({
      destination,
      longitude,
      latitude,
      visited: hasVisited,
    });
    await destinationObj.save();
    res.status(200).send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "failed clearing auth records.", error });
  }
});

router.get("/list", async (req, res) => {
  try {
    const documents = await Destination.find({});
    res.status(200).json({ data: documents });
  } catch (error) {
    console.error("failed:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/delete", async (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(401).json({ error: "please provide the destination to delete" });
    return;
  }

  try {
    const deletedDocument = await Destination.findOneAndDelete({ _id: id });
    if (deletedDocument) {
      res.status(200).json({ message: "success", data: deletedDocument });
    } else {
      res.status(404).json({ error: "destination not found" });
    }
  } catch (error) {
    console.error("failed:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
