import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.js';
import tseslint from 'typescript-eslint';
import angular from '@angular-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import angularTemplateParser from '@angular-eslint/template-parser';

export default [
  { ignores: ['dist'] },
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    ignores: ['**/jest.config.ts', '**/test-setup.ts'],
    languageOptions: {
      globals: {
        fetch: true,
        console: true,
        localStorage: true,
        crypto: true,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: ['apps/chess/tsconfig.app.json'],
      },
    },
    linterOptions: {
      noInlineConfig: true,
    },
    plugins: {
      '@angular-eslint': angular,
      '@angular-eslint/template': angularTemplate,
      prettier: prettierPlugin,
      unicorn: eslintPluginUnicorn,
      '@typescript-eslint': tseslint.plugin,
    },

    rules: {
      'max-len': ['error', 180],
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [0, 1, -1, 2, -2],
          ignoreReadonlyClassProperties: true,
        },
      ],
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      'no-magic-strings': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'explicit', overrides: { constructors: 'off' } },
      ],
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-null': 'off',
      'unicorn/number-literal-case': 'off',
      'unicorn/numeric-separators-style': 'off',
      'unicorn/prevent-abbreviations': 'off',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,
    },
  },
];
