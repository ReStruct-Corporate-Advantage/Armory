const baseConfig = require('./jest.base.config');

module.exports = {
    ...baseConfig,
    roots: ['<rootDir>/projects/explore-ui-extended-column-option'],
    coverageDirectory: './coverage/projects/explore-ui-extended-column-option',
    reporters: [
        'default',
        [ 'jest-junit', {
            outputDirectory: 'test_reports',
            outputName: 'junit-lib.xml',
        } ]
    ]
};
