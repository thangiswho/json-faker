import { FakeFunction, SimpleFaker } from "../src";

test("callback type", () => {
  const faker = new SimpleFaker("en", 2);
  const anotherFaker = new SimpleFaker("en", 10);

  expect(() => faker.fake("MyCategory")).toThrow(TypeError);
  expect(() => faker.fake("MyInteger")).toThrow(TypeError);
  expect(() => faker.fake("MyInteger2")).toThrow(TypeError);
  const categories = [
    faker.fake("string"),
    faker.fakeString(),
    faker.fakeName(),
    faker.fakeUsername(),
    faker.fake("username"),
  ];
  anotherFaker.addType("MyCategory", () => {
    return categories[faker.fakeInteger(0, categories.length - 1)];
  });
  anotherFaker.addType("MyInteger", faker.fakeInteger);
  anotherFaker.addType("MyInteger2", (i = 1, j = 2) => i + j);

  Array(categories.length).map(() => {
    expect(categories).toContain(anotherFaker.fake("Mycategory"));
  });

  expect(anotherFaker.fake("MyInteger")).toBeGreaterThanOrEqual(0);
  expect(() => anotherFaker.fake("MyInteger()")).toThrow(TypeError);
  expect(() => anotherFaker.fake("MyInteger(100,)")).toThrow(TypeError);
  expect(() => anotherFaker.fake("MyInteger2(100,200")).toThrow(TypeError);
  expect(anotherFaker.fake("MyInteger2")).toBe(3);
  expect(anotherFaker.fake("MyInteger(106,106)")).toBe(106);
  expect(anotherFaker.fake("MyInteger2(5,10)")).toBe(5 + 10);
});

test("callback type", () => {
  const faker = new SimpleFaker("fr", 2);

  expect(() => faker.fake("ErrorType")).toThrow(TypeError);
  faker.addType("ErrorType", () => {
    const t = faker.fake("database.type") as string;
    return "Error" + t.charAt(0).toUpperCase() + t.slice(1);
  });

  expect(faker.fake("ErrorType")).toBeTruthy();
  expect(faker.fake("ErrorType")).toMatch(/^Error[A-Z].+$/);
});
