import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  Router,
} from "express";
import { SchemaFaker, ApiSchema } from "./faker";
import * as fs from "fs";

interface FakerRouterOption {
  locale?: string;
  length?: number;
}

const getInt = (id: any) => {
  if (typeof id === "number") return id;
  const _id = parseInt(id, 10);
  return isNaN(_id) ? id : _id;
};

const cors: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, access_token"
  );
  res.header("Content-Type", "application/json");
  next();
};

export const fakeRouter = (
  apiShema: ApiSchema | string,
  options?: FakerRouterOption
): Router => {
  if (typeof apiShema === "string") {
    if (!fs.existsSync(apiShema)) {
      throw Error(`schema file [${apiShema}] does not exist!`);
    }
    apiShema = JSON.parse(fs.readFileSync(apiShema).toString());
  }
  if (typeof apiShema !== "object")
    throw TypeError("api schema must be object");

  const faker = new SchemaFaker(options?.locale, options?.length);
  const express = require("express");
  const router: Router = express.Router();
  router.use(cors);

  router.get("/", (req: Request, res: Response) => {
    let body =
      "<h2>A simple faker server!</h2>" +
      "<p><b>Schemas</b>: " +
      Object.keys(apiShema).join(", ") +
      "</p>" +
      "<p><b>Routes</b>: <br/><ul>" +
      "<li>GET/POST/PUT/DELETE /code/:code (status code is between 200 and 500)</li>" +
      "</ul></p>";

    Object.keys(apiShema).forEach((k) => {
      const route = k.toLowerCase();
      const id = faker.fake("integer");

      body +=
        `<p><div>/${route}</div><ul>` +
        [
          `<li>GET /${route}</li>`,
          `<li>GET /${route}/${id}</li>`,
          `<li>POST /${route}</li>`,
          `<li>POST /${route}/${id}</li>`,
          `<li>PUT /${route}/${id}</li>`,
          `<li>DELETE /${route}/${id}</li>`,
          `<li>ALL /${route}/code/:code (status code is between 200 and 500)</li>`,
        ].join("") +
        "</ul></p>";
    });

    res.header("Content-Type", "text/html");
    res.send(body);
  });

  router.all(`/code/:code`, (req: Request, res: Response) => {
    let code = parseInt(req.params.code, 10);
    if (typeof code !== "number" || code < 200 || code > 500) code = 500;

    res.status(code).send({
      code,
      message: faker.fake("lorem.sentence"),
      errors: {
        type: faker.fake("database.type"),
        message: faker.fake("hacker.phrase"),
      },
    });
  });

  for (const [prop, schema] of Object.entries(apiShema)) {
    const route = prop.toLowerCase();

    router.get(`/${route}`, (req: Request, res: Response) => {
      const data = faker.fakeApi({ prop: schema });
      res.json(data.prop);
    });
    router.get(`/${route}/:id`, (req: Request, res: Response) => {
      const data = faker.fakeSchema(schema);
      data.id = getInt(req.params.id);
      res.json(data);
    });
    router.post(`/${route}`, (req: Request, res: Response) => {
      const data = faker.fakeSchema(schema);
      res.json(data);
    });
    router.post(`/${route}/:id`, (req: Request, res: Response) => {
      const data = faker.fakeSchema(schema);
      data.id = getInt(req.params.id);
      res.json(data);
    });
    router.put(`/${route}/:id`, (req: Request, res: Response) => {
      const data = faker.fakeSchema(schema);
      data.id = getInt(req.params.id);
      res.json(data);
    });
    router.delete(`/${route}/:id`, (req: Request, res: Response) => {
      res.json({ deleted: true, id: getInt(req.params.id) });
    });

    router.all(`/${route}/code/:code`, (req: Request, res: Response) => {
      let code = parseInt(req.params.code, 10);
      if (typeof code !== "number" || code < 200 || code > 500) code = 500;

      res.status(code).json({
        code,
        message: faker.fake("lorem.sentence"),
        errors: {
          type: route,
          message: faker.fake("hacker.phrase"),
        },
      });
    });
  }

  return router;
};
