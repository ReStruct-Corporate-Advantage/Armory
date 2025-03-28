const child_process = require('child_process');
const fs = require('fs');

const glob = require('glob');
const lcovResultMerger = require('lcov-result-merger');
const through = require('through2');
const vfs = require('vinyl-fs');


const lcovFileGlob = './coverage/projects/**/lcov.info';
const outputFile = './coverage/lcov.info';

/**
 * Merge coverage.
 *
 * If the lcov command exists use that else use node package lcov-result-merge.
 */
function mergeCoverage() {
    const files = glob.sync(lcovFileGlob);

    try {
        // Throws exception if it doesn't exist.
        child_process.execSync('lcov --help');

        console.log('Using lcov command');

        const params = files.map(filePath => (['-a',filePath])).reduce((curr, acc) => acc.concat(curr), []);
        params.push(['-o',outputFile])

        const command = 'lcov';

        console.log(`Executing ${command} with ${params}`);

        child_process.execFileSync('lcov', params);
    } catch (error) {
        // LCOV command does not exist. Fall back to lcov.
        console.log('Fallback to lcov-result-merger');

        vfs
            .src(lcovFileGlob)
            .pipe(lcovResultMerger())
            .pipe(
                through.obj(function(file) {
                    if (outputFile) {
                        fs.writeFileSync(outputFile, file.contents);
                    } else {
                        process.stdout.write(file.contents);
                    }
                })
            );
    }
}

mergeCoverage();
