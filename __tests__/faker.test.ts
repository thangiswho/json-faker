import { SchemaFaker } from "../src";

const faker = new SchemaFaker("en", 10);
const fakerJa = new SchemaFaker("ja", 10);

test("SchemaFaker Constructor", () => {
  expect(faker).toBeDefined();
  expect(fakerJa).toBeDefined();
});

test("fakeInteger", () => {
  expect(faker.fakeInteger(125)).toBeGreaterThanOrEqual(125);
  expect(faker.fakeInteger(125, 125)).toBe(125);
  expect(faker.fake("integer(0, 9)").toString().length).toBe(1);
  expect(faker.fake("integer(10, 99)").toString().length).toBe(2);
  expect(
    parseInt(faker.fake("integer(125, 500)").toString())
  ).toBeGreaterThanOrEqual(125);
  expect(parseInt(faker.fake("integer(500, 500)").toString())).toBe(500);

  const min = faker.fakeInteger(0, 1000);
  const max = min + faker.fakeInteger(1, 10000);
  Array(5).map(() => {
    expect(faker.fakeInteger(min, max)).toBeGreaterThanOrEqual(min);
    expect(faker.fakeInteger(min, max)).toBeLessThanOrEqual(max);
    const t = "integer(" + min.toString() + "," + min.toString() + ")";
    expect(faker.fake(t)).toBe(min);
  });

  Array(5).map(() => {
    const i = parseInt(fakerJa.fake("integer(-20000,20000)").toString(), 10);
    expect(fakerJa.fakeInteger(i, i)).toBe(i);

    const j = fakerJa.fakeInteger(i, i + 2);
    expect([i, i + 1, i + 2]).toContain(j);
  });
});

test("fakeFloat", () => {
  expect(faker.fakeFloat(10.5)).toBeGreaterThanOrEqual(10.5);
  expect(faker.fakeFloat(1560.51, 1560.52)).toBeLessThanOrEqual(1560.52);
  expect(faker.fake("float(10, 99)").toString().length).toBeLessThanOrEqual(5);
  expect(
    faker.fake("float(1000000, 9999999)").toString().length
  ).toBeLessThanOrEqual(10);
  expect(faker.fakeFloat(1000.51, 1000.511)).toBeLessThanOrEqual(1000.52);
});

test("fakeBoolean", () => {
  expect(typeof faker.fakeBoolean()).toBe("boolean");
  expect(typeof faker.fake("boolean")).toBe("boolean");
});

test("fakeString", () => {
  expect(typeof fakerJa.fakeString()).toBe("string");
  expect(typeof fakerJa.fake("string")).toBe("string");

  expect(typeof fakerJa.fakeImage()).toBe("string");
  expect(typeof fakerJa.fake("image")).toBe("string");

  expect(typeof fakerJa.fakeName()).toBe("string");
  expect(typeof fakerJa.fake("name")).toBe("string");

  expect(typeof fakerJa.fakeUsername()).toBe("string");
  expect(typeof fakerJa.fake("username")).toBe("string");

  expect(typeof fakerJa.fakeHtml()).toBe("string");
  expect(typeof fakerJa.fake("html")).toBe("string");
});

test("fakeDatetime", () => {
  expect(faker.fakeDate().length).toBe("2020-01-01".length);
  expect(faker.fake("date").toString().length).toBe("2020-01-01".length);

  expect(faker.fakeTime().length).toBe("00:00:00".length);
  expect(faker.fake("time").toString().length).toBe("00:00:00".length);

  expect(faker.fakeDatetime().length).toBe("2020-01-01 00:00:00".length);
  expect(faker.fake("datetime").toString().length).toBe(
    "2020-01-01 00:00:00".length
  );

  const toInt = (d: Date) => {
    return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
  };
  const d1 = new Date(2021, 2, 27);
  Array(5).map(() => {
    const d = new Date(faker.fakeDate("2021-02-28"));
    expect(toInt(d)).toBeGreaterThan(toInt(d1));
  });
});

test("simple fake", () => {
  const types = [
    "string",
    "username",
    "name",
    "datetime",
    "date",
    "time",
    "html",
  ];
  types.forEach((t) => {
    expect(faker.fake(t)).toBeTruthy();
    expect(typeof faker.fake(t) === "string").toBe(true);
    expect(typeof faker.fake(t + "(3,6)") === "string").toBe(true);
  });
});

test("fakerjs", () => {
  expect(typeof faker.fake("address.zipCode")).toBe("string");
  expect(typeof faker.fake("animal.dog")).toBe("string");
  expect(typeof faker.fake("commerce.productMaterial")).toBe("string");
  expect(typeof fakerJa.fake("lorem.words")).toBe("string");
  expect(typeof fakerJa.fake("hacker.phrase")).toBe("string");
  expect(typeof fakerJa.fake("lorem.sentences")).toBe("string");
  expect(typeof fakerJa.fake("lorem.sentences(1,2)")).toBe("string");
  expect(typeof fakerJa.fake("lorem.paragraphs(2,4)")).toBe("string");

  expect(
    faker.fake(
      "{{company.companyName}} KEY1 {{commerce.productMaterial}} KEY2 {{database.type}} KEY3 {{finance.account}}"
    )
  ).toMatch(/^.+ KEY1 .+ KEY2 .+ KEY3 .+$/);
});

test("Unknown type", () => {
  expect(() => faker.fake("unknown")).toThrow(TypeError);
  expect(() => faker.fake("category")).toThrow(TypeError);
  expect(() => faker.fake("address")).toThrow(TypeError);
  expect(faker.fake("address.city")).toBeDefined();
});
