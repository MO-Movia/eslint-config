# Modus Operandi eslint-config

## Description

This package contains the core coding standards for all MO apps.

## Requirements

Before you can start using the eslint-config your application must have the following dev-dependecies associated with your apps version of Angular:

- `eslint`

## Installation & Setup

Note for Angular projects. angular-eslint v18 is compatible with Angular v17 (required for using ESLint 9 on an Angular 17 project)
as long as all angular-eslint packages are v18.

1. Run `npm i -D @modusoperandi/eslint-config` to install the package as a dev dependency.
   If using Angular, follow the Angular instructions to enable Linting with ESLint.
2. In the root of your project create a new file named `.eslint.config.js`. (or copy the example .eslint.config.js in this repo)
3. In your new file add the following code:
   <code>import { getConfig } from '@modusoperandi/eslint-config';
   export default [...getFlatConfig('mo',false)];</code>
4. Change `mo` to the prefix of your Angular app/lib, or set to null if this isn't an Angular project.
5. Run `ng lint` (Angular) or `eslint` (Basic) in a script to ensure functionality. Add `--max-warnings=0` to make these rules strict, or `--quite` to ignore warnings.

### Optional

1. Add the .gitattributes from this project to your project to prevent End Of Line (EOL) issues in your repo.
2. If you are using VSCode, Make sure you have the following extentions that help with these rules.

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)
- [SonarLint](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode)
- (for strict) [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Migrating from v1

1. Do steps 2 + 3 from the setup.
2. Change 'mo' in the config file to the prefix you are using for your Angular app/lib if nessesary. The prefix overrides are part of the shared config.
3. If you have any rule overrides asside from the 2 Angular prefix rules, add them as shown [here](https://eslint.org/docs/latest/extend/shareable-configs#overriding-settings-from-shareable-configs) in accordence with the new ESLint flat config.
4. Delete your old eslint config file.

## Follow-ups

These plugins need to be added/updated once they have offical support with ESLint 9

1. https://github.com/import-js/eslint-plugin-import/pull/2996
2. https://github.com/storybookjs/eslint-plugin-storybook/pull/156
