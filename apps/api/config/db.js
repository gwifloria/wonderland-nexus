// DB Config 连接数据库
const mongoose = require("mongoose");
// MongoDB 连接 URI
const uri = require("./index").mongoURI;

async function main() {
  await mongoose.connect(uri);
  x;
}
module.exports = main;
