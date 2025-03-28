import {defineConfig} from 'cypress';
import browserify from '@cypress/browserify-preprocessor';
import resolve from 'resolve';
import {default as cucumber} from 'cypress-cucumber-preprocessor';
import {addMatchImageSnapshotPlugin} from 'cypress-image-snapshot/plugin';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:4100',
        setupNodeEvents(on, config) {
            const options = {
                ...browserify.defaultOptions,
                typescript: resolve.sync('typescript', { baseDir: config.projectRoot } as any),
            };
            on('file:preprocessor', (cucumber as any).default(options));
            addMatchImageSnapshotPlugin(on, config);
            on('before:browser:launch', (browser, launchOptions) => {
                if (browser.name === 'chrome' && browser.isHeadless) {
                    launchOptions.args.push('--window-size=1400,1200', '--force-device-scale-factor=1');
                }
                if (browser.name === 'edge' && !browser.isHeadless) { // Edge browser in headed mode
                    launchOptions.args.push('--window-size=1400,1200', '--force-device-scale-factor=1');
                }
                if (browser.name === 'electron' && browser.isHeadless) {
                    launchOptions.preferences.width = 1200;
                    launchOptions.preferences.height = 800;
                }

                return launchOptions;
            });
        },
        specPattern: ['cypress/test/bdd/features/*.feature'],
    },
    watchForFileChanges: false,
    defaultCommandTimeout: 10000,
    includeShadowDom: true,
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    env: {
        introPageUrl: '/apps/explore-beta/?showIntro=true&loadCuratedReports=false',
        mainPageUrl_SNP100_20240205: '/apps/explore-beta/?portfolio=SNP100&todayOverride=02/05/2024&loadCuratedReports=false',
        mainPageUrl_SNP100_20230202: '/apps/explore-beta/?portfolio=SNP100&todayOverride=02/02/2023&loadCuratedReports=false',
        mainPageUrl_BGO_20190611: '/apps/explore-beta/?portfolio=BGO&todayOverride=06/11/2019&loadCuratedReports=false',
        'mainPageUrl_SPE7US-C_20220819': '/apps/explore-beta/?portfolio=SPE7US-C&todayOverride=08/19/2022&loadCuratedReports=false'
    }
} as any);
