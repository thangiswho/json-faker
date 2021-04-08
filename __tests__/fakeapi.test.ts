import { SimpleFaker, Schema, ApiSchema } from "../src";
import * as fs from "fs";
import * as path from "path";

const userSchema: Schema = {
  id: "integer",
  username: "username",
  first_name: "name.firstName",
  last_name: "name.lastName",
  password: "password",
  last_login: "datetime",
  gender: "gender",
  slogan: "phrase",
  message: "sentences(2,5)",
  about: "html(1,3)",
};

const hobbiesSchema: Schema = {
  cat: "image.cats",
  homepage: "url",
  tags: ["word", "words(1,2)"],
  hobbies:
    "Vehicle: {{vehicle.vehicle}}, animal: {{animal.dog}}, and {{music.genre}}",
};
const nestedSchema: Schema = {
  code: "database.type",
  money: "{{finance.amount}} millions USD",
  crypto: "finance.bitcoinAddress",
  slogan: "phrase",
  debit: "integer(10000, 50000)",
  hacker: "hacker.noun",
  hobbies: hobbiesSchema,
};
const superNestedSchema: Schema = {
  id: "integer",
  gender: "name.gender",
  phone: "{{phone.phoneNumber}}",
  message: "{{name.lastName}} {{name.firstName}} lives in {{address.country}}",
  country: "country",
  animal: "bird",
  pets:
    "{{datatype.number}} {{animal.lion}}, {{datatype.float}} {{animal.rabbit}}",
  nested: nestedSchema,
};

test("fakeSchema simple", () => {
  const faker = new SimpleFaker();

  const user = faker.fakeSchema(userSchema);
  for (const [prop, value] of Object.entries(userSchema)) {
    expect(user).toHaveProperty(prop);
  }

  const hobbies = faker.fakeSchema(hobbiesSchema);
  for (const [prop, value] of Object.entries(hobbiesSchema)) {
    expect(hobbies).toHaveProperty(prop);
    if (prop === "tags") {
      expect(Array.isArray(value)).toBe(true);
      expect((value as string[]).length).toBe(2);
    }
  }
});

test("fakeSchema nested", () => {
  const dataLength = 2;
  const faker = new SimpleFaker("ja", dataLength);

  const superNested: Schema = faker.fakeSchema(superNestedSchema);
  const nested: Schema = superNested["nested"] as Schema;
  const hobbies: Schema = nested["hobbies"] as Schema;

  expect(superNested).toBeTruthy();
  expect(nested).toBeTruthy();
  expect(hobbies).toBeTruthy();

  for (const [prop, value] of Object.entries(superNestedSchema)) {
    expect(superNested).toHaveProperty(prop);
  }

  for (const [prop, value] of Object.entries(nestedSchema)) {
    expect(nested).toHaveProperty(prop);
  }

  for (const [prop, value] of Object.entries(hobbiesSchema)) {
    expect(hobbies).toHaveProperty(prop);
  }
});

test("fakeApi", () => {
  const dataLength = 15;
  const faker = new SimpleFaker("ja", 15);
  const apiSchema: ApiSchema = {
    User: userSchema,
    Hobby: hobbiesSchema,
  };

  const api = faker.fakeApi(apiSchema);
  expect(Object.keys(api).length).toBe(2);
  expect(api).toHaveProperty("User");
  expect(api).toHaveProperty("Hobby");

  const users: Schema[] = api["User"] as Schema[];
  const hobbies: Schema[] = api["Hobby"] as Schema[];

  expect(users.length).toBe(dataLength);
  expect(hobbies.length).toBe(dataLength);

  users.forEach((user) => {
    for (const [prop, value] of Object.entries(userSchema)) {
      expect(user).toHaveProperty(prop);
    }
  });
  hobbies.forEach((hobby) => {
    for (const [prop, value] of Object.entries(hobbiesSchema)) {
      expect(hobby).toHaveProperty(prop);
    }
  });
});

test("fakeApi more", () => {
  const dataLength = 3;
  const schemaFile = path.resolve(__dirname, "schema.json");
  const mySchema = JSON.parse(fs.readFileSync(schemaFile).toString());

  const apiSchemas: ApiSchema[] = [
    {
      User: userSchema,
      Hobby: hobbiesSchema,
      Secret: nestedSchema,
    },
    {
      User: userSchema,
      Hobby: hobbiesSchema,
      Secret: nestedSchema,
      SuperNest: superNestedSchema,
    },
    mySchema,
  ];

  for (let i = 1; i < 11; i++) {
    const faker = new SimpleFaker("de", i);
    apiSchemas.forEach((schema) => {
      const api = faker.fakeApi(schema);
      expect(Object.keys(api).length).toBe(Object.keys(schema).length);
      expect(Object.keys(api)).toMatchObject(Object.keys(schema));

      for (const [prop, data] of Object.entries(api)) {
        expect(data.length).toBe(i);
      }
    });
  }
});
