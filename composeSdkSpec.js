'use strict'

const yaml = require('js-yaml');
const fs   = require('fs');

function readYaml(filePathAndName) {
  let out;
  try {
    out = yaml.load(fs.readFileSync(filePathAndName, 'utf8'));
      } catch (e) {
    console.log(e);
    process.exit(1);
  }
  return out;
}
function writeYaml(fileNameAndPath, jsonContent) {
  const yamlContent = yaml.dump(jsonContent);
  fs.writeFileSync(fileNameAndPath, yamlContent.toString());
}

// Compose Address Model
// Get document, or throw exception on error
const addressModelPath = './shared/models/address/';
let addressModelSource_intl = readYaml(`${addressModelPath}/address_intl.yml`);
let addressModelSource_us = readYaml(`${addressModelPath}/address_us.yml`);

// Index of the type is
const intermediateAddress = addressModelSource_us.allOf[1];
delete intermediateAddress.required;
delete intermediateAddress.anyOf;

for (const property of Object.keys(intermediateAddress.properties)) {
  if (
    typeof intermediateAddress.properties[property] === 'object'
    && intermediateAddress.properties[property]['$ref']
  ) {
    intermediateAddress.properties[property] = readYaml(`${addressModelPath}${intermediateAddress.properties[property]['$ref']}`);
  } else if (property === 'object') {
    intermediateAddress.properties[property] = intermediateAddress.properties[property].allOf[1];
  } else if (property === 'address_country') {
    intermediateAddress.properties[property].enum =
      [ ...intermediateAddress.properties[property].enum, ...addressModelSource_intl.allOf[1].properties[property].enum ];
  }
}

writeYaml('./addressModel.sdk.yaml', intermediateAddress);

