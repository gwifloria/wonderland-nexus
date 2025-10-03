// @routes/api/users.js
const fetch = require("node-fetch");
const { exec } = require("child_process");
const express = require("express");
const router = express.Router();
const activePolls = new Object();
const { getCurrentDate, baseFetch } = require("../../tools/util");
const ONEWAY_CONFIG = require("../../config/oneway");

router.get("/", (_, res) => {
  res.status(200).send({ ok: 1 });
});

router.get("/list", async (_, res) => {
  try {
    const result = await fetchList();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch list." });
  }
});

router.post("/subscribe", (req, res) => {
  const { courseId } = req.body;
  if (activePolls[courseId]) {
    return res
      .status(500)
      .json({ data: "Already polling for this configuration." });
  }

  startPolling(courseId);
  res.status(200).json({ data: "Polling started." });
});

router.post("/unsubscribe", (req, res) => {
  const { courseId } = req.body;

  if (!activePolls[courseId]) {
    return res
      .status(200)
      .json({ data: "No active polling for this configuration." });
  }

  stopPolling(courseId);
  res.status(200).json({ data: "Polling stopped." });
});

const startPolling = (courseId) => {
  const intervalId = setInterval(
    () => fetchCourseSeats(courseId),
    ONEWAY_CONFIG.polling.interval
  );
  activePolls[courseId] = intervalId;
};

const stopPolling = (pollKey) => {
  if (activePolls[pollKey]) {
    clearInterval(activePolls[pollKey]);
    delete activePolls[pollKey];
  }
};

const sendNotification = (args) => {
  exec(`python3 send.py ${args}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行的错误: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
  });
};

const fetchData = async (url) => {
  try {
    const data = await baseFetch(url, ONEWAY_CONFIG.headers);
    const { info } = data;
    return info;
  } catch (error) {
    console.error("Fetch error:", error);
    throw new Error("Failed to fetch data.");
  }
};

async function fetchCourseSeats(courseId) {
  const courseSeatUrl = `${ONEWAY_CONFIG.urls.base}/${ONEWAY_CONFIG.urls.groupCoursePrefix}/getscheduleseats?scheduleid=${courseId}`;
  const data = await fetchData(courseSeatUrl);
  const { seat_list } = data;
  const { isUsed, maxSeatNum, maxRowNum } = ONEWAY_CONFIG.polling.seatFilters;
  const seats = seat_list
    .flatMap((arr) => arr)
    .filter((seat) => {
      console.log(seat);
      return (
        seat.is_used === isUsed &&
        seat.seat_num <= maxSeatNum &&
        seat.seat.split("-")[0] <= maxRowNum
      );
    });
  console.log("Seats found:", seats);
  if (seats.length > 0) {
    const seat = seats[0].seat.split("-");
    sendNotification(`${seat[0]} ${seat[1]}`);
  }

  return seats;
}

async function fetchList() {
  const day = getCurrentDate();
  const url = `${ONEWAY_CONFIG.urls.base}/${ONEWAY_CONFIG.urls.groupCoursePrefix}/dailyschedules?date=${day}&is_appoint=0&tagname=&teacherid=-1&classroomid=-1`;
  return await fetchData(url);
}

module.exports = router; // 导出路由模块
