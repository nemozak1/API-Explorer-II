module.exports = {
    transform: {
      '^.+\\.ts?$': 'ts-jest',
      "^.+\\.(js)$": "babel-jest",
    },
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    detectOpenHandles: true,
  };