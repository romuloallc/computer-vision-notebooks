// ! Requires
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");

// ! Imports
const search = require("./search");
const utils = require("./utils");

// ! Get pages directory
const PAGES_PATH = path.join(__dirname, "../pages/");

function execute_action(answers, NOTEBOOKS) {
  // todo pass
}

function show_action(answers, NOTEBOOKS) {
  // ! Show if notebook has notebook-navbar div
  // ! If color is green, the div already was included
  // ! If color is red, the div does not exist yet
  const _NOTEBOOKS = search.filter_notebooks(answers, NOTEBOOKS);
  _NOTEBOOKS.forEach((notebook) => {
    // * Read html file
    let file = path.join(PAGES_PATH, `${notebook}.html`);
    let content = fs.readFileSync(file, "utf8");
    ({ HTML, DOM, window, document } = utils.HTMLtoDOM(content));
    ({ title, titleHTML, bodyData, metaData, metaHTML } = utils.scrap_data(
      document
    ));

    let body = document.querySelector("body");

    // * Show the current notebook
    console.log(chalk.bold.blue(`# ${notebook}`));
    let DIVS = body.querySelectorAll(":scope div.notebook-navbar");
    let color = DIVS.length >= 1 ? chalk.bold.green : chalk.bold.red;
    console.log(color(`<div class="notebook-navbar">...</div>`));
    console.log(); // ? skip a line
  });
}

function navbar_option(answers, NOTEBOOKS) {
  if (answers.action === "Show") {
    show_action(answers, NOTEBOOKS);
  } else {
    execute_action(answers, NOTEBOOKS);
  }
}

module.exports = {navbar_option};
