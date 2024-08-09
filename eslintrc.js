module.exports = {
  root: true,
  ignorePatterns: [
    'dist',
    'coverage',
    'node_modules',
  ],
  parserOptions: { ecmaVersion: 'latest' },
  env: { es6: true },
  plugins: [
    '@stylistic',
    'import-newlines',
    'jest-formatting'
  ],
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@angular-eslint/recommended',
        'plugin:@angular-eslint/template/process-inline-templates',
        'plugin:jest-formatting/recommended',
        'eslint:recommended'
      ],
      rules: {
        indent: ['error', 2],
        semi: ['error', 'always'],
        quotes: [
          'error',
          'single',
          {
            avoidEscape: true,
            allowTemplateLiterals: true
          }
        ],
        'object-curly-spacing': ['error', 'always'],
        'brace-style': 'error',
        'space-before-blocks': 2,
        'keyword-spacing': 2,
        'max-len': [
          'error',
          {
            code: 200,
            tabWidth: 2,
            ignorePattern:'^(import\\s.+\\sfrom\\s.+|\\} from)',
            ignoreUrls: true
          }
        ],
        'no-multiple-empty-lines': [
          'error',
          {
            max: 1,
            maxEOF: 0,
            maxBOF: 0
          }
        ],
        'lines-between-class-members': [
          'error',
          {
            enforce: [
              {
                blankLine: 'always',
                prev: 'method',
                next: 'method'
              }
            ]
          }
        ],
        'prefer-arrow-callback': 'error',
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          { 
            overrides: {
              constructors: 'no-public'
            }
          }
        ],
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowTypedFunctionExpressions: true
          }
        ],
        '@stylistic/block-spacing': 'error',
        '@stylistic/arrow-spacing': 'error',
        'import-newlines/enforce': [
          'error',
          { items: 3 }
        ],
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: 'mo',
            style: 'camelCase'
          }
        ],
        '@angular-eslint/component-selector': [
          'error',
          {
            type: 'element',
            prefix: 'mo',
            style: 'kebab-case'
          }
        ]
      }
    },
    {
      files: ['*.html'],
      extends: [
        'plugin:@angular-eslint/template/recommended',
        'plugin:@angular-eslint/template/accessibility'
      ],
      rules: {}
    }
  ]
};
