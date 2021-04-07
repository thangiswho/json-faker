import SimpleFaker from '../src';

const faker = new SimpleFaker('en', 10);

test("callback type", () => {
  expect(() => faker.fake("MyCategory")).toThrow(TypeError);
  expect(() => faker.fake("MyInteger")).toThrow(TypeError);
  expect(() => faker.fake("MyInteger2")).toThrow(TypeError);

  const anotherFaker = new SimpleFaker('en', 10);
  const categories = [
    faker.fake("string"),
    faker.fakeString(),
    faker.fakeName(),
    faker.fakeUsername(),
    faker.fake("username")
  ];
  anotherFaker.addType('MyCategory', () => {
    return categories[faker.fakeInteger(0, categories.length - 1)];
  });
  anotherFaker.addType('MyInteger', faker.fakeInteger)
  anotherFaker.addType('MyInteger2', (i,j) => i+j);

  Array(categories.length).map(() => {
    expect(categories).toContain(anotherFaker.fake("Mycategory"));
  });

  expect(anotherFaker.fake("MyInteger")).toBeGreaterThanOrEqual(0);
  expect(() => anotherFaker.fake("MyInteger()")).toThrow(TypeError);
  expect(() => anotherFaker.fake("MyInteger(100,)")).toThrow(TypeError);
  expect(() => anotherFaker.fake("MyInteger2(100,200")).toThrow(TypeError);
  expect(anotherFaker.fake("MyInteger2")).toBeNaN();
  expect(anotherFaker.fake("MyInteger(106,106)")).toBe(106);
  expect(anotherFaker.fake("MyInteger2(5,10)")).toBe(5+10);
});
