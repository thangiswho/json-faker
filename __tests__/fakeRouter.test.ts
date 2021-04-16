import { ApiSchema, fakeRouter } from "../src";
import type { Test, CallbackHandler } from "supertest";
import * as supertest from "supertest";
import * as express from "express";
import * as path from "path";

type SuperTestMethod = (url: string, callback?: CallbackHandler) => Test;

const request = (app: any, method: string): SuperTestMethod => {
  switch (method.toLowerCase()) {
    case "get":
      return supertest(app).get;
    case "post":
      return supertest(app).post;
    case "put":
      return supertest(app).put;
    case "delete":
      return supertest(app).delete;
    case "options":
      return supertest(app).options;
    default:
      throw new TypeError(`method ${method} is not allowed!`);
  }
};

const DATA_LENGTH = 4;
const schemaFile = path.resolve(__dirname, "schema.json");

const apiSchema: ApiSchema = {
  users: {
    id: "integer",
    username: "username",
    password: "password",
  },
  profiles: {
    id: "integer",
    userid: "integer",
    first_name: "name.firstName",
    last_name: "name.lastName",
    last_login: "datetime",
    about: "<div>{{hacker.phrase}}</div><p>I love {{animal.dog}}</p>",
  },
};

test("constructor", () => {
  expect(fakeRouter(apiSchema)).toBeDefined();
  expect(fakeRouter(apiSchema, { locale: "ja" })).toBeDefined();
  expect(fakeRouter(apiSchema, { length: 2 })).toBeDefined();
  expect(fakeRouter(apiSchema, { locale: "fr", length: 2 })).toBeDefined();

  expect(fakeRouter(schemaFile)).toBeDefined();
  expect(fakeRouter(schemaFile, { locale: "de" })).toBeDefined();
  expect(fakeRouter(schemaFile, { length: 2 })).toBeDefined();
  expect(fakeRouter(schemaFile, { locale: "en", length: 2 })).toBeDefined();
});

test("ERROR", () => {
  let t: any = "unknown.json";
  expect(() => fakeRouter(t)).toThrow(Error);

  t = "freetest.js";
  expect(() => fakeRouter(t)).toThrow(Error);

  t = 500;
  expect(() => fakeRouter(t)).toThrow(Error);
});

["", "/api/v1"].forEach((base) => {
  const router = fakeRouter(apiSchema, { locale: "fr", length: DATA_LENGTH });
  const app = express();
  app.use(base, router);

  test(`GET ${base}/`, () => {
    ["", "/"].forEach(async (path) => {
      const res = await request(app, "get")(base);
      expect(res.status).toEqual(200);
      expect(res.type).toContain("text/html");
      expect(res.header).toMatchObject({
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,PUT,POST,DELETE",
        "access-control-allow-headers":
          "Content-Type, Authorization, access_token",
      });
      expect(res.text).toContain("faker server");
      expect(res.text).toContain("/users");
      expect(res.text).toContain("/users/code");
      expect(res.text).toContain("/profiles");
      expect(res.text).toContain("/profiles/code");
      expect(res.text).toContain("/code");
    });
  });

  test("404", async () => {
    const res = await request(app, "get")(base.length ? "" : "/unknown");
    expect(res.status).toEqual(404);
  });

  test(`GET ${base}/code/:code`, () => {
    [200, 300, 400, 404, 500].forEach(async (code) => {
      const res = await request(app, "get")(`${base}/code/${code}`);
      expect(res.status).toEqual(code);
      expect(res.body.code).toBe(code);
      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("errors");
    });
  });

  Object.keys(apiSchema).forEach(async (key) => {
    const id = 1500;

    test(`GET ${base}/${key}`, async () => {
      const res = await request(app, "GET")(`${base}/${key}`);
      expect(res.status).toEqual(200);
      expect(res.type).toContain("application/json");
      expect(res.header).toMatchObject({
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,PUT,POST,DELETE",
        "access-control-allow-headers":
          "Content-Type, Authorization, access_token",
      });
      expect(res.body.length).toEqual(DATA_LENGTH);
      expect(res.body[0]).toHaveProperty("id");
      if (key === "users") {
        expect(res.body[0]).toHaveProperty("password");
      }
      if (key === "profiles") {
        expect(res.body[0]).toHaveProperty("about");
      }
    });

    test(`POST ${base}/${key}`, async () => {
      const res = await request(app, "POST")(`${base}/${key}`);
      expect(res.status).toEqual(200);
      expect(res.body).toHaveProperty("id");

      if (key === "users") {
        expect(res.body).toHaveProperty("password");
      }
      if (key === "profiles") {
        expect(res.body).toHaveProperty("about");
      }
    });

    ["GET", "POST", "PUT", "DELETE"].forEach((method) => {
      test(`${method} ${base}/${key}/:id`, () => {
        [1500, -3, "hello"].forEach(async (id) => {
          const res = await request(app, method)(`${base}/${key}/${id}`);
          expect(res.status).toEqual(200);
          expect(res.body.id).toBe(id);

          if (method.toUpperCase() !== "DELETE") {
            if (key === "users") {
              expect(res.body).toHaveProperty("password");
            }
            if (key === "profiles") {
              expect(res.body).toHaveProperty("about");
            }
          }
        });
      });
    });

    test(`GET ${base}/${key}/code/:code`, () => {
      [200, 300, 400, 404, 500].forEach(async (code) => {
        const res = await request(app, "get")(`${base}/${key}/code/${code}`);
        expect(res.status).toEqual(code);
        expect(res.body.code).toBe(code);
      });
    });
  });
});
