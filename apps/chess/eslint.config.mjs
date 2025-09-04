import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  { ignores: ['dist'] },
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        fetch: true,
        console: true,
        localStorage: true,
        crypto: true,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.spec.json'],
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
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
];


