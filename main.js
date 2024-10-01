// @ts-check

import eslintjs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import sonarjs from 'eslint-plugin-sonarjs';
import jest from 'eslint-plugin-jest';
import { flatConfigs as importPlugin } from 'eslint-plugin-import';

const angularLint = await import('angular-eslint')
  .then((module) => module.default)
  .catch(() => {
    console &&
      console.log('angular-eslint not installed. Excluded from linting');
    // filler
    return {
      processInlineTemplates: undefined,
      configs: {
        tsAll: [],
        tsRecommended: [],
        templateAll: [],
        templateRecommended: [],
        templateAccessibility: [],
      },
    };
  });

/**
 * Base recommended rules. Angular projects should also use {@link ngRecommended} and {@link templateRecommended}
 */
const tsRecommendedBase = [
  eslintjs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  importPlugin.recommended,
  importPlugin.typescript,
  sonarjs.configs.recommended,
];

/**
 * Strict recommended rules. Angular projects should also use {@link ngRecommended} and {@link templateRecommended}
 */
const tsRecommendedStrict = [
  ...tsRecommendedBase,
  eslintPluginPrettierRecommended,
];

/**
 * Angular recommended Typescript rules. Angular projects should also use {@link templateRecommended}
 */
const ngRecommended = [...angularLint.configs.tsRecommended];

/**
 * Angular recommended html template rules. Angular projects should also use {@link ngRecommended}
 */
const templateRecommended = [
  ...angularLint.configs.templateRecommended,
  // accessibility included because it overlaps with sonar html rules
  ...angularLint.configs.templateAccessibility,
];

/**
 *
 * @param {string | undefined | null} app prefix to use for the angular library.
 * For non-Angular projects, Angular rules are excluded if not provided. default undefined
 * @param {boolean | undefined | null} strict whether to use the stricter set of rule configurations. default false
 * @returns a preconfigured flat ESLint configuration
 */
export function getFlatConfig(app = undefined, strict = false) {
  const isAngular = !!(
    angularLint &&
    typeof app === 'string' &&
    app.trim() !== ''
  );
  strict = !!strict;
  return tseslint.config(
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
      processor: app ? angularLint.processInlineTemplates : undefined,
      languageOptions: {
        parserOptions: {
          project: isAngular ? './tsconfig.spec.json' : './tsconfig.json',
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
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
      name: 'Angular Templates',
      files: ['**/*.html'],
      extends: [...(isAngular ? templateRecommended : [])],
      rules: {},
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
export const angularRecommended = getFlatConfig('mo', false);

/**
 * Adefault configuration for plain typescript apps and libraries
 */
export const tsRecommended = getFlatConfig();

export default angularRecommended;
