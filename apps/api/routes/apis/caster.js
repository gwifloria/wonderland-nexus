// @routes/api/users.js
const fetch = require("node-fetch");
const { exec } = require("child_process");
const express = require("express"); //引入express
const router = express.Router(); // 使用express Router
const activePolls = {};
const { getCurrentDate, baseFetch } = require("../../tools/util");
const CASTER_CONFIG = require("../../config/caster");

router.get("/", (req, res) => {
  res.status(200).send({ ok: 1 });
  return;
});

router.get("/list", async (req, res) => {
  try {
    const result = await fetchCoursesList();
    // Add monitoring status to each course
    const coursesWithStatus = result.map((course) => ({
      ...course,
      isMonitoring: !!activePolls[course.id],
    }));

    res.status(200).json(coursesWithStatus);
  } catch (error) {
    console.error("List error:", error);
    res.status(500).send({ error: "Failed to fetch list." });
  }
});

router.post("/subscribe", (req, res) => {
  const { courseId } = req.body;

  if (activePolls[courseId]) {
    return res.status(500).json({ data: "Already monitoring this course." });
  }

  startPolling(courseId);
  res.status(200).json({ data: "Monitoring started." });
});

router.post("/unsubscribe", (req, res) => {
  const { courseId } = req.body;

  if (!activePolls[courseId]) {
    return res.status(500).json({ data: "Course is not being monitored." });
  }

  stopPolling(courseId);
  res.status(200).json({ data: "Monitoring stopped." });
});

const startPolling = (courseId) => {
  const intervalId = setInterval(
    () => fetchCourseDetail(courseId),
    CASTER_CONFIG.polling.interval
  );
  activePolls[courseId] = intervalId;
};

const stopPolling = (courseId) => {
  if (!courseId) {
    // Stop all polls
    Object.keys(activePolls).forEach((id) => {
      clearInterval(activePolls[id]);
      delete activePolls[id];
    });
  } else {
    // Stop specific poll
    if (activePolls[courseId]) {
      clearInterval(activePolls[courseId]);
      delete activePolls[courseId];
    }
  }
};

const send = (args) => {
  exec(`python3 send.py ${args}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行的错误: ${error}`);
      return;
    }
    stopPolling();
    console.log(`stdout: ${stdout}`);
    if (stderr) {
      console.log(`stderr: ${stderr}`);
    }
  });
};

const fetchData = async (url) => {
  const { data } = await baseFetch(url, CASTER_CONFIG.headers);
  return data;
};

const fetchCourseDetail = async (id) => {
  const res = await fetchData(CASTER_CONFIG.urls.courseDetail + id);
  const targetRows = CASTER_CONFIG.polling.targetRows.map(
    (row) => res.seat[row - 1]
  );

  const availableSeats = targetRows
    .flatMap((row) => row.filter((seat) => seat.status === 0))
    .map(
      (seat, idx) => `${CASTER_CONFIG.polling.targetRows[idx] + 1} ${seat.name}`
    );
  availableSeats.forEach((seat) => {
    send(seat);
  });
};

async function fetchCoursesList(teacher) {
  const day = getCurrentDate();
  const url = `${
    CASTER_CONFIG.urls.courseList
  }?day=${day}&style=&time=&teacher=${teacher ?? ""}`;
  const res = await fetchData(url);
  return res.data;
}

module.exports = router; // 导出路由模块
