# Modus Operandi eslint-config

## Description

This package contains the core coding standards for all MO apps.

## Requirements

Before you can start using the eslint-config your application must have the following dev-dependencies associated with your apps version of Angular:

- `eslint`

## Installation & Setup

Note for Angular projects. angular-eslint v18 is compatible with Angular v17 (required for using ESLint 9 on an Angular 17 project)
as long as all angular-eslint packages are v18.

1. Run `npm i -D @modusoperandi/eslint-config` to install the package as a dev dependency.
   If using Angular, follow the Angular instructions to enable Linting with ESLint.
   1. Remove all eslint dependencies aside from eslint and angular-lint from your dev-dependencies.
2. Copy the `.eslint.config.js` from this repo to the root of your project.
3. Change `mo` to the prefix of your Angular app/lib, or set to null if this isn't an Angular project.
4. Run `ng lint` (Angular) or `eslint` (Basic) in a script to ensure functionality. Add `--max-warnings=0` to make these rules strict, or `--quite` to ignore warnings.

### Optional

1. Add the .gitattributes from this project to your project to prevent End Of Line (EOL) issues in your repo.
2. If you are using VSCode, Make sure you have the following extensions that help with these rules.

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)
- [SonarLint](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode)
- (for strict) [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Migrating from v1

1. Do steps 2 + 3 from the setup.
2. Change 'mo' in the config file to the prefix you are using for your Angular app/lib if necessary. The prefix overrides are part of the shared config.
3. If you have any rule overrides aside from the 2 Angular prefix rules, add them as shown [here](https://eslint.org/docs/latest/extend/shareable-configs#overriding-settings-from-shareable-configs) in accordence with the new ESLint flat config.
4. Delete your old eslint config file.

## Usage Notes

1. `console.log(...)` should be avoided. These are usually forgotten debug statements, and when they’re not, their overuse can spam the logs hiding actual errors.
   It is recommended to use [ngx-logger](https://www.npmjs.com/package/ngx-logger) instead so that logging behavior can be controlled at the app layer.
   `console.warn(...)` and `console.error(...)` are ok to use though if necessary.
2. Mocking libraries are designed to be typescript friendly. If a mock library ever returns "any" as a type, that usually means you forgot to specify a type somewhere.
3. `() => {}` is commonly used for a "noop" function. However, `{}` looks like an empty object, and semantically empty function blocks are usually an unintended bug. use `() => undefined` instead to make the noop clear.
4. [import/no-extraneous-dependencies](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md)
   means you're importing something that isn't declared in your package.json, and my not get installed if your dependencies of dependencies change.
   These packages need to be added to your peerDependencies or dependencies to protect you and your consumers.
5. The set of import rules that restrict absolute paths, cycles, and useless path segments are there to protect your code base from a variety of edge cases
   that can cause compile/runtime issues for you or your consumers.
6. "http://" can always be avoided. For URLs, you should always default to "https".
   For URIs like xml schemes, you should use an imported constant or parameter instead to avoid typo issues.

## Follow-ups

These plugins need to be added/updated once they have official support with ESLint 9

1. https://github.com/import-js/eslint-plugin-import/pull/2996
2. https://github.com/storybookjs/eslint-plugin-storybook/pull/156
