const core = require("@actions/core");
const Joi = require("joi");
const pkg = require("../../package.json");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { WebClient } = require("@slack/web-api");

web = new WebClient(process.env.SLACK_TOKEN);

module.exports.runTests = async function runTests() {
  const validator = Joi.string()
    .regex(/^[a-zA-Z]*$/)
    .required();
  try {
    let failures = [];
    validated_arg = await Joi.compile(validator).validateAsync(process.argv[2]);
    test_set = pkg.config.goalieMappings[validated_arg].resources;
    new Promise(async function (resolve) {
      let count = 0;
      for (let i = 0; i < test_set.length; ++i) {
        test = test_set[i];
        test_command = 'multi-tape "' + test + '" | tap-spec';
        exec(test_command, async function (err, stdout, stderr) {
          if (err) {
            const startIndex = stdout.indexOf("✖");
            const endIndex = stdout.indexOf("stack:");
            failures.push(stdout.slice(startIndex, endIndex));
          }
          // async: the code won't proceed to the next block until
          // this block is resolved, so a resolve is returned after
          // all the tests are done
          if (++count == test_set.length) {
            return resolve();
          }
          console.log(stdout);
        });
      }
    }).then(async function () {
      if (failures.length > 0) {
        failures.forEach((f) => {
          const noWhitespace = f.replace(" ", "");
          // each correctly formatted entry should be roughly 150-400 characters
          // based on the tap-spec output. if they are not, the errors being surfaced
          // by tap-spec are unexpected.
          if (noWhitespace.length > 500) {
            core.setFailed(
              "An unexpected error surfaced in the contract tests."
            );
          }
        });
        let errorMessage = "";
        if (failures.length > 1) {
          errorMessage = `There were ${failures.length} failures in the contract tests:`;
        } else {
          errorMessage = `There was 1 failure in the contract tests:`;
        }
        try {
          const result = await web.chat.postMessage({
            channel: "pkg.config.goalieMappings[validated_arg].slackChannel",
            text: `:party-dead: ${errorMessage}
  ${failures.join("\n")}`,
          });
        } catch (slackError) {
          console.error(JSON.stringify(slackError, null, 2));
          core.setFailed("There was an error with web.chat.postMessage");
        }
        core.setFailed(errorMessage);
      }
    });
  } catch (joiError) {
    console.error(JSON.stringify(joiError, null, 2));
    core.setFailed("There was an error with the JOI validation");
  }
};

this.runTests();
