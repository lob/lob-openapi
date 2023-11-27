const fs = require("fs");
const YAML = require("yaml");
const { version } = require("../package.json");

/**
 * @typedef {Object} LobApiPublicYamlInfo
 * @property {string} version
 */

/**
 * @typedef {Object} LobApiPublicYaml
 * @property {LobApiPublicYamlInfo} info
 */

const updateLobApiPublicYmlVersion = async () => {
  try {
    const file = await fs.promises.readFile("./lob-api-public.yml", "utf8");
    /** @type LobApiPublicYaml */
    const lobApiPublic = YAML.parse(file);
    lobApiPublic.info.version = version;
    await fs.promises.writeFile(
      "./lob-api-public.yml",
      YAML.stringify(lobApiPublic, {
        minContentWidth: 0,
        lineWidth: 0,
      })
    );
    console.log(`updated version in lob-api-public.yml to ${version}`);
  } catch (err) {
    console.error(
      `error updating version in lob-api-public.yml to ${version}`,
      err
    );
  }
};

updateLobApiPublicYmlVersion();
