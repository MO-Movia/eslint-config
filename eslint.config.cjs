const config = require('@modusoperandi/eslint-config');
// to use text from file use `const copyright = require('fs').readFileSync('./COPYRIGHT', 'utf-8')`
module.exports = [
  ...config.getFlatConfig({
    appPrefix: 'mo',
    strict: false,
    header: config.header.mit, // or `{ license, copyright }`
  }),
  {
    rules: {
      //Include any rule overrides here!
    },
  },
];
