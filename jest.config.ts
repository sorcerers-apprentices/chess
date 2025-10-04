import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',

  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(ts|mjs|js)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        //stringifyContentPathRegex: '\\.html$',
        isolatedModules: true,
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:@angular|@angular/cdk|rxjs|tslib|@supabase|@ngrx|@taiga-ui|@angular-devkit|@ngtools|@ng-web-apis|@maskito|@ngx-translate)/)',
  ],

  moduleNameMapper: {
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/src/test/mocks/file.mock.ts',
    '\\.html$': '<rootDir>/src/test/empty-string-mock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  moduleFileExtensions: ['ts', 'js'],

  verbose: true,
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};

export default config;
