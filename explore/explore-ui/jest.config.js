const baseConfig = require('./jest.base.config');

module.exports = {
    ...baseConfig,
    roots: ['<rootDir>/src'],
    coverageDirectory: './coverage/projects/explore-ui',
    collectCoverage: false,
    reporters: [
        'default',
        [ 'jest-junit', {
            outputDirectory: 'test_reports',
            outputName: 'junit.xml',
        } ]
    ]
};
