import { SchemaFaker } from "../src";

const faker = new SchemaFaker("en", 2);

test("fakerjs types", () => {
  for (const [prop, obj] of Object.entries(faker.faker)) {
    if (prop !== "mersenne" && typeof obj === "object") {
      for (const [childProp, func] of Object.entries(obj)) {
        if (typeof func === "function") {
          const t = prop + "." + childProp;
          expect(faker.fake(t)).toBeDefined();
        }
      }
    }
  }
});

test("fakerjs type ERROR", () => {
  let t = "system.fileExt";
  const min = faker.fake("integer(0,5)");
  const max = faker.fake("integer(6, 10)");
  expect(() => faker.fake(`${t}(${min},${max})`)).toThrow(TypeError);

  t = "finance.creditCardNumber";
  expect(() => faker.fake(`${t}(${min},${max})`)).toThrow(TypeError);
});
