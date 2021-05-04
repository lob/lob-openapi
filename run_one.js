const pkg = require("../../package.json");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

test = process.argv[2];
test_command = 'tape "' + test + '" | tap-spec';
exec(test_command, function (err, stdout, stderr) {
  if (err) {
    // actually: send this to the right slack channel
    console.error(err);
    return err.code;
  }
  console.log(stdout);
});
