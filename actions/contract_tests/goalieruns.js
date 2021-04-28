const pkg = require("../../package.json");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

for (let arg of process.argv.slice(2)) {
  test_set = pkg.config.goaliemappings[arg].resources;
  for (resource_name in test_set) {
    test = test_set[resource_name];
    test_command = 'multi-tape "' + test + '" | tap-spec';
    exec(test_command, function (err, stdout, stderr) {
      if (err) {
        // actually: send this to the right slack channel
        console.error(err);
        return err.code;
      }
      console.log(stdout);
    });
  }
}
