# Welcome to Typefusion!

<!-- TODO codecov badge -->

## Table of Contents

- [Welcome to Typefusion!](#welcome-to-typefusion)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Getting Started](#getting-started)
  - [Usage](#usage)
    - [CLI](#cli)
    - [Library](#library)
  - [Typefusion Ref](#typefusion-ref)
  - [Examples](#examples)
  - [Docs](#docs)
  - [Have an issue?](#have-an-issue)
  - [Contributions](#contributions)

## Introduction

Typefusion lets you run TypeScript scripts, and the results are materialized into a database (currently PostgreSQL only). Scripts can reference each other's results, so you can build complex workflows. It's inspired by [Data Build Tool](https://www.getdbt.com/) (DBT).

## Getting Started

To get started with Typefusion, you need to install the package and set up your database configuration. Follow the steps below:

1. Install Typefusion using your preferred package manager:

   ```sh
   npm install typefusion
   ```

   ```sh
   pnpm install typefusion
   ```

   ```sh
   yarn add typefusion
   ```

   ```sh
   bun add typefusion
   ```

2. To setup your database configuration, you can may do one of two options:

   - Have a full connection string in the `DATABASE_URL` environment variable.
   - Have `PGDATABASE`, `PGHOST`, `PGPORT`, `PGPASSWORD`, and `PGUSER` set as environment variables.

## Usage

1. First, create a directory to store your scripts.

2. Then, create a script file in the directory, for example, `main.ts`:

   ```ts
   import { pgType, TypefusionPgResult } from "typefusion";

   export const mainSchema = {
     id: pgType.integer().notNull(),
     name: pgType.text().notNull(),
     age: pgType.integer().notNull(),
     email: pgType.text().notNull(),
     address: pgType.text().notNull(),
   };

   export default async function main(): Promise<
     TypefusionPgResult<typeof mainSchema>
   > {
     console.log("running main");
     return {
       types: mainSchema,
       data: [
         {
           id: 1,
           name: "John Doe",
           age: 30,
           email: "john.doe@example.com",
           address: "123 Main St",
         },
       ],
     };
   }
   ```

   Then, you may either use the CLI or library to run your script.

### CLI

You can use the Typefusion CLI to run your scripts. Here is an example of how to run the CLI:

```sh
npm run typefusion --help # The CLI mode has some nifty features, check them out!
```

A common setup in your package.json scripts (presuming you have dotenv setup with a `.env` file in your project):

```json
"scripts": {
  "run-typefusion": "dotenv -- typefusion ./scripts"
}
```

Then you can run your scripts with:

```sh
npm run run-typefusion
```

You should now see the output of your script in your database! There should be a table called `main` with the data you returned from the script above.

### Library

You can also use Typefusion as a library in your TypeScript projects. Here is an example of how to use it:

```ts
import typefusion from "typefusion";

await typefusion({
  directory: "./scripts",
});
```

## Typefusion Ref

Typefusion Refs allow you to reference the results of a script in another script. It is useful for building complex workflows. Following the usage of the library above, here is an example of how to use Typefusion Ref to reference the results of the `main` script:

```ts
import { pgType, typefusionRef, TypefusionPgResult } from "typefusion";
import main from "./main.js";

const smallSchema = {
  small: pgType.text().notNull(),
};

export default async function typefusion_ref(): Promise<
  TypefusionPgResult<typeof smallSchema>
> {
  const result = await typefusionRef(main);
  console.log("typefusion ref main result", result);
  return {
    types: smallSchema,
    data: [
      {
        small: "smallString" as const,
      },
    ],
  };
}
```

You'll notice that the `main` script is run first, and then the `typefusion_ref` script is run. The result of the `main` script is then used in the `typefusion_ref` script. `result` is fully type-safe depending on the types you used in the `main` script.

As long as there are no circular dependencies, you can reference any script from any other script, allowing for complex workflows.

If you want to run a query of some kind and want to just grab the table name without getting the full data, you can use the `typefusionRefTableName` function. This is useful if you want to run a query of some kind and want to just grab the table name from the other script without the full data.

```ts
import { typefusionRefTableName } from "typefusion";
import main from "./main.js";

const tableName = await typefusionRefTableName(main);
console.log("typefusion ref table name", tableName); // should print out "main"
```

## Examples

Here are some examples of how to use Typefusion:

1. [Main Example](packages/typefusion/example/main.ts)
2. [Ref Example](packages/typefusion/example/options/typefusion_pg_result.ts)

You can find the remaining examples [here](packages/typefusion/example).

## Docs

Reference docs can be found at [https://aniravi24.github.io/typefusion](https://aniravi24.github.io/typefusion). JSDoc comments are used to document more details not covered in this README.

## Have an issue?

Open a GitHub issue [here](https://github.com/aniravi24/typefusion/issues/new)

## Contributions

Please open an issue to document a bug or suggest a feature request before opening a PR.
