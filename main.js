// @ts-check
const eslintjs = require('@eslint/js');
const typescript_eslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier/recommended');
const globals = require('globals');
const sonarjs = require('eslint-plugin-sonarjs');
const jest = require('eslint-plugin-jest');
const importPlugin = require('eslint-plugin-import');
let angularLint;
try {
  angularLint = require('angular-eslint');
} catch (e) {
  console &&
    console.warn('angular-eslint not installed. Excluded from linting');
  // filler
  angularLint = {
    processInlineTemplates: undefined,
    configs: {
      tsAll: [],
      tsRecommended: [],
      templateAll: [],
      templateRecommended: [],
      templateAccessibility: [],
    },
  };
}
/**
 * Base recommended rules. Angular projects should also use {@link ngRecommended} and {@link templateRecommended}
 */
const tsRecommendedBase = [
  eslintjs.configs.recommended,
  ...typescript_eslint.configs.recommendedTypeChecked,
  // @ts-ignore
  importPlugin.flatConfigs.recommended,
  // @ts-ignore
  importPlugin.flatConfigs.typescript,
  sonarjs.configs.recommended,
];
const tsRecommendedStrict = [
  ...tsRecommendedBase,
  ...typescript_eslint.configs.stylisticTypeChecked,
  prettier,
];
const ngRecommended = [...angularLint.configs.tsRecommended];
const templateRecommended = [
  ...angularLint.configs.templateRecommended,
  // accessibility included because it overlaps with sonar html rules
  ...angularLint.configs.templateAccessibility,
  prettier,
];
/**
 *
 * @param { {strict?: boolean, appPrefix?: string, tsconfigDir?: string } | undefined } options prefix to use for the angular library.
 * For non-Angular projects, Angular rules are excluded if not provided. default undefined
 * - appPrefix { string | undefined | null } Angular App/Lib prefix. default none (non-angular project)
 * - strict { boolean | undefined | null } strict whether to use the stricter set of rule configurations. default false
 * - tsconfigDir { string | undefined | null } location of tsconfig to use. default './tsconfig.spec.json' for angular apps else './tsconfig.json'
 * @returns a preconfigured flat ESLint configuration
 */
function getFlatConfig(options = {}) {
  const strict = !!options.strict;
  const isAngular = !!(
    angularLint.processInlineTemplates &&
    typeof options.appPrefix === 'string' &&
    options.appPrefix.trim() !== ''
  );
  const app = options.appPrefix;
  const tsConfigLocation =
    options.tsconfigDir ??
    (isAngular ? './tsconfig.spec.json' : './tsconfig.json');
  return typescript_eslint.default.config(
    {
      name: 'Global',
      ignores: [
        '**/dist',
        '**/coverage',
        '**/node_modules',
        '**/.storybook',
        '**/stories',
      ],
      linterOptions: {
        noInlineConfig: strict,
        reportUnusedDisableDirectives: strict ? 'error' : 'warn',
      },
    },
    {
      name: 'Typescript',
      files: ['**/*.ts'],
      extends: [
        ...(strict ? tsRecommendedStrict : tsRecommendedBase),
        ...(isAngular ? ngRecommended : []),
      ],
      // can't use processor: undefined because of runtime bug in eslint.
      ...(isAngular ? { processor: angularLint.processInlineTemplates } : {}),
      languageOptions: {
        parserOptions: {
          project: tsConfigLocation,
          projectService: true,
          tsconfigRootDir: __dirname,
        },
        globals: {
          ...globals.jasmine,
          ...globals.jest,
          ...globals['shared-node-browser'],
        },
      },
      rules: {
        '@typescript-eslint/unbound-method': 'off', // these are rarely typed correctly in external libraries
        '@typescript-eslint/no-unsafe-argument': strict ? 'error' : 'off',
        '@typescript-eslint/no-unsafe-assignment': strict ? 'error' : 'off',
        '@typescript-eslint/no-unsafe-call': strict ? 'error' : 'off',
        '@typescript-eslint/no-unsafe-member-access': strict ? 'error' : 'off',
        // emulate default tsc rules
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            args: 'all',
            argsIgnorePattern: '^_',
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
        // use ngx-logger instead of console for info/debug logs
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'prefer-arrow-callback': 'error',
        'import/no-unresolved': 'off', // checked by ts
        'import/namespace': 'off', // not suppoted yet for ESLint 9
        'import/no-deprecated': 'off', // not suppoted yet for ESLint 9 and covered by sonarjs
        'import/no-extraneous-dependencies': 'error',
        'import/no-absolute-path': 'error',
        'import/no-cycle': 'error',
        'import/no-self-import': 'error',
        'import/no-useless-path-segments': 'warn',
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'lodash',
                importNames: ['Get, Set'],
                message: 'Use proper type accessors and checks instead',
              },
              {
                name: 'lodash',
                importNames: ['deepClone'],
                message:
                  'use browser native structuredClone instead. https://developer.mozilla.org/en-US/docs/Web/API/structuredClone',
              },
            ],
          },
        ],
        ...(isAngular
          ? {
              '@angular-eslint/directive-selector': [
                'error',
                {
                  type: 'attribute',
                  prefix: app,
                  style: 'camelCase',
                },
              ],
              '@angular-eslint/component-selector': [
                'error',
                {
                  type: 'element',
                  prefix: app,
                  style: 'kebab-case',
                },
              ],
            }
          : {}),
      },
    },
    {
      ...(isAngular
        ? {
            name: 'Angular Templates',
            files: ['**/*.html'],
            extends: templateRecommended,
            rules: {},
          }
        : {}),
    },
    {
      name: 'Test Files',
      ...jest.configs['flat/recommended'],
      files: ['**/test/**/*.ts', '**/*.spec.ts'],
      rules: {
        ...jest.configs['flat/recommended'].rules,
        // disable rules not compatible with jasmine
        'jest/no-alias-methods': 'off',
        'jest/no-deprecated-functions': 'off',
        'jest/no-jasmine-globals': 'off',
      },
    }
  );
}
/**
 * A default configuration for Angular apps and libraries
 */
exports.angularRecommended = getFlatConfig({
  appPrefix: 'mo',
  strict: false,
});
/**
 * Adefault configuration for plain typescript apps and libraries
 */
exports.tsRecommended = getFlatConfig();
exports.getFlatConfig = getFlatConfig;
exports.default = getFlatConfig;
