/**
 * @type {import('jest').Config}
 */
module.exports = {
  preset: 'jest-preset-angular',
  clearMocks: true,
  verbose: true,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  collectCoverage: true,
  coverageReporters: ['html', 'text-summary', 'lcov'],
  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|@angular|@ionic|@stencil|@capacitor|ionicons)'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  moduleNameMapper: {
    '^ionicons/(.*)$': '<rootDir>/node_modules/ionicons/$1',
  },
};
