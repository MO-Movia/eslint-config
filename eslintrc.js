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
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@angular-eslint/recommended',
        'plugin:@angular-eslint/template/process-inline-templates',
        'plugin:jest-formatting/recommended'
      ],
      rules: {
        'import-newlines/enforce': [
          'error',
          { items: 3 }
        ],
        'max-len': [
          'error',
          {
            code: 200,
            tabWidth: 2,
            ignorePattern:'^(import\\s.+\\sfrom\\s.+|\\} from)',
            ignoreUrls: true
          }
        ],
        'prefer-arrow-callback': 'error',
        '@stylistic/indent': ['error', 2],
        '@stylistic/semi': ['error', 'always'],
        '@stylistic/quotes': [
          'error',
          'single',
          {
            avoidEscape: true,
            allowTemplateLiterals: true
          }
        ],
        '@stylistic/object-curly-spacing': ['error', 'always'],
        '@stylistic/brace-style': 'error',
        '@stylistic/space-before-blocks': 2,
        '@stylistic/keyword-spacing': 2,
        '@stylistic/no-multi-spaces': [
          'error',
          {
            'ignoreEOLComments': true
          }
        ],
        '@stylistic/no-multiple-empty-lines': [
          'error',
          {
            max: 1,
            maxEOF: 0,
            maxBOF: 0
          }
        ],
        '@stylistic/lines-between-class-members': [
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
        '@stylistic/no-trailing-spaces': 'error',
        '@stylistic/no-mixed-spaces-and-tabs': 'error',
        '@stylistic/block-spacing': 'error',
        '@stylistic/arrow-spacing': 'error',
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
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: ['mo', 'maw'],
            style: 'camelCase'
          }
        ],
        '@angular-eslint/component-selector': [
          'error',
          {
            type: 'element',
            prefix: ['mo', 'maw'],
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
