const baseConfig = require('./jest.base.config');

module.exports = {
    ...baseConfig,
    roots: ['<rootDir>/projects/explore-ui-core'],
    coverageDirectory: './coverage/projects/explore-ui-core',
    reporters: [
        'default',
        [ 'jest-junit', {
            outputDirectory: 'test_reports',
            outputName: 'junit-lib.xml',
        } ]
    ]
};
