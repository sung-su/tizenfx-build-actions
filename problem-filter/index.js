const path = require('path');
const core = require('@actions/core');
const exec = require('../common/exec');

const PROBLEM_MATCHERS = {
  dotnet: {
    // eslint-disable-next-line max-len
    regexp: '^([^\\s].*)\\((\\d+)(?:,\\d+|,\\d+,\\d+)?\\):\\s+(error|warning)\\s+([a-zA-Z]+(?<!MSB)\\d+):\\s*(.*?)\\s+\\[(.*?)\\]$',
    file: 1,
    line: 2,
    severity: 3,
    code: 4,
    message: 5,
    fromPath: 6,
  },
};

/**
 * Filter out warning or error messages output to stdout
 */
async function run() {
  try {
    const commands = core.getInput('run').split(/\r?\n/);
    const type = core.getInput('type');
    const files = core.getInput('files');

    const errors = [];

    // get changed files
    let changedFiles = [];
    if (files) {
      changedFiles = JSON.parse(files);
    }

    // get problem matcher
    const matcher = PROBLEM_MATCHERS[type];
    if (matcher === undefined) {
      throw new Error(`not supported problem matcher type: ${type}`);
    }

    // execute command
    const re = new RegExp(matcher['regexp']);
    for (const cmd of commands) {
      const ret = await exec(cmd.trim(), {env: process.env}, (line) => {
        const match = re.exec(line);
        if (match) {
          if (changedFiles.includes(getMatchedFile(matcher, match))) {
            console.log(line);
          }
          const severity = match[matcher['severity']];
          if (severity === 'error') {
            errors.push(line);
          }
        } else {
          console.log(line);
        }
      });
      if (ret !== 0) {
        setErrors(errors);
        throw new Error(`run process exited with code ${ret}`);
      }
    }
    setErrors(errors);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function setErrors(errors) {
  if (errors) {
    core.setOutput('errors', JSON.stringify(errors));
  }
}

function getMatchedFile(matcher, match) {
  const fileIdx = matcher['file'];
  const fromPathIdx = matcher['fromPath'];

  let file = match[fileIdx];
  if (fromPathIdx) {
    const fromPathDir = path.dirname(match[fromPathIdx]);
    const baseDir = path.relative(process.env['GITHUB_WORKSPACE'], fromPathDir);
    file = path.join(baseDir, file);
  }

  return file;
}

run();
