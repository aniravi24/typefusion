import { mySqlType, TypefusionDbScript } from "../../src/index.js";

const allMySqlTypes = {
  bigint: mySqlType.bigint().notNull(),
  binary: mySqlType.binary().notNull(),
  boolean: mySqlType.boolean().notNull(),
  char: mySqlType.char(10).notNull(),
  date: mySqlType.date().notNull(),
  dateTime: mySqlType.dateTime().notNull(),
  decimal: mySqlType.decimal().notNull(),
  double: mySqlType.double().notNull(),
  float: mySqlType.float().notNull(),
  int: mySqlType.int().notNull(),
  json: mySqlType.json().notNull(),
  smallint: mySqlType.smallint().notNull(),
  text: mySqlType.text().notNull(),
  time: mySqlType.time().notNull(),
  varchar: mySqlType.varchar(50).notNull(),
};

export default {
  name: "typefusion_all_mysql_types",
  resultDatabase: "mysql",
  run: async () => {
    console.log("TYPEFUSION ALL MYSQL TYPES IS RUN");
    return {
      data: [
        {
          bigint: BigInt("9007199254740991"),
          binary: new Uint8Array([0x12]),
          boolean: true,
          char: "Fixed     ",
          date: new Date("2023-05-17"),
          dateTime: new Date("2023-05-17T12:34:56"),
          decimal: 123.45,
          double: 3.141592653589793,
          float: 3.14,
          int: 42,
          json: { key: "value" },
          smallint: 32767,
          text: "Sample text",
          time: "12:34:56",
          varchar: "Variable length text",
        },
      ],
    };
  },
  schema: allMySqlTypes,
} satisfies TypefusionDbScript<typeof allMySqlTypes>;
