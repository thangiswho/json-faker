#!/usr/bin/env node

const { SimpleFaker } = require("../dist");
const fs = require("fs");
const yargs = require("yargs");
const express = require("express");

const cors = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, access_token"
  );
  res.header("Content-Type", "application/json");

  // intercept OPTIONS method
  if ("OPTIONS" === req.method) {
    res.send(200);
  } else {
    next();
  }
};

const getSchema = function (schemaFile) {
  if (!fs.existsSync(schemaFile)) {
    console.error("Error: schema file [" + schemaFile + "] does not exist!");
    return;
  }
  try {
    schema = JSON.parse(fs.readFileSync(schemaFile));
    if (!schema || typeof schema !== "object") {
      console.error(
        "Error: schema file [" + schemaFile + "] is not a valid json file"
      );
      return;
    }

    return schema;
  } catch (e) {
    console.error("Error: Could not fake data for schema [" + schemaFile + "]");
    console.error(e.message);
    return;
  }
};

const fakeServer = function (argv) {
  const apiShema = getSchema(argv._[0]);
  if (typeof apiShema !== "object") {
    return;
  }

  const faker = new SimpleFaker(argv.locale, argv.length);
  const app = express();
  app.use(cors);

  app.get("/", (req, res) => {
    let body = "<h2>A simple faker server!</h2>" + "<br/><br/>Routes: <br/>\n";
    Object.keys(apiShema).forEach(function (k) {
      const route = k.toLowerCase();
      const id = faker.fake("integer");

      body +=
        "<p><ul>" +
        [
          `<li>GET <a href="/${route}">/${route}</a></li>`,
          `<li>GET <a href="/${route}/${id}">/${route}/:id</a></li>`,
          `<li>POST /${route}</li>`,
          `<li>POST /${route}/${id}</li>`,
          `<li>PUT /${route}/${id}</li>`,
          `<li>DELETE /${route}/${id}</li>`,
        ].join("") +
        "</ul></p>";
    });

    res.header("Content-Type", "text/html");
    res.send(body);
  });

  app.all(`/code/:code`, (req, res) => {
    let code = parseInt(req.params.code);
    if (typeof code !== "number") code = 500;
    if (code < 200 || code > 500) code = 500;

    res.status(code).send({
      code: code,
      body: req.body,
      query: req.query,
    });
  });

  for (const [prop, schema] of Object.entries(apiShema)) {
    const route = prop.toLowerCase();

    app.get(`/${route}`, (req, res) => {
      const data = faker.fakeApi({ prop: schema });
      res.send(data.prop);
    });
    app.get(`/${route}/:id`, (req, res) => {
      const data = faker.fakeSchema(schema);
      data.id = req.params.id;
      res.send(data);
    });
    app.post(`/${route}`, (req, res) => {
      const data = faker.fakeSchema(schema);
      res.send(data);
    });
    app.post(`/${route}/:id`, (req, res) => {
      const data = faker.fakeSchema(schema);
      data.id = req.params.id;
      res.send(data);
    });
    app.put(`/${route}/:id`, (req, res) => {
      const data = faker.fakeSchema(schema);
      data.id = req.params.id;
      res.send(data);
    });
    app.delete(`/${route}/:id`, (req, res) => {
      res.send({ deleted: true, id: req.params.id });
    });

    app.all(`/${route}/code/:code`, (req, res) => {
      let code = parseInt(req.params.code);
      if (typeof code !== "number") code = 500;
      res.status(code).send({
        code: code,
        body: req.body,
        query: req.query,
      });
    });
  }

  app.listen(argv.port, argv.host, () => {
    console.log(
      `The simple faker server is running at http://${argv.host}:${argv.port}`
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
      output: {
        alias: "o",
        description: "Write faked data to file",
        default: "",
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
    })
    .require(1, "Missing <schema json file> argument").argv;

  fakeServer(argv);
})();
