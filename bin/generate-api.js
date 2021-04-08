#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const README_FILE = "README.md";
const { SimpleFaker } = require("../dist");
const faker = new SimpleFaker();

let readme = fs.readFileSync(
  path.resolve(__dirname, "..", "." + README_FILE)
).toString();

let apis = [];
for (const [prop, obj] of Object.entries(faker.faker)) {
  if (prop !== "mersenne" && typeof obj === "object") {
    for (const [childProp, func] of Object.entries(obj)) {
      if (typeof func === "function") {
        const t = prop + "." + childProp;
        apis += "- " + t + "\n";
      }
    }
  }
}

readme = readme.replace("{{FakerJS.Types}}", apis);

fs.writeFileSync(
  path.resolve(__dirname, "..", README_FILE),
  readme
);
console.log("Generte-api done!");