const Joi = require("joi");
const pkg = require("../../package.json");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

module.exports.oneTest = async function oneTest() {
  const validator = Joi.string()
    .regex(/^[a-z_]*_test.js$/)
    .required();
  try {
    let test = "./tests/";
    test += await Joi.compile(validator).validateAsync(process.argv[2]);
    const test_command = 'tape "' + test + '" | tap-spec';
    exec(test_command, function (err, stdout, stderr) {
      if (err) {
        console.error(JSON.stringify(err, null, 2));
        return err.code;
      }
      console.log(stdout);
    });
  } catch (err) {
    console.error(JSON.stringify(err, null, 2));
    return err.code;
  }
};

this.oneTest();
