const path = require("path");
const fs = require("fs");

const PAGES_PATH = path.join(__dirname, "../pages/");

function get_notebooks() {
  let NOTEBOOKS = new Array();
  // ! Read all files in pages/
  const files = fs.readdirSync(PAGES_PATH);
  files.forEach((file) => {
    let match = file.match(/(.*\.html)/i);
    if (match) {
      let notebook = file.split(".")[0];
      NOTEBOOKS.push(notebook);
    }
  });
  return NOTEBOOKS;
}

module.exports = { get_notebooks };
