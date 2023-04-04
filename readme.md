| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **.vscode**              | Contains VS Code specific settings                                                            |
| **dist**                 | Contains the distributable (or output) from your TypeScript build.                            |
| **node_modules**         | Contains all your npm dependencies                                                            |
| **src**                  | Contains source code that will be compiled to the dist dir                                    |
| **src/configs**          | Passport authentication strategies and login middleware. Add other config code here           |
| **src/controllers**      | Controllers define functions that respond to various http requests                            |
| **src/middlewares**      | Middlewares define any middleware needed like authentication, logging, or any other purpose   |
| **src/routes**           | Folder that will have a single file for each logical set of routes                            |
| **src/services**         | Services folder will include all the business logic. It can have services that represent business objects and can run queries on the database.                            |
| **src/utils**            | Utils directory that will have all the utilities and helpers needed for the application       |
| **src/models**           | Models define Postgres schemas that will be used in storing and retrieving data from Postgres |
| **src/types**            | Holds .d.ts files not found on DefinitelyTyped.                                               |
| **src/server.ts**        | Entry point of express app                                                                    |
| **src/test**             | Contains tests.                                                                               |
| .env.sample              | API keys, tokens, passwords, database URI.                                                    |
| jest.config.js           | Used to configure Jest running tests written in TypeScript                                    |
| package.json             | File that contains npm dependencies as well as build scripts                                  |
| tsconfig.json            | Config settings for compiling server code written in TypeScript                               |
| .eslintrc                | Config settings for ESLint code style checking                                                |
| .eslintignore            | Config settings for paths to exclude from linting                                             |