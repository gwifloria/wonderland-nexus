module.exports = {
  getCurrentDate: () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 月份从0开始
    const day = now.getDate() + (now.getHours() >= 22 ? 1 : 0); // 如果时间在22点后，日期加1
    return `${year}-${month}-${day}`;
  },
  baseFetch: async (url, headers) => {
    try {
      const response = await fetch(url, { method: "GET", headers: headers });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      throw new Error("Failed to fetch data.");
    }
  },
};
