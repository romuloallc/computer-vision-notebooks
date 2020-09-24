const path = require("path");
const fs = require("fs");
const jsdom = require("jsdom");
const chalk = require("chalk");

const DomParser = require("dom-parser");
const parser = new DomParser();

const PAGES_PATH = path.join(__dirname, "../pages/");

function filter_notebooks(answers, NOTEBOOKS) {
  // ! Filter notebook list based on the flag --all
  const all = answers.notebooks.includes("--all");
  return all ? NOTEBOOKS : answers.notebooks;
}

function HTMLtoDOM(content) {
  // ! Parse raw HTML to DOM
  let HTML = parser.parseFromString(content, "text/html");
  let DOM = new jsdom.JSDOM(HTML.rawHTML);
  let window = DOM.window;
  let document = window.document;

  return { HTML, DOM, window, document };
}

function scrap_data(document) {
  // ! Collect all necessary data from document
  // * Scrap head and get the page's title element
  let head = document.querySelector("head");
  let title = head.querySelectorAll(":scope title")[0];
  let titleHTML = title.outerHTML;
  // * Scrap body and get title and description ..
  // * .. from the first cell of the notebook.
  let body = document.querySelector("body");
  let div = body.querySelector(
    "div.text_cell_render.border-box-sizing.rendered_html"
  );
  let h1_title =
    div.querySelector("h1").textContent || div.querySelector("h1").innerText;
  let p_description =
    div.querySelector("p").textContent || div.querySelector("p").innerText;
  let bodyData = {
    title: h1_title.replace(/¶/g, ""),
    description: p_description.replace(/¶/g, ""),
  };
  // * Scrap head and get all the meta tags
  let metaData = head.querySelectorAll(":scope meta");
  let metaHTML = Array.from(metaData).map((meta) => {
    return meta.outerHTML;
  });

  return { title, titleHTML, bodyData, metaData, metaHTML };
}

function include_action(answers, NOTEBOOKS) {
  const _NOTEBOOKS = filter_notebooks(answers, NOTEBOOKS);
  // todo pass
}

function remove_action(answers, NOTEBOOKS) {
  const _NOTEBOOKS = filter_notebooks(answers, NOTEBOOKS);
  // todo pass
}

function show_action(answers, NOTEBOOKS) {
  // ! Show all meta tags
  // ! If color is green, the meta tag already exists on the page
  // ! If color is red, the meta tag does note exist yet
  const _NOTEBOOKS = filter_notebooks(answers, NOTEBOOKS);
  // * Foreach notebook do ..
  _NOTEBOOKS.forEach((notebook) => {
    // * Read html file
    let file = path.join(PAGES_PATH, `${notebook}.html`);
    fs.readFile(file, "utf8", function (err, content) {
      ({ HTML, DOM, window, document } = HTMLtoDOM(content));
      ({ title, titleHTML, bodyData, metaData, metaHTML } = scrap_data(
        document
      ));

      // * Show the current notebook
      console.log(chalk.bold.blue(`# ${notebook}`));
      [
        `<title>${bodyData.title}</title>`,
        `<meta charset="utf-8">`,
        `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
        `<meta name="author" content="Diego Inácio">`,
        `<meta property="og:url" content="https://diegoinacio.github.io/computer-vision-notebooks/pages/${notebook}.html">`,
        `<meta name="title" property="og:title" content="${bodyData.title} >> Computer Vision Notebooks | Diego Inácio">`,
        `<meta name="description" property="og:description" content="${bodyData.description}">`,
        `<meta name="image" property="og:image" content="../images/thumb_${notebook}.jpg">`,
        `<meta property="og:image:type" content="image/jpeg">`,
        `<meta property="og:type" content="article">`,
        `<meta property="article:author" content="Diego Inácio">`,
        `<meta property="article:section" content="Computer Vision Notebooks">`,
      ].forEach((meta) => {
        let color = metaHTML.includes(meta) ? chalk.bold.green : chalk.bold.red;
        console.log(color(meta));
      });
      console.log(); // skip a line
    });
  });
}

function metatag_option(answers, NOTEBOOKS) {
  switch (answers.action) {
    case "Include":
      include_action(answers, NOTEBOOKS);
      break;
    case "Remove":
      remove_action(answers, NOTEBOOKS);
      break;
    default:
      show_action(answers, NOTEBOOKS);
  }
}

module.exports = { metatag_option };
