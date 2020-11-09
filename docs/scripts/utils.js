// ! Requires
const fs = require("fs");
const jsdom = require("jsdom");
const css = require("css");
const chalk = require("chalk");
const prettier = require("prettier");

// ! Init DOM parser
const DomParser = require("dom-parser");
const parser = new DomParser();

// ! ****** //
// ! Common //
// ! ****** //

function HTMLtoDOM(content) {
  // ! Parse raw HTML to DOM
  let HTML = parser.parseFromString(content, "text/html");
  let DOM = new jsdom.JSDOM(HTML.rawHTML);
  let window = DOM.window;
  let document = window.document;

  return { HTML, DOM, window, document };
}

function write_file(file, document, notebook) {
  // ! Write file from document
  let documentHTML = "<!DOCTYPE html>";
  documentHTML += document.documentElement.outerHTML;
  documentHTML = prettier.format(documentHTML, {
    parser: "html",
    tabWidth: 2,
  });
  fs.writeFileSync(file, documentHTML);
  console.log(chalk.bold.green(`${notebook} was saved!`));
}

function remove_all_comments(element, regex) {
  // ! Remove all comments inside element based on regex pattern
  element.childNodes.forEach((node) => {
    // ? Comment type or Node.COMMENT_NODE is 8
    if (node.nodeType === 8) {
      let comment = node.nodeValue.trim();
      if (comment.match(regex)) {
        element.removeChild(node);
      }
    }
  });
}

function deep_property_remove(obj, property) {
  // ! Remove property from object recursively
  delete obj[property];
  for (item in obj) {
    if (typeof obj[item] === "object")
      deep_property_remove(obj[item], property);
  }
}

// ! ********* //
// ! Meta tags //
// ! ********* //

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
    `<meta name="image" property="og:image" content="https://diegoinacio.github.io/computer-vision-notebooks/images/thumb_${notebook}.jpg">`,
    `<meta property="og:image:type" content="image/jpeg">`,
    `<meta property="og:type" content="article">`,
    `<meta property="article:author" content="Diego Inácio">`,
    `<meta property="article:section" content="Computer Vision Notebooks">`,
  ];
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

// ! ***** //
// ! Style //
// ! ***** //

function check_imported_style(LINKS) {
  // ! Check if any link tag is importing notebook.css
  for (link of LINKS) {
    if (
      link.rel === "stylesheet" &&
      link.href === "../assets/css/notebook.css"
    ) {
      return true;
    }
  }
  return false;
}

function parseCSS(content) {
  // ! Parse content css to object
  let obj = css.parse(content);
  deep_property_remove(obj, "position");
  return obj;
}

function deep_included(rule, CSS_BASE) {
  // ! Check if rule is included in the CSS_BASE
  let s_rule = css.stringify({ stylesheet: { rules: [rule] } });
  for (b_rule of CSS_BASE) {
    let sb_rule = css.stringify({ stylesheet: { rules: [b_rule] } });
    if (
      s_rule.replace(/(\s+|\t+|\n+|\r+)/g, " ") ===
      sb_rule.replace(/(\s+|\t+|\n+|\r+)/g, " ")
    )
      return true;
  }
  return false;
}

module.exports = {
  HTMLtoDOM,
  write_file,
  remove_all_comments,
  generate_tags,
  scrap_data,
  check_imported_style,
  parseCSS,
  deep_included,
};
