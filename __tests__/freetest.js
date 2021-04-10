const { SchemaFaker } = require("../dist");
const fs = require("fs");
const path = require("path");

const faker = new SchemaFaker("ja");
test("test dist", () => {
  expect(faker).toBeDefined();

  expect(faker.fakeInteger(125, 125)).toBe(125);
  expect(faker.fake("integer(0, 9)").toString().length).toBe(1);
  expect(faker.fake("integer(10, 99)").toString().length).toBe(2);

  const apiSchema = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "schema.json"))
  );
  faker.fakeApi(apiSchema);

  const userSchema = {
    name: "name.firstName",
    email: "email",
    tags: ["word", "words(1,2)", "database.type"],
    photos: [
      {
        image: "image",
        photoId: "integer",
      },
      {
        image: "image",
        photoId: "integer",
      },
    ],
  };

  faker.fakeSchema(userSchema);

  const categories = [
    faker.fake("string(6, 10)"),
    faker.fake("name"),
    faker.fake("words(2,3)"),
  ];
  faker.addType("MyTax", () => {
    return (faker.fakeInteger(1000, 5000) * 21) / 100;
  });
  faker.addType("MyAccountSummary", (i, j) => {
    const rand = i + j;
    return (
      "Debit: " + faker.fake("finance.amount") + " / Credit: " + rand.toString()
    );
  });
  faker.addType("MyCategory", () => {
    return categories[faker.fakeInteger(0, categories.length - 1)];
  });
  faker.fake("MyCategory");
  faker.fakeApi({
    News: {
      id: "integer",
      title: "hacker.phrase",
      content: "html(5,8)",
      category: "mycategory", // great, I can add my own customized type
    },
    Salaries: {
      net: "integer(100000,120000)",
      category: "mycategory", // great, I can add my own customized type
      summary: "MyAccountSummary(500, 1000)", // type name is case-insensitive
      tax: "mytax", // wow, I can use as many customized types as I can
    },
  });

  const otherSchema = { id: "integer(1000,9000)", message: "phrase" };
  const accountSchema = {
    message:
      "{{name.lastName}} {{name.firstName}} lives in {{address.country}}",
    money: "{{finance.amount}} millions USD",
    crypto: "finance.bitcoinAddress",
    nested: {
      prop1: "phrase", // schema-faker knows that phase belongs to hacker.phrase
      tags: ["word", "words(2,2)"],
      comments: [
        { commentId: "integer(1000,9999)", comment: "html(1,3)" },
        { commentId: "integer(100000,999999)", comment: "html(2,4)" },
      ],
      other: otherSchema,
    },
  };

  faker.fakeSchema(accountSchema);
  faker.fakeApi({
    Users: userSchema,
    Posts: {
      id: "integer",
      ref: otherSchema,
      tags: ["word", "words(2,2)"],
      comments: [otherSchema, otherSchema, otherSchema],
    },
    Accounts: accountSchema,
  });
});
