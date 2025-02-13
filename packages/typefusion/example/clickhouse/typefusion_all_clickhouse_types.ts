import { clickhouseType, TypefusionDbScript } from "../../src/index.js";

const allClickhouseTypes = {
  bigint: clickhouseType.int64().notNull(),
  binary: clickhouseType.string().notNull(), // Using string as a close approximation
  boolean: clickhouseType.boolean().notNull(),
  char: clickhouseType.fixedString(10).notNull(),
  date: clickhouseType.date().notNull(),
  dateTime: clickhouseType.dateTime64(3).notNull(),
  decimal: clickhouseType.decimal(10, 2).notNull(),
  double: clickhouseType.float64().notNull(),
  float: clickhouseType.float32().notNull(),
  int: clickhouseType.int32().notNull(),
  json: clickhouseType.json().notNull(),
  smallint: clickhouseType.int16().notNull(),
  text: clickhouseType.string().notNull(),
  time: clickhouseType.string().notNull(), // Clickhouse doesn't have a specific time type
  varchar: clickhouseType.string().notNull(),
};

export default {
  name: "typefusion_all_clickhouse_types",
  resultDatabase: "clickhouse",
  run: async () => {
    console.log("TYPEFUSION ALL CLICKHOUSE TYPES IS RUN");
    return {
      data: [
        {
          bigint: BigInt("9007199254740991").toString(),
          binary: Buffer.from([0x12]).toString("base64"), // Convert to base64 string
          boolean: true,
          char: "Fixed     ",
          date: "2023-05-17",
          dateTime: "2023-05-17T12:34:56",
          decimal: 123.45,
          double: 3.141592653589793,
          float: 3.14,
          int: 42,
          // TODO this needs to be a json string
          json: { key: "value" },
          smallint: 32767,
          text: "Sample text",
          time: "12:34:56",
          varchar: "Variable length text",
        },
      ],
    };
  },
  schema: allClickhouseTypes,
} satisfies TypefusionDbScript<typeof allClickhouseTypes>;
