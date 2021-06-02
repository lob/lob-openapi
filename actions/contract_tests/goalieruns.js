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

  for (let arg of process.argv.slice(2)) {
    try {
      validated_arg = await Joi.compile(validator).validateAsync(arg);
      test_set = pkg.config.goalieMappings[validated_arg].resources;
      for (resource_name in test_set) {
        test = test_set[resource_name];
        test_command = 'multi-tape "' + test + '" | tap-spec';
        exec(test_command, async function (err, stdout, stderr) {
          // if (err) {
          //   try {
          //     // send this to the right slack channel
          //     // the start and end indices, as well as the length, are constant because the stacktrace always
          //     // includes the same spots in the tape module (only the failing test itself may change)
          //     const startIndex = stdout.indexOf(
          //       "at Test.bound [as equal] (/github/workspace/node_modules/tape/lib/test.js:91:32)"
          //     );
          //     const endIndex = stdout.indexOf(
          //       "at processTicksAndRejections (internal/process/task_queues.js:93:5)"
          //     );
          //     const len = "at Test.bound [as equal] (/github/workspace/node_modules/tape/lib/test.js:91:32)"
          //       .length;
          //     const testMessage = stdout.slice(startIndex + len, endIndex);
          //     const expectedCode = stdout.slice(
          //       stdout.indexOf("expected: ") + 10,
          //       stdout.indexOf("      actual:")
          //     );
          //     const actualCode = stdout.slice(
          //       stdout.indexOf("actual:   ") + 10,
          //       stdout.indexOf("      at:")
          //     );
          //     const block = [
          //       `_FAILED CONTRACT TEST_:      ${testMessage}`,
          //       `_EXPECTED_:  ${expectedCode}`,
          //       `_ACTUAL_:      ${actualCode}`,
          //     ];
          //     const result = await web.chat.postMessage({
          //       channel: pkg.config.goalieMappings[validated_arg].slackChannel,
          //       text: `:sadpanda: ${block.join("\n")}`,
          //     });
          //   } catch (error) {
          //     console.error(error);
          //     return error.code;
          //   }
          // }
          if (err) {
            console.log(err);
            return err.code;
          }
          console.log(stdout);
        });
      }
    } catch (joiError) {
      console.error(JSON.stringify(joiError, null, 2));
      return joiError.code;
    }
  }
};

this.runTests();
