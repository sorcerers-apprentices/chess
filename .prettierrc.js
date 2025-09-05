const config = {
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  printWidth: 120,
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'angular',
      },
    },
  ],
};

export default config;
