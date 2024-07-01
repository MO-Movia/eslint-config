# Modus Operandi eslint-config
## Description
This package was built to ensure consistant linting and better coding standards across all MO apps.

## Requirements
Before you can start using the eslint-config your application but have the following dev-dependecies associated with your apps version of Angular:
  - `eslint`
  - `@angular-devkit/build-angular`
  - `@angular-eslint/builder`
  - `@angular-eslint/eslint-plugin`
  - `@angular-eslint/eslint-plugin-template`
  - `@angular-eslint/schematics`
  - `@angular-eslint/template-parser`

## Installation & Setup
1. Run `npm i -D @modusoperandi/eslint-config` to install the package as a dev dependency.
2. In the root of your project create a new file named `.eslintrc.js`.
3. In your new file add the following code:
  <code>const eslintConfig = require('@modusoperandi/eslint-config');
    module.exports = eslintConfig;</code>
4. Run `npm run lint` to ensure functionality.