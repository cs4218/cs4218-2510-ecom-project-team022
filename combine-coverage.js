const fs = require("fs");
const path = require("path");

const backend = fs.readFileSync(
  path.join(__dirname, "coverage/backend/lcov.info"),
  "utf8"
);
const frontend = fs.readFileSync(
  path.join(__dirname, "coverage/frontend/lcov.info"),
  "utf8"
);

fs.writeFileSync(
  path.join(__dirname, "coverage/lcov.info"),
  backend + "\n" + frontend
);
console.log("✅ Combined coverage saved to coverage/lcov.info");
