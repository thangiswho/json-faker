#!/usr/bin/env node

const { SimpleFaker } = require("../dist");
const fs = require("fs");
const yargs = require("yargs");

const fakeData = function (argv) {
  const schemaFile = argv._[0];
  let schema;

  if (!fs.existsSync(schemaFile)) {
    console.error(`Error: schema file [${schemaFile}] does not exist!`);
    return;
  }
  try {
    schema = JSON.parse(fs.readFileSync(schemaFile));
  } catch (e) {
    console.error(
      `Error: schema file [${schemaFile}] is not a valid json file`
    );
    console.error(e.message);
    return;
  }

  try {
    const faker = new SimpleFaker(argv.locale, argv.length);
    const api = JSON.stringify(faker.fakeApi(schema), null, 2);

    if (argv.output.length) {
      fs.writeFileSync(argv.output, api);
      console.log("Fake data was saved successfully to: " + argv.output);
    } else {
      console.log(api);
    }
  } catch (e) {
    console.error(`Error: Could not fake data for schema [${schemaFile}]`);
    console.error(e.message);
    return;
  }
};

(function () {
  const argv = yargs
    .usage("$0 [options] <schema json file>")
    .options({
      length: {
        alias: "n",
        description: "The length of each generated data set",
        default: 10,
      },
      locale: {
        alias: "l",
        description: 'The locale (eg. "ja", "de")',
        default: "en",
      },
      output: {
        alias: "o",
        description: "Write faked data to file",
        default: "",
      },
    })
    .require(1, "Missing <schema json file> argument").argv;

  fakeData(argv);
})();
