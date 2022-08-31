// const fs = require("fs");
// const FormData = require("form-data");

// const form = new FormData();
// const file = fs.createReadStream("tests/assets/lobster-family.csv");
// form.append("file", file);

// console.log(form._boundary);

var fs = require("fs");
var files = fs.readdirSync("tests");
console.log(
  files
    .map((filename) => `$${filename.split("_test.js")[0].toUpperCase()}`)
    .join(" ")
);
// for (const filename of files) {
//   if (filename.includes("test")) {
//     const name = filename.split("_test.js")[0]
//     console.log(`if [[ $files_changed == *"${name}"* ]]; then
//     tests_to_run+=()
//   fi`)
//     // console.log(`readonly ${name.toUpperCase()}="${name}"`)
//   }
// }
