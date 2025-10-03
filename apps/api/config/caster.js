const CASTER_CONFIG = {
  headers: {
    Authorization: "BFA3DBB2-6F05-B824-ED8B-E5A7300D2679",
    "client-type": "student",
    "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
    Accept: "*/*",
    Host: "caster2021.casterstudio.com",
    Connection: "keep-alive",
    Cookie: "PHPSESSID=2f4d67669fd547f2d0597eeef601013b",
  },
  urls: {
    base: "https://caster2021.casterstudio.com",
    courseDetail:
      "https://caster2021.casterstudio.com/api/v1/student/course/casterappointment?course_id=",
    courseList:
      "https://caster2021.casterstudio.com/api/v1/student/course/casterlist&store=&keywords=&page=1&size=10&is_base=0&slng=121.46677404792271&slat=31.253595439770322",
  },
  polling: {
    interval: 6000, // 6 seconds in milliseconds
    targetRows: [1, 2],
  },
};

module.exports = CASTER_CONFIG;
