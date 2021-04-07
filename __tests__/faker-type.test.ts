import SimpleFaker from '../src';

const faker = new SimpleFaker('en', 10);

(() => {
  for (const [prop, func] of Object.entries(faker)) {
    if (prop.match(/^fake.+$/) && prop !== 'fakeSchema' && prop !== 'fakeApi'
      && typeof func === 'function'
    ) {
      const t = prop.slice(4).toLowerCase();
      test("simple-faker type "+t, () => {
        expect(faker.fake(t)).toBeDefined();
      });
    }
  }
})();

(() => {
  for (const [prop, obj] of Object.entries(faker.faker)) {
    if (prop !=='mersenne' && typeof obj === "object") {
      for (const [childProp, func] of Object.entries(obj as Object)) {
        if (typeof func === "function") {
          const t = prop + "." + childProp;
          test("fakerjs type "+t, () => {
            expect(faker.fake(t)).toBeDefined();
          });
          
        }
      }
    }
  }
})();
