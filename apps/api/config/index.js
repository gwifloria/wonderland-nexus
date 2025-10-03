// @config/keys.js
const password = encodeURIComponent("LittleBJ0101");
const onlineURL = `mongodb+srv://ghuijue:${password}@cluster0.quptfef.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0`;

const local = "mongodb://127.0.0.1:27017/mydb";
const isDev = process.env.NODE_ENV === "development";

module.exports = {
  mongoURI: isDev ? onlineURL : onlineURL,
};
