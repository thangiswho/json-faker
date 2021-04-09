import { SimpleFaker } from "../src";

const faker = new SimpleFaker("en", 2);

for (const [prop, obj] of Object.entries(faker.faker)) {
  if (prop !== "mersenne" && typeof obj === "object") {
    for (const [childProp, func] of Object.entries(obj)) {
      if (typeof func === "function") {
        const t = prop + "." + childProp;
        test("fakerjs type " + t, () => {
          expect(faker.fake(t)).toBeDefined();
        });
      }
    }
  }
}
