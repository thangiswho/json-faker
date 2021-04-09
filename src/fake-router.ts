import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  Router,
} from "express";
import { SimpleFaker, ApiSchema } from "./simple-faker";
import * as fs from "fs";

interface FakerRouterOption {
  locale: string;
  length: number;
}

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

  // intercept OPTIONS method
  if ("OPTIONS" === req.method) {
    res.send(200);
  } else {
    next();
  }
};

export const fakeRouter = (
  apiShema: ApiSchema | string,
  options?: FakerRouterOption
): Router => {
  if (typeof apiShema === "string") {
    if (!fs.existsSync(apiShema)) {
      throw TypeError(`schema file [${apiShema}] does not exist!`);
    }
    apiShema = JSON.parse(fs.readFileSync(apiShema).toString());
  }
  if (typeof apiShema !== "object")
    throw TypeError("api schema must be object");

  const faker = new SimpleFaker(options?.locale, options?.length);
  const router = Router();
  router.use(cors);

  router.get("/", (req, res) => {
    let body =
      "<h2>A simple faker server!</h2>" +
      "<br/><br/>" +
      "<p>Routes: <br/><ul>" +
      "<li>GET/POST/PUT/DELETE /code/:code (status code is between 200 and 500)</li>" +
      "</ul></p>";

    Object.keys(apiShema).forEach((k) => {
      const route = k.toLowerCase();
      const id = faker.fake("integer");

      body +=
        "<p><ul>" +
        [
          `<li>GET /${route}</li>`,
          `<li>GET /${route}/:id</li>`,
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
      res.send(data.prop);
    });
    router.get(`/${route}/:id`, (req: Request, res: Response) => {
      const data = faker.fakeSchema(schema);
      data.id = req.params.id;
      res.send(data);
    });
    router.post(`/${route}`, (req: Request, res: Response) => {
      const data = faker.fakeSchema(schema);
      res.send(data);
    });
    router.post(`/${route}/:id`, (req: Request, res: Response) => {
      const data = faker.fakeSchema(schema);
      data.id = req.params.id;
      res.send(data);
    });
    router.put(`/${route}/:id`, (req: Request, res: Response) => {
      const data = faker.fakeSchema(schema);
      data.id = req.params.id;
      res.send(data);
    });
    router.delete(`/${route}/:id`, (req: Request, res: Response) => {
      res.send({ deleted: true, id: req.params.id });
    });

    router.all(`/${route}/code/:code`, (req: Request, res: Response) => {
      let code = parseInt(req.params.code, 10);
      if (typeof code !== "number" || code < 200 || code > 500) code = 500;

      res.status(code).send({
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
