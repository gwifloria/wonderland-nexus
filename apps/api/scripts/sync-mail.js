require("dotenv").config();
const { runMailSync } = require("@wonderland/mail-sync");

runMailSync().catch((err) => {
  console.error(err);
  process.exit(1);
});
