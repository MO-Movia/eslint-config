/**
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 * @file Setup scripts for ESLint.
 */

// @ts-check
const eslintjs = require('@eslint/js');
const typescript_eslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier/recommended');
const globals = require('globals');
const jest = require('eslint-plugin-jest');
const importPlugin = require('eslint-plugin-import');
const sonar = require('eslint-plugin-sonarjs');
let angularLint;
try {
  angularLint = require('angular-eslint');
} catch (e) {
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
 * @type { import('@typescript-eslint/utils/ts-eslint').FlatConfig.ConfigArray}
 */
const tsRecommendedBase = [
  eslintjs.configs.recommended,
  ...typescript_eslint.configs.recommendedTypeChecked,
  importPlugin.flatConfigs?.recommended,
  importPlugin.flatConfigs?.typescript,
  sonar.configs.recommended,
];
/**
 * @type { import('@typescript-eslint/utils/ts-eslint').FlatConfig.ConfigArray}
 */
const tsRecommendedStrict = [
  ...tsRecommendedBase,
  ...typescript_eslint.configs.stylisticTypeChecked,
  prettier,
];
/**
 * @type { import('@typescript-eslint/utils/ts-eslint').FlatConfig.ConfigArray}
 */
const ngRecommended = [...angularLint.configs.tsRecommended];
/**
 * @type { import('@typescript-eslint/utils/ts-eslint').FlatConfig.ConfigArray}
 */
const templateRecommended = [
  ...angularLint.configs.templateRecommended,
  // accessibility included because it overlaps with sonar html rules
  ...angularLint.configs.templateAccessibility,
  prettier,
];
const TEST_FILES = [
  // Test Resources
  '**/testing/**/*.ts',
  '**/testing/**/*.tsx',
  '**/test/**/*.ts',
  '**/test/**/*.tsx',
  // Test Files
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  // test init file
  '**/test.ts',
];
/**
 * All tsconfig files in project are considered when linting.
 *
 * @param { {strict?: boolean, appPrefix?: string } | undefined } options config for base ruleset.
 * - appPrefix { string | undefined | null } Angular App/Lib prefix. default none (non-angular project)
 * - strict { boolean | undefined | null } Whether to use the stricter set of rule configurations. default false
 * @returns a preconfigured flat ESLint configuration
 */
function getFlatConfig(options = {}) {
  const strict = !!options.strict;
  const isAngular = !!(
    typeof options.appPrefix === 'string' && options.appPrefix.trim() !== ''
  );
  if (isAngular && !angularLint?.processInlineTemplates) {
    throw new Error(
      'angular-eslint not installed! Install angular-eslint or remove appPrefix from config.'
    );
  }
  const app = options.appPrefix;
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
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        ...(strict ? tsRecommendedStrict : tsRecommendedBase),
        ...(isAngular ? ngRecommended : []),
      ],
      // can't use processor: undefined because of runtime bug in eslint.
      ...(isAngular ? { processor: angularLint.processInlineTemplates } : {}),
      languageOptions: {
        parserOptions: {
          // load all tsconfig files so that closest inclusive one is used.
          project: ['./**/tsconfig.json', './**/tsconfig.*.json'],
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
        'eslint/no-ternary': 'off', // Turned on by sonar-lint. Nested is still banned so this is overly strict.
        '@typescript-eslint/unbound-method': 'off', // these are rarely typed correctly in external libraries
        '@typescript-eslint/explicit-function-return-type': strict // Speeds up static analysis and ensures consistent interface types
          ? 'error'
          : 'off',
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
        // use ngx-logger or equivelent instead of console for info/debug logs
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'prefer-arrow-callback': 'error',
        'import/no-unresolved': 'off', // checked by ts
        'import/namespace': 'off', // not suppoted yet for ESLint 9 https://github.com/import-js/eslint-plugin-import/issues/3099
        'import/no-deprecated': 'off', // covered by sonar and not suppoted yet for ESLint 9 https://github.com/import-js/eslint-plugin-import/issues/2245
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: TEST_FILES,
          },
        ],
        'import/no-absolute-path': 'error',
        'import/no-cycle': 'error',
        'import/no-self-import': 'error',
        'import/no-useless-path-segments': 'warn',
        'sonarjs/no-unsafe-unzip': 'off', // cannot be satisfied. Track is SonarQube instead
        'sonarjs/function-return-type': 'off', // is too often wrong due to libraries not setting this properly.
        'sonarjs/deprecation': 'off', // missing context info for filtering. Use more accurate report from Sonar.
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['src/*', 'project/*'],
                // Absolute paths may cause issues with some tools that don't know the root dir.
                message:
                  'For better interoperability support, absolute paths should not be used.',
              },
            ],
            paths: [
              {
                name: 'lodash',
                importNames: ['Get, Set'],
                message: 'Use proper typed accessors and checks instead.',
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
      files: TEST_FILES,
      rules: {
        ...jest.configs['flat/recommended'].rules,
        'jest/expect-expect': 'error', // upgrade from warning to error
        // disable rules not compatible with jasmine
        'jest/no-alias-methods': 'off',
        'jest/no-deprecated-functions': 'off',
        'jest/no-jasmine-globals': 'off',
        'jest/no-test-prefixes': 'off',
        'jest/require-top-level-describe': 'error',
        // Allow null assertions for tests. Functions should be null safe, even if they don't expect it.
        '@typescript-eslint/no-non-null-assertion': 'off',
        // Allow accessing private/protected fields in tests
        '@typescript-eslint/dot-notation': [
          'error',
          {
            allowPrivateClassPropertyAccess: true,
            allowProtectedClassPropertyAccess: true,
          },
        ],
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  // Allow importing from the public api for tests only
                  '!src/src/public-api',
                  '!src/index',
                ],
              },
            ],
          },
        ],
        'sonarjs/no-clear-text-protocols': 'off', // Ignore for test files like core Sonar does. (not an actual request)
        'sonarjs/no-nested-functions': 'off', // Ignore for test files like core Sonar does. (ignore because of nested describe blocks)
      },
    }
  );
}
/**
 * A default configuration for Angular apps and libraries
 */
exports.angularRecommended = () =>
  getFlatConfig({
    appPrefix: 'mo',
    strict: false,
  });
/**
 * Adefault configuration for plain typescript apps and libraries
 */
exports.tsRecommended = () => getFlatConfig();
exports.getFlatConfig = getFlatConfig;
exports.default = getFlatConfig;
