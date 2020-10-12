function execute_action(answers, NOTEBOOKS) {
  // todo pass
}

function show_action(answers, NOTEBOOKS) {
  // todo pass
}

function navbar_option(answers, NOTEBOOKS) {
  if (answers.action === "Show") {
    show_action(answers, NOTEBOOKS);
  } else {
    execute_action(answers, NOTEBOOKS);
  }
}

module.exports = {navbar_option};
