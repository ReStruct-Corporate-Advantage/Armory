const baseConfig = require('./jest.base.config');

module.exports = {
    ...baseConfig,
    roots: ['<rootDir>/projects/portfolio-search'],
    coverageDirectory: './coverage/projects/portfolio-search',
    reporters: [
        'default',
        [ 'jest-junit', {
          outputDirectory: 'test_reports',
          outputName: 'junit-lib.xml',
        } ]
      ]
};
