const baseConfig = require('./jest.base.config');

module.exports = {
    ...baseConfig,
    roots: ['<rootDir>/projects/explore-ui-look-through-settings'],
    coverageDirectory: './coverage/projects/explore-ui-look-through-settings',
    reporters: [
        'default',
        [ 'jest-junit', {
            outputDirectory: 'test_reports',
            outputName: 'junit-lib.xml',
        } ]
    ]
};
