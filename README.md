# Welcome to Typefusion!

<!-- TODO codecov badge -->

## Table of Contents

- [Welcome to Typefusion!](#welcome-to-typefusion)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Key Features](#key-features)
  - [Getting Started](#getting-started)
  - [Usage](#usage)
    - [CLI](#cli)
    - [Library](#library)
  - [Typefusion Ref](#typefusion-ref)
  - [Examples](#examples)
  - [Documentation](#documentation)
  - [Effect Integration](#effect-integration)
  - [Troubleshooting](#troubleshooting)
  - [Contributing](#contributing)

## Introduction

Typefusion is a powerful tool that allows you to run TypeScript scripts and materialize the results into a database (currently PostgreSQL only). It enables you to create complex workflows by allowing scripts to reference each other's results. Inspired by [Data Build Tool (DBT)](https://www.getdbt.com/), Typefusion brings similar concepts to the TypeScript ecosystem, providing a solution for data transformation and workflow management.

## Key Features

- Execute TypeScript scripts and store results in PostgreSQL
- Create complex workflows with script dependencies
- Type-safe references between scripts
- Flexible usage through CLI and library modes
- Automatic dependency resolution and execution order

## Getting Started

To begin using Typefusion, follow these steps:

1. Install Typefusion using your preferred package manager:

   ```sh
   npm install typefusion
   # or
   pnpm install typefusion
   # or
   yarn add typefusion
   # or
   bun add typefusion
   ```

2. Configure your database connection using one of these methods:

   - Set a full connection string in the `DATABASE_URL` environment variable.
   - Set individual environment variables: `PGDATABASE`, `PGHOST`, `PGPORT`, `PGPASSWORD`, and `PGUSER`.

3. Create a directory for your scripts (e.g., `workflows`).

4. Write your TypeScript scripts in the created directory.

5. Compile your TypeScript scripts into your desired output directory. Typefusion runs on the compiled JavaScript output, so ensure you don't bundle your scripts to preserve the directory layout.

## Usage

1. First, create a directory to store your scripts, such as `workflows`.

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

   Compile your scripts into your directory of choice. Typefusion runs on the JS output, not on the original typescript scripts. Make sure not to bundle your scripts so that the directory layout is preserved.

   Typefusion can be used in two primary modes: CLI and library. Both modes offer similar functionality, allowing you to choose the most suitable approach for your project.

### CLI

The Typefusion CLI provides a convenient way to run your scripts from the command line. To use the CLI:

1. Add a script to your `package.json`:

   ```json
   "scripts": {
     "run-typefusion": "dotenv -- typefusion ./scripts"
   }
   ```

   This example assumes you're using `dotenv` for environment variable management and that your compiled scripts are in the `./scripts` directory.

2. Run your scripts:

   ```sh
   npm run run-typefusion
   ```

To explore all CLI options, run:

```sh
npm run typefusion --help
```

### Library

You can also use Typefusion as a library in your TypeScript projects:

```ts
import typefusion from "typefusion";

await typefusion({
  directory: "./scripts",
});
```

This approach allows for more programmatic control and integration with your existing TypeScript applications.

## Typefusion Ref

Typefusion Refs enable you to reference the results of one script in another, facilitating the creation of complex workflows. Here's an example:

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

For cases where you only need the table name without fetching the full data, use the `typefusionRefTableName` function:

```ts
import { typefusionRefTableName } from "typefusion";
import main from "./main.js";

const tableName = await typefusionRefTableName(main);
console.log("typefusion ref table name", tableName); // Outputs: "main"
```

## Examples

To help you get started, we've provided several examples:

1. [Basic Usage](packages/typefusion/example/main.ts)
2. [Using Typefusion Ref](packages/typefusion/example/options/typefusion_pg_result.ts)

Find more examples in the [examples directory](packages/typefusion/example).

## Documentation

For detailed API documentation, visit the [reference docs](https://aniravi24.github.io/typefusion). The documentation is generated from JSDoc comments in the source code, providing comprehensive information on usage and features.

## Effect Integration

Typefusion is built with [Effect](https://effect.website). Refer to the reference docs for details on Effect-suffixed functions and their usage.

## Troubleshooting

If you encounter any issues while using Typefusion:

1. Check the [GitHub Issues](https://github.com/aniravi24/typefusion/issues) to see if your problem has been reported or resolved.
2. Ensure you're using the latest version of Typefusion.
3. Verify your database connection settings and environment variables.
4. If the issue persists, please [open a new issue](https://github.com/aniravi24/typefusion/issues/new).

## Contributing

We welcome contributions to Typefusion! To contribute:

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Ensure your code passes all tests and linting rules.
4. Open a pull request with the provided template.

If it's a larger change, please open an issue to discuss your proposed changes or feature additions.
