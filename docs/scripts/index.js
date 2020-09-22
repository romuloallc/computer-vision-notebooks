// ! Requires
const enquirer = require("enquirer");
const chalk = require("chalk");

// ! Imports
const search = require("./search");

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
      choices: NOTEBOOKS,
    },
  ])
  .then((answer) => {
    switch (answer.option) {
      case "Metatag":
        // pass
        break;
      case "Style":
        // pass
        break;
      default:
        console.log(chalk.bold.red("No option was selected!"));
    }
  });
