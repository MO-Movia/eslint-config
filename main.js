/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 * @file Setup scripts for ESLint.
 */

// @ts-check
const eslintJs = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const typescript_eslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier/recommended');
const globals = require('globals');
const jest = require('eslint-plugin-jest');
const importPlugin = require('eslint-plugin-import');
const pluginSecurity = require('eslint-plugin-security');

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
 * @type { import("angular-eslint") | null}
 */
let angularLint;
try {
  angularLint = require('angular-eslint');
} catch {
  // angular-eslint not installed, use filler to avoid errors.
  angularLint = null;
}
/**
 * Base recommended rules. Angular projects should also use {@link ngRecommended} and {@link templateRecommended}
 */
const tsRecommendedBase = [
  eslintJs.configs.recommended,
  ...typescript_eslint.configs.recommendedTypeChecked,
  importPlugin.flatConfigs?.recommended,
  importPlugin.flatConfigs?.typescript,
  pluginSecurity.configs.recommended,
];

const tsRecommendedStrict = [
  ...tsRecommendedBase,
  ...typescript_eslint.configs.stylisticTypeChecked,
  prettier,
];

const ngRecommended = [...(angularLint?.configs.tsRecommended ?? [])];
const templateRecommended = [
  ...(angularLint?.configs.templateRecommended ?? []),
  // accessibility included because it overlaps with sonar html rules
  ...(angularLint?.configs.templateAccessibility ?? []),
  prettier,
];

/** Files matcher used for typescript files. */
const TS_FILES = ['**/*.ts', '**/*.tsx']

/** Files matcher used for test files. */
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
 * @returns true if Angular config is defined
 * @throws Error if Angular config is defined, but angular-eslint is not installed.
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
 * @throws Error if appPrefix is set but angular-eslint is not installed
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
      files: TS_FILES,
      extends: [
        ...(strict ? tsRecommendedStrict : tsRecommendedBase),
        ...(isAngular ? ngRecommended : []),
      ],
      // can't use processor: undefined because of runtime bug in eslint.
      ...(angularLint && isAngular ? { processor: angularLint.processInlineTemplates } : {}),
      languageOptions: {
        parserOptions: {
          // load all tsconfig files so that closest inclusive one is used.
          projectService: true,
          tsconfigRootDir: __dirname,
        },
        globals: {
          ...globals['shared-node-browser'],
        },
      },
      rules: {
        'eslint/no-ternary': 'off', // Nested is still banned so this is overly strict.
        '@typescript-eslint/consistent-type-imports': [
          // Helps remove unnecessary imports from compilation, improving tree shaking.
          enabledOnStrict,
          {
            fixStyle: 'separate-type-imports',
            prefer: 'type-imports',
          },
        ],
        '@typescript-eslint/unbound-method': 'off', // these are rarely typed correctly in external libraries
        '@typescript-eslint/explicit-function-return-type': enabledOnStrict, // Speeds up static analysis and ensures consistent interface types
        '@typescript-eslint/no-redundant-type-constituents': 'off', // Useful for explicit compatibility and TSDoc purposes. TS-Lint 8.48.0 made this rule incompatible with strictNullChecks off.
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
        'no-console': ['error', { allow: ['warn', 'error'] }], // use ngx-logger or equivalent instead of console for info/debug logs
        'prefer-arrow-callback': 'error',
        'import/no-unresolved': 'off', // checked by ts
        'import/namespace': 'off', // not supported yet for ESLint 9 https://github.com/import-js/eslint-plugin-import/issues/3099
        'import/no-deprecated': 'off', // covered by sonar and not supported yet for ESLint 9 https://github.com/import-js/eslint-plugin-import/issues/2245
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
      languageOptions: {
        globals: {
          ...globals.jasmine,
          ...globals.jest,
          ...globals['shared-node-browser'],
        },
      },
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
                    // fix any redundant changes
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
 * @type { { license: string, copyright: string } }
 */
const mit = {
  license: 'MIT',
  copyright: `Copyright ${new Date().getFullYear().toString()} Modus Operandi Inc. All Rights Reserved.`,
}

/**
 * Default license for multi-copyright code. Auto fix will stub with TO-DO comment
 * @type { { license: string, copyright: string } }
 */
const manual = {
    license: ' ',
    copyright: 'TODO',
  }

/**
 * Default licenses for Modus open source code.
 */
const header = {
  mit,
  manual,
};

exports.header = header;
exports.TS_FILES = TS_FILES;
exports.TEST_FILES = TEST_FILES;
exports.getFlatConfig = getFlatConfig;
exports.default = getFlatConfig;
