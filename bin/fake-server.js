#!/usr/bin/env node

const { SimpleFaker, fakeRouter } = require("../dist");
const path = require("path");
const yargs = require("yargs");
const express = require("express");

const fakeServer = function (argv) {
  const app = express();
  const router = fakeRouter(argv._[0]);

  app.use(argv.base, router);
  app.listen(argv.port, argv.host, () => {
    console.log(
      `The simple faker server is running at http://${argv.host}:${argv.port}${argv.base}`
    );
  });
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
      port: {
        alias: "p",
        description: "Set port",
        default: 3000,
      },
      host: {
        alias: "h",
        description: "Set host",
        default: "localhost",
      },
      base: {
        alias: "b",
        description: "Set base url (e.g. /v2 or /api)",
        default: "",
      },
    })
    .require(1, "Missing <schema json file> argument").argv;

  fakeServer(argv);
})();
