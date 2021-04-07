type SchemaValue = string | number | boolean | object;

interface Schema {
  [prop: string]: SchemaValue | Schema;
}

interface ApiSchema {
  [prop: string]: Schema;
}

interface ApiSchemaValue {
  [prop: string]: Schema[];
}

type FakeFunction = (prop1?: number, prop2?: number) => SchemaValue;

interface FakeTypes {
  [typeName: string]: FakeFunction;
}

interface FakerWrapper extends Faker.FakerStatic {
  [group: string]: FakeTypes | any;
}

export class SimpleFaker {
  protected callbackTypes: FakeTypes = {};
  protected locale: string;
  protected dataLength: number;

  public faker: FakerWrapper;

  constructor(locale = "en", dataLength = 10) {
    this.callbackTypes = {};
    this.locale = locale;
    this.dataLength = dataLength;
    this.faker = require("faker");
    this.faker.setLocale(locale);
  }

  setLength(dataLength: number): void {
    this.dataLength = dataLength;
  }

  setLocale(locale: string): void {
    this.locale = locale;
    this.faker.setLocale(locale);
  }

  getFaker(): Faker.FakerStatic {
    return this.faker;
  }

  getCallbackType(name: string): FakeFunction | undefined {
    if (this.callbackTypes.hasOwnProperty(name))
      return this.callbackTypes[name].bind(this);
  }

  addType(name: string, fn: FakeFunction): SimpleFaker {
    this.callbackTypes[name.toLowerCase()] = fn;
    return this;
  }

  fakeDate(
    start?: Date | number | string,
    end?: Date | number | string
  ): string {
    if (typeof start === "undefined" || !start) start = new Date(2000, 1, 1);
    if (typeof start !== "object") start = new Date(start);
    if (typeof end === "undefined" || !end) end = new Date();
    if (typeof end !== "object") end = new Date(end);

    const d = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }

  fakeTime(): string {
    let h = "" + this.faker.datatype.number({ min: 0, max: 23 });
    let m = "" + this.faker.datatype.number({ min: 0, max: 59 });
    let s = "" + this.faker.datatype.number({ min: 0, max: 59 });

    if (h.length < 2) h = "0" + h;
    if (m.length < 2) m = "0" + m;
    if (s.length < 2) s = "0" + s;
    return [h, m, s].join(":");
  }

  fakeDatetime(
    start?: Date | number | string,
    end?: Date | number | string
  ): string {
    return this.fakeDate(start, end) + " " + this.fakeTime();
  }

  fakeInteger(min: number = 1, max: number = 1000000): number {
    return this.faker.datatype.number({ min, max });
  }

  fakeFloat(min: number = 1, max: number = 1000000): number {
    return this.faker.datatype.float({ min, max });
  }

  fakeBoolean(): boolean {
    return this.faker.datatype.boolean();
  }

  fakeString(min: number = 5, max: number = 20): string {
    return this.faker.datatype.string(this.fakeInteger(min, max));
  }

  fakeImage(width = 900, height = 600): string {
    return this.faker.image.imageUrl(width, height);
  }

  fakeName(): string {
    return this.faker.name.findName();
  }

  fakeUsername(): string {
    return this.faker.random.alphaNumeric(this.fakeInteger(6, 20));
  }

  fakeWords(min = 5, max = 20): string {
    return this.faker.lorem.words(this.fakeInteger(min, max));
  }

  fakeSentences(min = 5, max = 20): string {
    return this.faker.lorem.sentences(this.fakeInteger(min, max));
  }

  fakePhrase(): string {
    if (this.locale === "ja") {
      return this.faker.lorem.lines(1);
    }
    return this.faker.hacker.phrase();
  }

  fakeParagraphs(min = 3, max = 10, separator = " "): string {
    return this.faker.lorem.paragraphs(this.fakeInteger(min, max), separator);
  }

  fakeHtml(
    min = 3,
    max = 10,
    open = "<p>",
    end = "</p>",
    separator = ""
  ): string {
    const n = this.fakeInteger(min, max);
    const p = [];
    for (let i = 0; i < n; i++) {
      p.push(open + this.faker.lorem.paragraphs(1) + end);
    }
    return p.join(separator);
  }

  fake(dataType: string): SchemaValue {
    if (typeof dataType !== "string")
      throw new TypeError("Invalid type: " + JSON.stringify(dataType));

    /* type format: "internet.url", "address.cityName", or "name.jobTitle" */
    let m = dataType.match(/^\s*([a-z]+)\.([a-z]+)\s*$/i);
    if (m) {
      if (!this.faker.hasOwnProperty(m[1]) || !this.faker[m[1]])
        throw new TypeError("Invalid type: " + dataType);

      if (typeof this.faker[m[1]][m[2]] !== "function")
        throw new TypeError("Invalid type: " + dataType);

      try {
        return this.faker[m[1]][m[2]]();
      } catch (e) {
        throw new TypeError("Invalid type: " + dataType);
      }
    }

    /* faker mustache format: "{{user.firstName}} lives at {{address.cityName}}" */
    if (dataType.match(/{{.+}}/)) {
      try {
        return this.faker.fake(dataType);
      } catch (e) {
        throw new TypeError("Invalid type: " + dataType);
      }
    }

    /* simple type format: "string(3,5)", "paragraphs(1,3)", "integer(5,70)", or "boolean" */
    m = dataType.match(/^\s*([a-z]+)\s*(\((\d+),\s*(\d+)\))?\s*$/i);
    if (!m) {
      throw new TypeError("Invalid type: " + dataType);
    }

    const t = m[1].toLowerCase();
    const isRange = m[3] !== undefined && m[3] !== undefined;
    const min = isRange ? parseInt(m[3], 10) : 0;
    const max = isRange ? parseInt(m[4], 10) : 0;
    const rand = isRange ? this.fakeInteger(min, max) : 0;

    /* callback customized type */
    const cb = this.getCallbackType(m[1]);
    if (cb && typeof cb === "function") return isRange ? cb(min, max) : cb();

    /* This faker type */
    const funcName = ("fake" +
      t.charAt(0).toUpperCase() +
      t.slice(1)) as keyof SimpleFaker;
    if (typeof this[funcName] === "function") {
      const func = (this[funcName] as FakeFunction).bind(this);
      return isRange ? func(min, max) : func();
    }

    /* search grand children properties to find the first match */
    for (const [prop, obj] of Object.entries(this.faker)) {
      if (typeof obj[t] === "function") {
        return isRange ? obj[t](rand) : obj[t]();
      }
    }

    throw new TypeError("Invalid type: " + dataType);
  }

  fakeSchema(schema: Schema): Schema {
    if (typeof schema !== "object")
      throw new TypeError("Invalid type: " + JSON.stringify(schema));

    const data: Schema = {};

    for (const [key, value] of Object.entries(schema)) {
      if (typeof value === "object") {
        data[key] = this.fakeSchema(value as Schema);
      } else if (typeof value === "string") {
        data[key] = this.fake(value as string);
      } else {
        throw new TypeError("Invalid type: " + JSON.stringify(value));
      }
    }

    return data;
  }

  fakeApi(schema: ApiSchema): ApiSchemaValue {
    if (typeof schema !== "object")
      throw new TypeError("Schema must be object: " + JSON.stringify(schema));

    const data: ApiSchemaValue = {};
    for (const [key, subSchema] of Object.entries(schema)) {
      const subData: Schema[] = [];
      for (let i = 0; i < this.dataLength; i++) {
        subData.push(this.fakeSchema(subSchema));
      }

      data[key] = subData;
    }

    return data;
  }
}
