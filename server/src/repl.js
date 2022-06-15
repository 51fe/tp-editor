const repl = require('repl');
const chalk = require('chalk');
const logger = require('./logger');
const { getString } = require('./i18n');

const replMain = function (cmd, context, fileName, callback) {
  callback(null, eval(cmd))
}

module.exports.on = function (line = {}) {
  const message = line.prompt || "ht-server> ",
    input = line.input || process.stdin,
    output = line.output || process.stdout;
  logger.important(getString("exitRepl"));
  repl.start({
    prompt: chalk.green(message),
    input: input,
    output: output,
    eval: replMain
  })
};
