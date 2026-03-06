// @ts-check
const config = require('@modusoperandi/eslint-config');
// to use text from file use `const copyright = require('fs').readFileSync('./COPYRIGHT.md', 'utf-8')`. VSC plugin cannot import equivalent 'node:fs'
module.exports = [
  ...config.getFlatConfig({
    appPrefix: 'mo',
    strict: false,
    header: config.header.mit, // or `{ license, copyright }`
  }),
  // example extended config for initial adoption. This section should only be used to temporary turn new rules to warnings, or to extend with your own desired rules.
  /**
  {
    files: config.TS_FILES,
    rules: {
      'no-constant-binary-expression': 'warn',
      'import/no-named-as-default': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
    },
  },
  {
    files: config.TEST_FILES,
    rules: {
      'jest/no-done-callback': 'warn',
      'jest/expect-expect': 'warn',
      'jest/no-identical-title': 'warn',
      'jest/no-conditional-expect': 'warn',
    },
  },
   */
];
