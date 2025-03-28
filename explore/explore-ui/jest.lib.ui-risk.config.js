const baseConfig = require('./jest.base.config');

module.exports = {
    ...baseConfig,
    roots: ['<rootDir>/projects/explore-ui-risk'],
    coverageDirectory: './coverage/projects/explore-ui-risk',
    reporters: [
        'default',
        [ 'jest-junit', {
            outputDirectory: 'test_reports',
            outputName: 'junit-lib.xml',
        } ]
    ]
};
