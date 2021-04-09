# simple-faker
[simple-faker](https://github.com/thangiswho/simple-faker) generates massive amount of json fake data with **zero coding**, based on data type and json schema.
Creating a mockup REST API even simplier by combining **simple-faker** and [json-server](https://github.com/typicode/json-server). 
[simple-faker](https://github.com/thangiswho/simple-faker) uses [faker.js](https://github.com/Marak/faker.js) to generate fake data.

## Getting started

Install simple-faker

```bash
# Using yarn
yarn add --dev @thangiswho/simple-faker
# Using npm
npm install --save-dev @thangiswho/simple-faker
```

**Typescript Usage**
```typescript
import {SimpleFaker} from "simple-faker";
```
**Javacript Usage**
```javascript
const {SimpleFaker} = require("simple-faker");
```

```typescript
const faker = new SimpleFaker(); // The default locale is en, data length is 10
// const faker = new SimpleFaker("ja", 20);
faker.fake("integer"); // return 75
faker.fake("integer(10,99)"); // return 2 digits number
faker.fake("html"); // return html string block

const userSchema = {
  "id": "integer",
  "username": "username(6,20)",
  "email": "email",
  "first_name": "name.firstName",
  "last_name": "name.lastName",
  "password": "password",
  "last_login": "datetime",
  "gender": "gender",
  "about": "Hello, my name is {{name.firstName}}. I was born in {{address.cityName}}.",
  "profile": "html(2,5)",
};
faker.fakeSchema(userSchema); // return object with the same schema

faker.fakeApi({
  "Users": userSchema,
  "Posts": {
    "id": "integer",
    "author": "username(5,30)",
    "content": "html(4,7)",
    "summary": "lorem.paragraphs(2,3)",
    "created_at": "datetime",
    "published": "boolean"
  }
});
/**
 * return json-server compatible mockup json
 * Data length of each data set is defined when initialized with new SimpleFaker(locale, dataLength)
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

With the cli **fake-data**, you can *simply create* a mock REST API with [json-server](https://github.com/typicode/json-server).
Firstly, create a *schema.json* file with content is as same as the schema passed to faker.fakeApi(schema).
Please refer to the sample schema: [schema.json](https://raw.githubusercontent.com/thangiswho/simple-faker/main/__tests__/schema.json).

```bash
yarn add --dev json-server
yarn fake-data -o mockupdb.json schema.json
json-server --watch mockupdb.json
```

Now if you go to http://localhost:3000/users/{id} or http://localhost:3000/users, you'll get your fake users.

## Usage

### Basic Types

```javascript
const faker = new SimpleFaker("en", 10); // The default locale is en, data length is 10
// const faker = new SimpleFaker();
// const faker = new SimpleFaker("ja", 20);
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
[simple-faker](https://github.com/thangiswho/simple-faker) supports all types from [faker.js](https://github.com/Marak/faker.js)

**Usage**: faker.fake(`${type}`) or faker.fake(`${group}.${type}`).
With some specific types which have one numeric argument, such as words, paragraphs, you can use the following api:
```javascript
faker.fake(`typename(${min},${max})`)
faker.fake(`group.typename(${min},${max})`)
```

Basically, [simple-faker](https://github.com/thangiswho/simple-faker) will try to find all grand-children properties of faker.js, it will call faker.js if there is any grand-child properties found.
[simple-faker](https://github.com/thangiswho/simple-faker) also supports faker.js' mustache format.

```javascript
faker.fake("address.city"); // same as faker.js's faker.address.city()
// simple-faker is smart to find city is property of address
faker.fake("city"); // same as faker.js's faker.address.city()

faker.fake("lorem.words(2,5)"); // same as faker.js's faker.lorem.words(n) with 2 <= n <= 5
// simple-faker is smart to find words is property of lorem
faker.fake("words"); // same as faker.js's faker.lorem.words()
faker.fake("{{name.lastName}} {{name.firstName}} lives in {{address.country}}");
```

### Fake Mock API
By using fakeSchema and fakeApi, you can simple generates massive amount of json data for mockup REST API.
Further more, you can fake schema nested by other schema.

```javascript
const otherSchema = {id: "integer(1000,9000)", message: "phrase"};
const accountSchema = {
  message: "{{name.lastName}} {{name.firstName}} lives in {{address.country}}",
  money: "{{finance.amount}} millions USD",
  crypto: "finance.bitcoinAddress",
  nested: {
    prop1: "phrase", // simple-faker knows that phase belongs to hacker.phrase
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

### Customized Types
You can easily add your own type, and then define it in your schema. All type name is case-insensitive.

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
## API Methods

### .bin/fake-data command
```bash
# npx fake-data schema.json
yarn fake-data --help
fake-data [options] <schema json file>

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -n, --length   The length of each generated data set             [default: 10]
  -l, --locale   The locale (eg. "ja", "de")                     [default: "en"]
  -o, --output   Write faked data to file                          [default: ""]

yarn fake-data schema.json
yarn fake-data -o mockupdb.json schema.json
```

Then, run a mockup [jsons-server](https://github.com/typicode/json-server)
```bash
json-server mockupdb.json
```

Now if you go to http://localhost:3000/users/{id} or http://localhost:3000/users, you'll get your fake users.

### SimpleFaker class
- fake: *faker.fake(dataType)* to fake a single data type
- fakeSchema: *faker.fakeSchema(objectType)* to fake a whole object
- fakeApi: *faker.fakeApi(apiSchema)* to run mockup json-server

### SimpleFaker.fake(dataType) Types list
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
