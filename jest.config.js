module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/fileMock.js',
    '@swrpg-online/art/(.*)': '<rootDir>/__mocks__/fileMock.js'
  },
}; 