// ! Requires
const path = require("path");
const fs = require("fs");
const css = require("css");
const chalk = require("chalk");

// ! Imports
const search = require("./search");
const utils = require("./utils");

// ! Get pages directory
const PAGES_PATH = path.join(__dirname, "../pages/");
const STYLE_PATH = path.join(__dirname, "../assets/css/");

// ! Parse CSS standard base
const css_base = path.join(STYLE_PATH, "notebook.css");
const content = fs.readFileSync(css_base, "utf8");
const CSS_BASE = utils.parseCSS(content).stylesheet.rules;

// ! List of rule types
const RULE_TYPES = ["rule", "media", "font-face", "keyframes"];

function execute_action(answers, NOTEBOOKS) {
  // ! Include or remove notebook style link
  // ! Remove rules which is in the style
  const _NOTEBOOKS = search.filter_notebooks(answers, NOTEBOOKS);
  _NOTEBOOKS.forEach((notebook) => {
    // * Read html file
    let file = path.join(PAGES_PATH, `${notebook}.html`);
    let content = fs.readFileSync(file, "utf8");
    ({ HTML, DOM, window, document } = utils.HTMLtoDOM(content));

    let head = document.querySelector("head");
    let STYLES = head.querySelectorAll(":scope style");
    let LINKS = head.querySelectorAll(":scope link");

    // * Remove comments "custom notebook style"
    utils.remove_all_comments(head, /^\/?! custom notebook style$/);

    // * Remove importer links
    for (link of LINKS) {
      if (
        link.rel === "stylesheet" &&
        link.href === "../assets/css/notebook.css"
      ) {
        head.removeChild(link);
      }
    }

    if (answers.action === "Include") {
      // * Includes
      tags = [
        "\n\n\n<!-- ! custom notebook style -->",
        `<link rel="stylesheet" href="../assets/css/notebook.css" />`,
        "<!-- /! custom notebook style -->\n\n\n",
      ];
      let joined_tags = tags.join(" ");
      let elements = document
        .createRange()
        .createContextualFragment(joined_tags);
      head.insertBefore(elements, head.childNodes[0]);
    } else {
      // * Removes
      for (let i = STYLES.length - 1; i >= 0; i--) {
        let style = STYLES[i];
        let P_CSS = utils.parseCSS(style.innerHTML);
        let RULES = P_CSS.stylesheet.rules;
        for (let j = RULES.length - 1; j >= 0; j--) {
          let rule = RULES[j];
          if (RULE_TYPES.includes(rule.type)) {
            if (utils.deep_included(rule, CSS_BASE)) RULES.splice(j, 1);
          } else {
            RULES.splice(j, 1);
          }
        }
        if (!RULES.length) head.removeChild(style);
        else style.innerHTML = css.stringify(P_CSS);
      }
    }

    utils.write_file(file, document, notebook);
  });
}

function show_action(answers, NOTEBOOKS) {
  // ! Show styles from notebook
  // ! Check if the link to notebook.css is included
  // ! If yes, its color is green. Otherwise, its color is red.
  // ! Show the number of inner rules of each style tag
  const _NOTEBOOKS = search.filter_notebooks(answers, NOTEBOOKS);
  // * Foreach notebook do ..
  _NOTEBOOKS.forEach((notebook) => {
    // * Read html file
    let file = path.join(PAGES_PATH, `${notebook}.html`);
    let content = fs.readFileSync(file, "utf8");
    ({ HTML, DOM, window, document } = utils.HTMLtoDOM(content));

    let head = document.querySelector("head");

    // * Show the current notebook
    console.log(chalk.bold.blue(`# ${notebook}`));
    let LINKS = head.querySelectorAll(":scope link");
    let color = utils.check_imported_style(LINKS)
      ? chalk.bold.green
      : chalk.bold.red;
    console.log(
      color(`<link rel="stylesheet" href="../assets/css/notebook.css" />`)
    );
    let STYLES = head.querySelectorAll(":scope style");
    console.log(`N. of style tags: ${chalk.bold.yellow(STYLES.length)}`);
    STYLES.forEach((style) => {
      let style_css = utils.parseCSS(style.innerHTML).stylesheet.rules;
      let i = style_css.length;
      while (i--) {
        if (!RULE_TYPES.includes(style_css[i].type)) {
          style_css.splice(i, 1);
        }
      }
      console.log(`Style rules: ${chalk.bold.yellow(style_css.length)}`);
    });
    console.log(); // ? skip a line
  });
}

function style_option(answers, NOTEBOOKS) {
  if (answers.action === "Show") {
    show_action(answers, NOTEBOOKS);
  } else {
    execute_action(answers, NOTEBOOKS);
  }
}

module.exports = { style_option };
