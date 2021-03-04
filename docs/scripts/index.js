// ! Requires
const enquirer = require("enquirer");
const chalk = require("chalk");

// ! Imports
const search = require("./search");
const metatag = require("./metatag");
const style = require("./style");
const navbar = require("./navbar");

// * Get all notebooks and include the option --all
const NOTEBOOKS = search.get_notebooks();
NOTEBOOKS.splice(0, 0, "--all");

enquirer
  .prompt([
    {
      type: "select",
      name: "option",
      message: "Select option: ",
      choices: ["Do all the processes?", "Do a specific process?"],
    },
  ])
  .then((answers) => {
    switch (answers.option) {
      case "Do all the processes?":
        all_processes();
        break;
      case "Do a specific process?":
        specific_process();
        break;
      default:
        // ! No option selected
        console.log(chalk.bold.red("No option was selected!"));
    }
  });

function all_processes() {
  // ! Execute all the processes
  enquirer
    .prompt([
      {
        type: "multiselect",
        name: "notebooks",
        message: "Select notebooks: ",
        limit: 5,
        choices: NOTEBOOKS.slice(0),
      },
    ])
    .then((answers) => {
      // * Removes
      answers.action = "Remove";
      answers.option = "Metatag";
      console.log(chalk.bold.yellow("Removing metatags .."));
      metatag.metatag_option(answers, NOTEBOOKS);
      answers.option = "Style";
      console.log(chalk.bold.yellow("Removing styles .."));
      style.style_option(answers, NOTEBOOKS);

      // * Includes
      answers.action = "Include";
      answers.option = "Navbar";
      console.log(chalk.bold.yellow("Including navbar .."));
      navbar.navbar_option(answers, NOTEBOOKS);
      answers.option = "Style";
      console.log(chalk.bold.yellow("Including styles .."));
      style.style_option(answers, NOTEBOOKS);
      answers.option = "Metatag";
      console.log(chalk.bold.yellow("Including metatags .."));
      metatag.metatag_option(answers, NOTEBOOKS);
    });
}

function specific_process() {
  // ! Execute a specific process
  enquirer
    .prompt([
      {
        type: "select",
        name: "option",
        message: "Select option: ",
        choices: ["Metatag", "Style", "Navbar"],
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
      console.log(answers);
      switch (answers.option) {
        case "Metatag":
          // ! Metatag option selected
          metatag.metatag_option(answers, NOTEBOOKS);
          break;
        case "Style":
          // ! Style option selected
          style.style_option(answers, NOTEBOOKS);
          break;
        case "Navbar":
          // ! Style option selected
          navbar.navbar_option(answers, NOTEBOOKS);
          break;
        default:
          // ! No option selected
          console.log(chalk.bold.red("No option was selected!"));
      }
    });
}
