# schema-faker

![Build Status](https://img.shields.io/travis/com/thangiswho/schema-faker)
![Coverage Status](https://coveralls.io/repos/github/thangiswho/schema-faker/badge.svg)
[![npm](https://img.shields.io/npm/v/schema-faker)](https://www.npmjs.com/package/schema-faker)

[schema-faker](https://github.com/thangiswho/schema-faker) generates massive amount of json fake data with **zero coding**, based on data type and json schema.
It is also built with a simple faker server to serve mockup REST API.
`schema-faker` uses [faker.js](https://github.com/Marak/faker.js) to generate fake data.

```javascript
const faker = new SchemaFaker(); // The default locale is en, data length is 10
faker.fake("integer"); // return a number
faker.fake("html"); // return html paragraphs
faker.fakeSchema({
  id: "integer",
  username: "username(6,20)",
  email: "email",
  profile: {
    first_name: "name.firstName",
    last_name: "name.lastName",
    about: "Hello! I'm living in {{address.cityName}} with 2 kids and 1 {{animal.dog}}.",
  },
}); // return fake object with the defined schema
```

```bash
$ yarn fake-server -b /api/v1 schema.json
The simple faker server is running at http://localhost:3000/api/v1
```

![simple fake server](/docs/fake-server-1.jpg "simple fake server")

To create a **custom mockup API server**

```javascript
const path = require("path");
const express = require("express");
const { SchemaFaker, fakeRouter } = require("schema-faker");
const mockup = fakeRouter(path.resolve(__dirname, "schema.json"), {
  locale: "de",
});

const server = express();
server.use("/mockup/api", mockup); // simply use schema-faker's mockup router
server.get("/:locale/other-fake-api", (req, res) => {
  const len = req.query.length || 10;
  const faker = new SchemaFaker(req.params.locale, len);
  const data = faker.fakeApi({ prop: otherSchema });
  res.json(data.prop);
});
// ...
```
## Getting started

Install schema-faker

```bash
# Using yarn
yarn add --dev schema-faker
# Using npm
npm install --save-dev schema-faker
```

**Typescript usage**
```typescript
import { SchemaFaker } from "schema-faker";
```
**Javacript usage**
```javascript
const { SchemaFaker } = require("schema-faker");
```

```javascript
const faker = new SchemaFaker(); // The default locale is en, data length is 10
// const faker = new SchemaFaker("ja", 20);
faker.fake("integer"); // return a number
faker.fake("integer(10,99)"); // return 2 digits number
faker.fake("html"); // return html paragraphs
faker.fake("html(3,6"); // return html with paragraphs number is from 3 to 6

const userSchema = {
  id: "integer",
  username: "username(6,20)",
  email: "email",
  first_name: "name.firstName",
  last_name: "name.lastName",
  password: "password",
  last_login: "datetime",
  gender: "gender",
  profile: {
    first_name: "name.firstName",
    last_name: "name.lastName",
    about: "Hello! I'm living in {{address.cityName}} with 2 kids and 1 {{animal.dog}}.",
    bio: "html(2,5)",
  },
};
faker.fakeSchema(userSchema); // return fake object with the defined schema

faker.fakeApi({
  Users: userSchema,
  Posts: {
    id: "integer(100000,999999)",
    author: "username(5,30)",
    content: "html(4,7)",
    summary: "lorem.paragraphs(2,3)",
    created_at: "datetime",
    published: "boolean",
    tags: ["words(1,2)", "animal.type"],
  },
});
/**
 * return json-server compatible mockup json
 * Data length of each data set is defined when initialized with new SchemaFaker(locale, dataLength)
 * {
 *   "Users": [
 *     {
 *       "id": ...
 *       "username": ...
 *       ...
 *     },
 *     {
 *       "id": ...
 *       "username": ...
 *       ...
 *     }
 *   ],
 *   "Posts": [
 *     {
 *       "id": ...
 *       "author": ...
 *       ...
 *     },
 *     {
 *       "id": ...
 *       "author": ...
 *       ...
 *     }
 *   ],
 * ]

```

### CLI fake-server usage

With the cli **fake-server**, you can *simply create* a mock REST API with **zero coding**.
Firstly, create a *schema.json* file with content is as same as the schema passed to `faker.fakeApi(schema).`
Please refer to the sample schema: [schema.json](https://raw.githubusercontent.com/thangiswho/schema-faker/main/__tests__/schema.json).

```bash
# fake-server requires express
yarn add --dev express

# using npm
# npx fake-server --help
yarn fake-server --help
fake-server [options] <schema json file>

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -n, --length   The length of each generated data set             [default: 10]
  -l, --locale   The locale (eg. "ja", "de")                     [default: "en"]
  -p, --port     Set port                                        [default: 3000]
  -h, --host     Set host                                 [default: "localhost"]
  -b, --base     Set base url (e.g. /v2 or /api)                   [default: ""]

yarn fake-server -b /api/v1 schema.json
// The simple faker server is running at http://localhost:3000/api/v1
```

Now if you go to http://localhost:3000/api/v1/users or http://localhost:3000/api/v1/users/10346, you'll get your fake users.

![simple fake server](/docs/fake-server-1.jpg "simple fake server")
![simple fake server](/docs/fake-server-2.jpg "simple fake server")
![simple fake server](/docs/fake-server-3.jpg "simple fake server")

### CLI fake-data usage

If you just want to generate fake data to use it by your own way, please use the cli **fake-data**.
For example, you can use [json-server](https://github.com/typicode/json-server) to serve your fake data.

```bash
yarn fake-data --help
fake-data [options] <schema json file>

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -n, --length   The length of each generated data set             [default: 10]
  -l, --locale   The locale (eg. "ja", "de")                     [default: "en"]
  -o, --output   Write faked data to file                          [default: ""]

yarn fake-data -o mockupdb.json schema.json
# for example, use json-server to serve mockupdb.json
yarn add --dev json-server
json-server mockupdb.json
```

## Data Types

### Basic Types

```javascript
const faker = new SchemaFaker("en", 10); // The default locale is en, data length is 10
// const faker = new SchemaFaker();
// const faker = new SchemaFaker("ja", 20);
faker.setLocale("de"); // change locale after initialized
faker.setLength(15);  // change data length after initialized

const min = 10;
const max = 99;
faker.fakeInteger(min, max); // return 2 digits number
faker.fake("integer(10,99)"); // same as above
faker.fakeString(min, max); // return a string whose length between min and max.
faker.fake("string(10,99)"); // same as above

faker.fake("float(10,99)"); // same as faker.fakeFloat(10,99)
faker.fake("boolean"); // same as faker.fakeBoolean()
faker.fake("date"); // format yyyy-mm-dd
faker.fake("time"); // format h:i:s
faker.fake("datetime"); // format yyyy-mm-dd h:i:s
faker.fake("image"); // return a fake image url
faker.fake("name"); // return a fake full name
faker.fake("username(6,20)"); // return a fake alphanumeric string whose length is from 6 to 20 
faker.fake("html(2,4)"); // return a fake html paragraphs with number of paragraphs is between 2 to 4
```

### faker.js Types
[schema-faker](https://github.com/thangiswho/schema-faker) supports all types from [faker.js](https://github.com/Marak/faker.js)

**Usage**: faker.fake(`${type}`) or faker.fake(`${group}.${type}`).
With some specific types which have one numeric argument, such as words, paragraphs, you can use the following api:
```javascript
faker.fake(`typename(${min},${max})`)
faker.fake(`group.typename(${min},${max})`)
```

Basically, [schema-faker](https://github.com/thangiswho/schema-faker) will try to find all grand-children properties of faker.js, it will call faker.js if there is any grand-child properties found.
[schema-faker](https://github.com/thangiswho/schema-faker) also supports faker.js' mustache format.

```javascript
faker.fake("address.city"); // same as faker.js's faker.address.city()
// schema-faker is smart to find city is property of address
faker.fake("city"); // same as faker.js's faker.address.city()

faker.fake("lorem.words(2,5)"); // same as faker.js's faker.lorem.words(n) with 2 <= n <= 5
// schema-faker is smart to find words is property of lorem
faker.fake("words"); // same as faker.js's faker.lorem.words()
faker.fake("{{name.lastName}} {{name.firstName}} lives in {{address.country}}");
```

### Schema and API

By using fakeSchema and fakeApi, you can simply generate massive amount of json data for mockup REST API.
Further more, you can fake schema nested by other schema.

```javascript
const otherSchema = {id: "integer(1000,9000)", message: "phrase"};
const accountSchema = {
  message: "{{name.lastName}} {{name.firstName}} lives in {{address.country}}",
  money: "{{finance.amount}} millions USD",
  crypto: "finance.bitcoinAddress",
  nested: {
    prop1: "phrase", // schema-faker knows that phase belongs to hacker.phrase
    tags: ["word", "words(2,2)"],
    comments: [
      {commentId: "integer(1000,9999)", comment: "html(1,3)"},
      {commentId: "integer(100000,999999)", comment: "html(2,4)"}
    ],
    other: otherSchema
  }
};

faker.fakeSchema(accountSchema);
faker.fakeApi({
  "Users": userSchema,
  "Posts": {
    "id": "integer",
    "ref": otherSchema,
    "tags": ["word", "words(2,2)"],
    "comments": [otherSchema, otherSchema, otherSchema]
  },
  "Accounts": accountSchema
});
```

### Custom Types
You can easily add your own custom type, and then define it in your schema. All type names are case-insensitive.

```javascript
const categories = [
  faker.fake("string(6, 10)"),
  faker.fake("name"),
  faker.fake("words(2,3)"),
];
faker.addType("MyTax", () => {
  return faker.fakeInteger(1000,5000) * 21 / 100;
});
faker.addType("MyAccountSummary", (i,j) => {
  const rand = i + j;
  return "Debit: " + faker.fake("finance.amount") + " / Credit: " + rand.toString();
});
faker.addType("MyCategory", () => {
  return categories[faker.fakeInteger(0, categories.length - 1)];
});
faker.fake("MyCategory");
faker.fakeApi({
  "News": {
    "id": "integer",
    "title": "hacker.phrase",
    "content": "html(5,8)",
    "category": "mycategory", // great, I can add my own customized type
  },
  "Salaries": {
    "net": "integer(100000,120000)",
    "category": "mycategory", // great, I can add my own customized type
    "summary": "MyAccountSummary(500, 1000)", // type name is case-insensitive
    "tax": "mytax"  // wow, I can use as many customized types as I can
  }
});
```

## Your Custom Mockup API Server

### Your Custom Next.js Server
Developing a frontend app requires an API server, yet dealing browser CORS issue is troublesome.
You can create your own custom [Next.js](https://nextjs.org/) server built with [schema-faker](https://github.com/thangiswho/schema-faker) to serve both frontend and (mockup) backend.

```javascript
const path = require("path");
const next = require("next");
const express = require("express");
const { SchemaFaker, fakeRouter } = require("schema-faker");
const mockup = fakeRouter(path.resolve(__dirname, "schema.json"), {
  locale: "de",
});

const port = process.env.PORT || 3000;
const app = next({ dev: true });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();
    const otherSchema = { id: "integer", message: "lorem.sentence" };

    server.use("/mockup/api", mockup); // simply use schema-faker's mockup router
    server.get("/:locale/other-fake-api", (req, res) => {
      const len = req.query.length || 10;
      const faker = new SchemaFaker(req.params.locale, len);
      const data = faker.fakeApi({ prop: otherSchema });
      res.json(data.prop);
    });

    server.all("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(
        `> Fake Server for Next.js is ready on http://localhost:${port}`
      );
    });
  })
  .catch((err) => {
    console.log("Error:::::", err);
  });
```

## API Methods

### Fake Methods

- fake: *faker.fake(dataType)* to fake a single data type
- fakeSchema: *faker.fakeSchema(objectType)* to fake a whole object
- fakeApi: *faker.fakeApi(apiSchema)* to run mockup json-server

### Data Types List

You can define your schema type with any type from the following types.
```javascript
// schema.json
{
  "Api1": {
    "prop": "type",
    "prop": "type(min,max)"
  },
  "Api2": {
    "prop": "type",
    "prop": "group.type",
    "prop": "group.type(min,max)"
  }
}
```

- integer
- float
- boolean
- string
- date
- time
- datetime
- image
- name
- username
- html

- random.number
- random.float
- random.arrayElement
- random.arrayElements
- random.objectElement
- random.uuid
- random.boolean
- random.word
- random.words
- random.image
- random.locale
- random.alpha
- random.alphaNumeric
- random.hexaDecimal
- helpers.randomize
- helpers.slugify
- helpers.replaceSymbolWithNumber
- helpers.replaceSymbols
- helpers.replaceCreditCardSymbols
- helpers.repeatString
- helpers.regexpStyleStringParse
- helpers.shuffle
- helpers.mustache
- helpers.createCard
- helpers.contextualCard
- helpers.userCard
- helpers.createTransaction
- name.firstName
- name.lastName
- name.middleName
- name.findName
- name.jobTitle
- name.gender
- name.prefix
- name.suffix
- name.title
- name.jobDescriptor
- name.jobArea
- name.jobType
- address.zipCode
- address.zipCodeByState
- address.city
- address.cityPrefix
- address.citySuffix
- address.cityName
- address.streetName
- address.streetAddress
- address.streetSuffix
- address.streetPrefix
- address.secondaryAddress
- address.county
- address.country
- address.countryCode
- address.state
- address.stateAbbr
- address.latitude
- address.longitude
- address.direction
- address.cardinalDirection
- address.ordinalDirection
- address.nearbyGPSCoordinate
- address.timeZone
- animal.dog
- animal.cat
- animal.snake
- animal.bear
- animal.lion
- animal.cetacean
- animal.horse
- animal.bird
- animal.cow
- animal.fish
- animal.crocodilia
- animal.insect
- animal.rabbit
- animal.type
- company.suffixes
- company.companyName
- company.companySuffix
- company.catchPhrase
- company.bs
- company.catchPhraseAdjective
- company.catchPhraseDescriptor
- company.catchPhraseNoun
- company.bsAdjective
- company.bsBuzz
- company.bsNoun
- finance.account
- finance.accountName
- finance.routingNumber
- finance.mask
- finance.amount
- finance.transactionType
- finance.currencyCode
- finance.currencyName
- finance.currencySymbol
- finance.bitcoinAddress
- finance.litecoinAddress
- finance.creditCardNumber
- finance.creditCardCVV
- finance.ethereumAddress
- finance.iban
- finance.bic
- finance.transactionDescription
- image.image
- image.avatar
- image.imageUrl
- image.abstract
- image.animals
- image.business
- image.cats
- image.city
- image.food
- image.nightlife
- image.fashion
- image.people
- image.nature
- image.sports
- image.technics
- image.transport
- image.dataUri
- lorem.word
- lorem.words
- lorem.sentence
- lorem.slug
- lorem.sentences
- lorem.paragraph
- lorem.paragraphs
- lorem.text
- lorem.lines
- hacker.abbreviation
- hacker.adjective
- hacker.noun
- hacker.verb
- hacker.ingverb
- hacker.phrase
- internet.avatar
- internet.email
- internet.exampleEmail
- internet.userName
- internet.protocol
- internet.httpMethod
- internet.url
- internet.domainName
- internet.domainSuffix
- internet.domainWord
- internet.ip
- internet.ipv6
- internet.port
- internet.userAgent
- internet.color
- internet.mac
- internet.password
- database.column
- database.type
- database.collation
- database.engine
- phone.phoneNumber
- phone.phoneNumberFormat
- phone.phoneFormats
- date.past
- date.future
- date.between
- date.betweens
- date.recent
- date.soon
- date.month
- date.weekday
- time.recent
- commerce.color
- commerce.department
- commerce.productName
- commerce.price
- commerce.productAdjective
- commerce.productMaterial
- commerce.product
- commerce.productDescription
- system.fileName
- system.commonFileName
- system.mimeType
- system.commonFileType
- system.commonFileExt
- system.fileType
- system.fileExt
- system.directoryPath
- system.filePath
- system.semver
- git.branch
- git.commitEntry
- git.commitMessage
- git.commitSha
- git.shortSha
- vehicle.vehicle
- vehicle.manufacturer
- vehicle.model
- vehicle.type
- vehicle.fuel
- vehicle.vin
- vehicle.color
- vehicle.vrm
- vehicle.bicycle
- music.genre
- datatype.number
- datatype.float
- datatype.datetime
- datatype.string
- datatype.uuid
- datatype.boolean
- datatype.hexaDecimal
- datatype.json
- datatype.array
