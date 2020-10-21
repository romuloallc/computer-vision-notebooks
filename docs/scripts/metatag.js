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
  // ! Include or remove all meta tags
  const _NOTEBOOKS = search.filter_notebooks(answers, NOTEBOOKS);
  // * Foreach notebook do ..
  _NOTEBOOKS.forEach((notebook) => {
    // * Read html file
    let file = path.join(PAGES_PATH, `${notebook}.html`);
    let content = fs.readFileSync(file, "utf8");
    ({ HTML, DOM, window, document } = utils.HTMLtoDOM(content));
    ({ title, titleHTML, bodyData, metaData, metaHTML } = utils.scrap_data(
      document
    ));

    // * Include new title to meta tag list
    let metaData_ = Array.from(metaData).concat(title);

    let head = document.querySelector("head");

    // * Remove comments "custom meta tags"
    head.childNodes.forEach((node) => {
      // ? Comment type or Node.COMMENT_NODE is 8
      if (node.nodeType === 8) {
        let comment = node.nodeValue.trim();
        let regex = /^\/?! custom meta tags$/;
        if (comment.match(regex)) {
          head.removeChild(node);
        }
      }
    });

    // * Remove all meta tags from metaData
    metaData_.forEach((meta) => {
      head.removeChild(meta);
    });

    let tags;
    if (answers.action === "Include") {
      // * Includes
      tags = utils.generate_tags(notebook, bodyData);
      tags.splice(0, 0, "<!-- ! custom meta tags -->");
      tags.push("<!-- /! custom meta tags -->");
    } else {
      // * Removes
      tags = [
        "<!-- ! custom meta tags -->",
        `<title>${bodyData.title}</title>`,
        "<!-- /! custom meta tags -->",
      ];
    }

    let joined_tags = tags.join(" ");
    let elements = document.createRange().createContextualFragment(joined_tags);
    head.insertBefore(elements, head.childNodes[0]);

    utils.write_file(file, document, notebook);
  });
}

function show_action(answers, NOTEBOOKS) {
  // ! Show all meta tags
  // ! If color is green, the meta tag already exists on the page
  // ! If color is red, the meta tag does note exist yet
  const _NOTEBOOKS = search.filter_notebooks(answers, NOTEBOOKS);
  // * Foreach notebook do ..
  _NOTEBOOKS.forEach((notebook) => {
    // * Read html file
    let file = path.join(PAGES_PATH, `${notebook}.html`);
    let content = fs.readFileSync(file, "utf8");
    ({ HTML, DOM, window, document } = utils.HTMLtoDOM(content));
    ({ title, titleHTML, bodyData, metaData, metaHTML } = utils.scrap_data(
      document
    ));

    // * Show the current notebook
    console.log(chalk.bold.blue(`# ${notebook}`));
    utils.generate_tags(notebook, bodyData).forEach((meta) => {
      let color =
        meta === titleHTML || metaHTML.includes(meta)
          ? chalk.bold.green
          : chalk.bold.red;
      console.log(color(meta));
    });
    console.log(); // ? skip a line
  });
}

function metatag_option(answers, NOTEBOOKS) {
  if (answers.action === "Show") {
    show_action(answers, NOTEBOOKS);
  } else {
    execute_action(answers, NOTEBOOKS);
  }
}

module.exports = { metatag_option };
