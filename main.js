/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 * @file Setup scripts for ESLint.
 */

// @ts-check
const eslintjs = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const typescript_eslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier/recommended');
const globals = require('globals');
const jest = require('eslint-plugin-jest');
const importPlugin = require('eslint-plugin-import');
const pluginSecurity = require('eslint-plugin-security');
const sonar = require('eslint-plugin-sonarjs');
/**
 * @type { import("@eslint/config-helpers").Plugin }
 */
let headers;
try {
  headers = require('eslint-plugin-headers');
} catch {
  // @ts-ignore If not installed assume rule is disabled. Lint will error if missing but expected.
  headers = null;
}

/**
 * @type {{ configs: any; processInlineTemplates: any; default?: any; templateParser?: any; templatePlugin?: any; tsPlugin?: any; }}
 */
let angularLint;
try {
  angularLint = require('angular-eslint');
} catch {
  // angular-eslint not installed, use filler to avoid errors.
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
  importPlugin.flatConfigs?.recommended,
  importPlugin.flatConfigs?.typescript,
  pluginSecurity.configs.recommended,
  sonar.configs.recommended,
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
 * @param { {strict?: boolean, appPrefix?: string, header: { license?: string, copyright: string } } } options config for base ruleset.
 * - appPrefix `string | undefined | null` Angular App/Lib prefix. default none (non-angular project)
 * - strict `boolean | undefined | null` Whether to use the stricter set of rule configurations. default false
 * - header `{ license?: string, copyright: string }` License and copyright information. Or explicitly set to false to disable.
 * @throws Error if config is invalid
 */
function validateConfig(options) {
  if (!options?.header?.copyright) {
    throw new Error('current copyright text required');
  }
}

/**
 * All tsconfig files in project are considered when linting.
 *
 * @param { { appPrefix?: string } } options config for base ruleset.
 * - appPrefix { string | undefined | null } Angular App/Lib prefix. default none (non-angular project)
 * @returns true if Angular config is definded
 * @throws Error if Angular config is definded, but angular-eslint is not installed.
 */
function isAngularConfig(options) {
  const isAngular = !!(
    typeof options.appPrefix === 'string' && options.appPrefix.trim() !== ''
  );
  if (isAngular && !angularLint?.processInlineTemplates) {
    throw new Error(
      'angular-eslint not installed! Install angular-eslint or remove appPrefix from config.'
    );
  }
  return isAngular;
}

/**
 * All tsconfig files in project are considered when linting.
 *
 * @param { {strict?: boolean, appPrefix?: string, header: { license?: string, copyright: string }} } options config for base ruleset.
 * - appPrefix `string | undefined | null` Angular App/Lib prefix. default none (non-angular project)
 * - strict `boolean | undefined | null` Whether to use the stricter set of rule configurations. default false
 * - header `{ license?: string, copyright: string }` License and copyright information. Or explicitly set to false to disable (not recommended).
 * @throws Error if appPrefix is set but angular-eslit is not innstalled
 * @throws Error if header is not defined
 * @returns a preconfigured flat ESLint configuration
 */
function getFlatConfig(options) {
  validateConfig(options);
  const isAngular = isAngularConfig(options);
  const app = options.appPrefix;
  const strict = !!options.strict;
  const enabledOnStrict = strict ? 'error' : 'off';
  return defineConfig(
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
        '@typescript-eslint/consistent-type-imports': [
          // Helps remove unnecesary imports from compliation, improving tree shaking.
          enabledOnStrict,
          {
            fixStyle: 'separate-type-imports',
            prefer: 'type-imports',
          },
        ],
        '@typescript-eslint/unbound-method': 'off', // these are rarely typed correctly in external libraries
        '@typescript-eslint/explicit-function-return-type': enabledOnStrict, // Speeds up static analysis and ensures consistent interface types
        '@typescript-eslint/no-unsafe-argument': enabledOnStrict,
        '@typescript-eslint/no-unsafe-assignment': enabledOnStrict,
        '@typescript-eslint/no-unsafe-call': enabledOnStrict,
        '@typescript-eslint/no-unsafe-member-access': enabledOnStrict,
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            // emulate default tsc rules
            args: 'all',
            argsIgnorePattern: '^_',
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
        'no-console': ['error', { allow: ['warn', 'error'] }], // use ngx-logger or equivelent instead of console for info/debug logs
        'prefer-arrow-callback': 'error',
        'import/no-unresolved': 'off', // checked by ts
        'import/namespace': 'off', // not suppoted yet for ESLint 9 https://github.com/import-js/eslint-plugin-import/issues/3099
        'import/no-deprecated': 'off', // covered by sonar and not suppoted yet for ESLint 9 https://github.com/import-js/eslint-plugin-import/issues/2245
        'import/no-extraneous-dependencies': [
          'error',
          {
            // Only test files may use dev devDependencies
            devDependencies: TEST_FILES,
          },
        ],
        'import/no-absolute-path': 'error',
        'import/no-cycle': 'error',
        'import/no-self-import': 'error',
        'import/no-useless-path-segments': 'warn',
        'security/detect-object-injection': 'off', // Not input/type aware. Typescript already blocks unsafe access/assignment, and this rule blocks the legitimate use of maps/array-index.
        'security/detect-unsafe-regex': enabledOnStrict, // too many false positives. Does not recognize match capping `{x,z}` as a proper fix.
        // Cannot be satisfied. There is no standard regex escape function, and it does not recognize when match text was normalized.
        'security/detect-non-literal-regexp': enabledOnStrict, // For strict, regex should be avoided except for very simple literals.
        'sonarjs/no-unsafe-unzip': 'off', // cannot be satisfied. Track in SonarQube instead.
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
    },
    {
      name: 'Typescript Headers',
      files: ['**/*.ts', '**/*.tsx'],
      plugins: { headers },
      rules: {
        'headers/header-format': [
          'error',
          {
            source: 'string',
            // allow no space/text after license, but auto-fill requires at least one space.
            content: '@license(license) \n@copyright(copyright)',
            patterns: {
              license: {
                pattern: String.raw`[\s\w-]{0,25}`,
                defaultValue: options.header.license
                  ? ' ' + options.header.license.trim()
                  : ' ',
              },
              copyright: {
                pattern: '[ \n][\\s\\w\n\r*-]{0,250}',
                defaultValue:
                  ' ' +
                  options.header.copyright
                    // cleanup possible newline at end. Allow at start.
                    .trimEnd()
                    // Make sure new lines start with '*'
                    .replaceAll('\n', '\n * ')
                    // fix any redundent changes
                    .replaceAll('\n *  * ', '\n * '),
              },
            },
            trailingNewlines: 2, // for 1 space after header
          },
        ],
      },
    }
  );
}

/**
 * Default license for Modus open source code.
 * @type { { mit: { license: string, copyright: string }, manual: { license: string, copyright: string }} }
 */
exports.header = {
  mit: {
    license: 'MIT',
    copyright: `Copyright ${new Date().getFullYear().toString()} Modus Operandi Inc. All Rights Reserved.`,
  },
  manual: {
    license: ' ',
    copyright: 'TODO',
  },
};

exports.getFlatConfig = getFlatConfig;
exports.default = getFlatConfig;
