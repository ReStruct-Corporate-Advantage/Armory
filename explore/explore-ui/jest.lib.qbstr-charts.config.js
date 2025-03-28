const baseConfig = require('./jest.base.config');

module.exports = {
    ...baseConfig,
    roots: ['<rootDir>/projects/qbstr-charts'],
    coverageDirectory: './coverage/projects/qbstr-charts',
    reporters: [
        'default',
        [ 'jest-junit', {
          outputDirectory: 'test_reports',
          outputName: 'junit-lib.xml',
        } ]
      ]
};
