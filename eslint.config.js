const config = require('@modusoperandi/eslint-config');
module.exports = [
  ...config.getFlatConfig({
    appPrefix: 'mo',
    strict: false,
  }),
  {
    rules: {
      //Include any rule overrides here!
    },
  },
];
