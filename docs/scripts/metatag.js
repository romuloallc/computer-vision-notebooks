const path = require("path");
const fs = require("fs");
const jsdom = require("jsdom");
const chalk = require("chalk");
const enquirer = require("enquirer");

// * Init DOM parses
const DomParser = require("dom-parser");
const parser = new DomParser();

// * Get pages directory
const PAGES_PATH = path.join(__dirname, "../pages/");

function filter_notebooks(answers, NOTEBOOKS) {
  // ! Filter notebook list based on the flag --all
  const all = answers.notebooks.includes("--all");
  return all ? NOTEBOOKS.filter((e) => e !== "--all") : answers.notebooks;
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
  let div = body.querySelector("#notebook > .container .text_cell_render");

  // * Define title text from <h1>
  let h1_tag = div.querySelector("h1");
  let h1_title = h1_tag.textContent || h1_tag.innerText;
  h1_title = h1_title.replace(/¶/g, ""); // ? Remove Pilcrow
  h1_title = h1_title.trim().replace(/\s\s+/g, " "); // ? Remove extra spaces

  // *  Define description text from <p>
  let p_tag = div.querySelector("p");
  let p_description = p_tag.textContent || p_tag.innerText;
  p_description = p_description.trim().replace(/\s\s+/g, " "); // ? Remove extra spaces

  let bodyData = { title: h1_title, description: p_description };
  // * Scrap head and get all the meta tags
  let metaData = head.querySelectorAll(":scope meta");
  let metaHTML = Array.from(metaData).map((meta) => {
    return meta.outerHTML;
  });

  return { title, titleHTML, bodyData, metaData, metaHTML };
}

function generate_tags(notebook, bodyData) {
  // ! Generate all default meta tags
  return [
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
  ];
}

function include_action(answers, NOTEBOOKS) {
  // ! Include all meta tags
  const _NOTEBOOKS = filter_notebooks(answers, NOTEBOOKS);
  // * Foreach notebook do ..
  _NOTEBOOKS.forEach((notebook) => {
    // * Read html file
    let file = path.join(PAGES_PATH, `${notebook}.html`);
    let content = fs.readFileSync(file, "utf8");
    ({ HTML, DOM, window, document } = HTMLtoDOM(content));
    ({ title, titleHTML, bodyData, metaData, metaHTML } = scrap_data(document));

    // * Include new title to meta tag list
    let metaData_ = Array.from(metaData).concat(title);

    // * Remove all the meta tags in the current document
    remove_all(document, metaData_);

    // * Includes
    let head = document.querySelector("head");
    let tags = generate_tags(notebook, bodyData);
    tags.splice(0, 0, "<!-- ! custom meta tags -->");
    tags.push("<!-- /! custom meta tags -->");
    let joined_tags = tags.join(" ");
    let elements = document.createRange().createContextualFragment(joined_tags);
    head.insertBefore(elements, head.childNodes[0]);

    // * Write file
    documentHTML = document.documentElement.innerHTML;
    fs.writeFileSync(file, documentHTML);
    console.log(chalk.bold.green(`${notebook} was saved!`));
  });
}

function remove_action(answers, NOTEBOOKS) {
  // ! Remove all meta tags
  const _NOTEBOOKS = filter_notebooks(answers, NOTEBOOKS);
  // * Foreach notebook do ..
  _NOTEBOOKS.forEach((notebook) => {
    // * Read html file
    let file = path.join(PAGES_PATH, `${notebook}.html`);
    let content = fs.readFileSync(file, "utf8");
    ({ HTML, DOM, window, document } = HTMLtoDOM(content));
    ({ title, titleHTML, bodyData, metaData, metaHTML } = scrap_data(document));

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

    // * Write file
    documentHTML = document.documentElement.innerHTML;
    fs.writeFileSync(file, documentHTML);
    console.log(chalk.bold.green(`${notebook} was saved!`));
  });
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
    let content = fs.readFileSync(file, "utf8");
    ({ HTML, DOM, window, document } = HTMLtoDOM(content));
    ({ title, titleHTML, bodyData, metaData, metaHTML } = scrap_data(document));

    // * Show the current notebook
    console.log(chalk.bold.blue(`# ${notebook}`));
    generate_tags(notebook, bodyData).forEach((meta) => {
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
