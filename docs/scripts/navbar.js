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
  // !
  const _NOTEBOOKS = search.filter_notebooks(answers, NOTEBOOKS);
  // * Foreach notebook do ..
  _NOTEBOOKS.forEach((notebook) => {
    let file = path.join(PAGES_PATH, `${notebook}.html`);
    let content = fs.readFileSync(file, "utf8");
    ({ HTML, DOM, window, document } = utils.HTMLtoDOM(content));
    ({ title, titleHTML, bodyData, metaData, metaHTML } = utils.scrap_data(
      document
    ));

    let body = document.querySelector("body");

    // * Remove comments "custom navbar"
    body.childNodes.forEach((node) => {
      // ? Comment type or Node.COMMENT_NODE is 8
      if (node.nodeType === 8) {
        let comment = node.nodeValue.trim();
        let regex = /^\/?! custom navbar$/;
        if (comment.match(regex)) {
          body.removeChild(node);
        }
      }
    });

    let DIVS = body.querySelectorAll(":scope div.notebook-navbar");

    // * Remove all navbar div.notebook-navbar
    DIVS.forEach((div) => {
      body.removeChild(div);
    });

    if (answers.action === "Include") {
      // * Includes
      let tags = [
        "<!-- ! custom navbar -->",
        `<div class="notebook-navbar">`,
        `<a href="http://diegoinacio.github.io/computer-vision-notebooks/">`,
        `Return to <span>Computer Vision Notebooks</span>`,
        `</a>`,
        `</div>`,
        "<!-- /! custom navbar -->",
      ];
      let joined_tags = tags.join(" ");
      let elements = document
        .createRange()
        .createContextualFragment(joined_tags);
      body.insertBefore(elements, body.childNodes[0]);
    }

    utils.write_file(file, document, notebook);
  });
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

module.exports = { navbar_option };
