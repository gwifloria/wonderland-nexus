const ONEWAY_CONFIG = {
  headers: {
    Authorization:
      "Z6M0QRPKh6m0OPAh6AZqEZQ1QRAZF7xXDY20/NTgEFBQACSfU9RAAgkeDePUta0oh7kAgwPa5LTdoTPTvdm5qQ==",
    "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
    Accept: "*/*",
    Host: "xiaochengxu-edu-api.fityun.cn",
    Connection: "keep-alive",
    sign: "emHCVkiPk22rHU1o95hUysB3IGDfdHDu1LNAPyi3WgK0FF/flEgziyZeWAHocZRDYwNAMkcfkalByLdFk2xxAS6pIHyLxzlnaq/hKGQB+Ek=",
    userid: "6063199",
    branchid: "1473",
    orgid: "11053394",
  },
  urls: {
    base: "https://xiaochengxu-edu-api.fityun.cn",
    groupCoursePrefix: "dance/tuancourse",
  },
  polling: {
    interval: 30 * 1000, // 30 seconds in milliseconds
    seatFilters: {
      maxSeatNum: 30,
      maxRowNum: 3,
      isUsed: "1",
    },
  },
};

module.exports = ONEWAY_CONFIG;
