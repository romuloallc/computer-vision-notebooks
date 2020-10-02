// ! Requires
const enquirer = require("enquirer");
const chalk = require("chalk");

// ! Imports
const search = require("./search");
const metatag = require("./metatag");
const style = require("./style");

// * Get all notebooks and include the option --all
const NOTEBOOKS = search.get_notebooks();
NOTEBOOKS.splice(0, 0, "--all");

enquirer
  .prompt([
    {
      type: "select",
      name: "option",
      message: "Select option: ",
      choices: ["Metatag", "Style"],
    },
    {
      type: "select",
      name: "action",
      message: "Select action: ",
      choices: ["Show", "Include", "Remove"],
    },
    {
      type: "multiselect",
      name: "notebooks",
      message: "Select notebooks: ",
      limit: 5,
      choices: NOTEBOOKS.slice(0),
    },
  ])
  .then((answers) => {
    switch (answers.option) {
      case "Metatag":
        // ! Metatag option selected
        metatag.metatag_option(answers, NOTEBOOKS);
        break;
      case "Style":
        // ! Style option selected
        style.style_option(answers, NOTEBOOKS);
        break;
      default:
        // ! No option selected
        console.log(chalk.bold.red("No option was selected!"));
    }
  });
