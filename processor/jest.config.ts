/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./test/jest.setup.ts'],
  roots: ['./test'],
  // jwks-rsa (via @commercetools/connect-payments-sdk) does `require('jose')`, and
  // jose >=6 is ESM-only. Node >=22 supports require(ESM) so this works at runtime,
  // but Jest's CommonJS module registry does not - it parses the file as CJS and
  // fails on `export`. Transpile jose to CommonJS for tests instead.
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: { allowJs: true, module: 'CommonJS' } }],
  },
  transformIgnorePatterns: ['/node_modules/(?!jose/)'],
};
