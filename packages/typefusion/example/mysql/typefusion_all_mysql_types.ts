import { mySqlType, TypefusionDbResult } from "../../src/index.js";

const allMySqlTypes = {
  text: mySqlType.text().notNull(),
  int: mySqlType.int().notNull(),
  boolean: mySqlType.boolean().notNull(),
  date: mySqlType.date().notNull(),
  dateTime: mySqlType.dateTime().notNull(),
  bigint: mySqlType.bigint().notNull(),
  smallint: mySqlType.smallint().notNull(),
  float: mySqlType.float().notNull(),
  double: mySqlType.double().notNull(),
  decimal: mySqlType.decimal().notNull(),
  char: mySqlType.char(10).notNull(),
  varchar: mySqlType.varchar(50).notNull(),
  time: mySqlType.time().notNull(),
  json: mySqlType.json().notNull(),
  binary: mySqlType.binary().notNull(),
};

export default {
  name: "typefusion_all_mysql_types",
  schema: allMySqlTypes,
  resultDatabase: "mysql",
  run: async () => {
    console.log("TYPEFUSION ALL MYSQL TYPES IS RUN");
    return [
      {
        text: "Sample text",
        int: 42,
        boolean: true,
        date: new Date("2023-05-17"),
        dateTime: new Date("2023-05-17T12:34:56"),
        bigint: BigInt("9007199254740991"),
        smallint: 32767,
        float: 3.14,
        double: 3.141592653589793,
        decimal: 123.45,
        char: "Fixed     ",
        varchar: "Variable length text",
        time: "12:34:56",
        json: { key: "value" },
        binary: new Uint8Array([0x12, 0x34, 0x56, 0x78]),
      },
    ];
  },
} satisfies TypefusionDbResult<typeof allMySqlTypes>;
