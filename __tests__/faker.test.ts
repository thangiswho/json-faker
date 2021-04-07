import SimpleFaker from '../src';

const faker = new SimpleFaker('en', 10);
const fakerJa = new SimpleFaker('ja', 10);

test('SimpleFaker Constructor', () => {
  expect(faker).toBeDefined();
  expect(fakerJa).toBeDefined();
});

test('fakeInteger', () => {
  const min = faker.fakeInteger(0,1000);
  const max = min + faker.fakeInteger(1,10000);
  Array(5).map(() => {
    expect(faker.fakeInteger(min, max)).toBeGreaterThanOrEqual(min);
    expect(faker.fakeInteger(min, max)).toBeLessThanOrEqual(max);
  });
  Array(5).map(() => {
    const i = faker.fakeInteger(-20000,20000);
    expect(faker.fakeInteger(i, i)).toBe(i);
    
    const j = faker.fakeInteger(i, i+2);
    expect([i, i+1, i+2]).toContain(j);
  });
});


test("fakeDate", () => {

});

test("simple fake", () => {
  const types = ["string", "username", "name", "datetime", "date", "time", "phrase", "words", "sentences", "paragraphs", "html"];
  types.forEach((t) => {

    expect(faker.fake(t)).toBeTruthy();
    expect(typeof faker.fake(t) === 'string').toBe(true);
    expect(typeof faker.fake(t + "(3,6)") === 'string').toBe(true);
  });
});

test('Unknown type', () => {
  expect(() => faker.fake("unknown")).toThrow(TypeError);
  expect(() => faker.fake("category")).toThrow(TypeError);
  expect(() => faker.fake("address")).toThrow(TypeError);
  expect(faker.fake("address.city")).toBeDefined();

});

test("Callback type", () => {
  expect(() => faker.fake("Mycategory")).toThrow(TypeError);
  expect(() => faker.fake("MyInteger")).toThrow(TypeError);
  expect(() => faker.fake("MyInteger2")).toThrow(TypeError);

  const anotherSimpleFaker = new SimpleFaker('en', 10);
  const categories = [
    faker.fake("string"),
    faker.fakeString(),
    faker.fakeName(),
    faker.fakeUsername(),
    faker.fake("username")
  ];
  anotherSimpleFaker
    .addType('Mycategory', () => {
      return categories[faker.fakeInteger(0, categories.length - 1)];
    })
    .addType('MyInteger', faker.fakeInteger)
    .addType('MyInteger2', (i,j) => i+j);

  Array(categories.length).map(() => {
    expect(categories).toContain(anotherSimpleFaker.fake("Mycategory"));
  });

  expect(anotherSimpleFaker.fake("MyInteger")).toBeGreaterThanOrEqual(0);
  expect(anotherSimpleFaker.fake("MyInteger(106,107)")).toBeGreaterThanOrEqual(106);
  expect(anotherSimpleFaker.fake("MyInteger2(5,10")).toBe(5+10);
});
