const { SimpleFaker } = require("../dist");

const faker = new SimpleFaker("ja");
test("test dist", () => {
  expect(faker).toBeDefined();

  expect(faker.fakeInteger(125, 125)).toBe(125);
  expect(faker.fake("integer(0, 9)").toString().length).toBe(1);
  expect(faker.fake("integer(10, 99)").toString().length).toBe(2);

  console.log(
    faker.fakeSchema({
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
    })
  );
});
