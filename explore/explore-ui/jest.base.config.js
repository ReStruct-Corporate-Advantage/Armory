const {pathsToModuleNameMapper} = require('ts-jest');
const {compilerOptions} = require('./tsconfig'); // replace with the path to your tsconfig.json file

const transformIgnorePackages = [
    'lodash-es',
    'uuid',
    '@blk',
    '@qbstr',
    '.*\\.mjs$',
    '.*html2canvas.*',
    '.*tslib.*'
];

module.exports = {
    preset: 'jest-preset-angular/presets/defaults-esm',
    setupFilesAfterEnv: [
        "<rootDir>/setupJest.ts",
        "fake-indexeddb/auto"
    ],
    testEnvironment: './test-env.js',
    transform: {
        '^.+\\.(ts|mjs|js|html)$': ['jest-preset-angular', {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$',
                isolatedModules: true,
                useESM: true,
            }
        ],
    },
    snapshotSerializers: [
        "jest-preset-angular/build/serializers/no-ng-attributes",
        "jest-preset-angular/build/serializers/ng-snapshot",
        "jest-preset-angular/build/serializers/html-comment",
    ],
    transformIgnorePatterns: [
        // do NOT add <rootDir> prefix here
        `node_modules/(?!(${transformIgnorePackages.join('|')}))`
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'html', 'json', '.mjs'],
    moduleNameMapper: {
        '^uuid$': require.resolve('uuid'),
        ...pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/'}),
    }
};
