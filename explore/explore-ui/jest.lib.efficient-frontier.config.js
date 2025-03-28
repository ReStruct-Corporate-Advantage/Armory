const baseConfig = require('./jest.base.config');

module.exports = {
    ...baseConfig,
    roots: ['<rootDir>/projects/explore-efficient-frontier'],
    coverageDirectory: './coverage/projects/explore-efficient-frontier',
    reporters: [
        'default',
        [ 'jest-junit', {
            outputDirectory: 'test_reports',
            outputName: 'junit-lib.xml',
        } ]
    ]
};
