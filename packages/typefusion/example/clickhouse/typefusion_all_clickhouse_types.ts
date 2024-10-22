import { clickhouseType, TypefusionDbScript } from "../../src/index.js";

const allClickhouseTypes = {
  text: clickhouseType.string().notNull(),
  int: clickhouseType.int32().notNull(),
  boolean: clickhouseType.boolean().notNull(),
  date: clickhouseType.date().notNull(),
  dateTime: clickhouseType.dateTime64(3).notNull(),
  bigint: clickhouseType.int64().notNull(),
  smallint: clickhouseType.int16().notNull(),
  float: clickhouseType.float32().notNull(),
  double: clickhouseType.float64().notNull(),
  decimal: clickhouseType.decimal(10, 2).notNull(),
  char: clickhouseType.fixedString(10).notNull(),
  varchar: clickhouseType.string().notNull(),
  time: clickhouseType.string().notNull(), // Clickhouse doesn't have a specific time type
  json: clickhouseType.json().notNull(),
  binary: clickhouseType.string().notNull(), // Using string as a close approximation
};

export default {
  name: "typefusion_all_clickhouse_types",
  schema: allClickhouseTypes,
  resultDatabase: "clickhouse",
  run: async () => {
    console.log("TYPEFUSION ALL CLICKHOUSE TYPES IS RUN");
    return {
      data: [
        {
          text: "Sample text",
          int: 42,
          boolean: true,
          date: "2023-05-17",
          dateTime: "2023-05-17T12:34:56",
          bigint: BigInt("9007199254740991").toString(),
          smallint: 32767,
          float: 3.14,
          double: 3.141592653589793,
          decimal: 123.45,
          char: "Fixed     ",
          varchar: "Variable length text",
          time: "12:34:56",
          // TODO this needs to be a json string
          json: { key: "value" },
          binary: Buffer.from([0x12]).toString("base64"), // Convert to base64 string
        },
      ],
    };
  },
} satisfies TypefusionDbScript<typeof allClickhouseTypes>;
