import {LogoConfig} from '@models/export/logo-config.model';

/**
 * Test class for the LogoConfig model
 */
describe('Models/Export', function () {
    describe('LogoConfig tests', function () {

        /**
         * Tests the serialize method
         */
        it('Test serialize/deserialize method', function () {
            const exportConfig = new LogoConfig();

            exportConfig.logoPosition = 0;
            exportConfig.logoPresent = false;
            exportConfig.logoImageFile = 'filename';
            exportConfig.showLogoPreview = false;

            const serialized = exportConfig.serialize();

            const deserializedExportConfig = new LogoConfig(serialized);
            expect(deserializedExportConfig.logoPosition).toBe(0);
            expect(deserializedExportConfig.logoPresent).toBeFalsy();
            expect(deserializedExportConfig.logoImageFile).toBe('filename');
            expect(deserializedExportConfig.showLogoPreview).toBeFalsy();

            const expectedData = {
                logoPosition: 0,
                logoPresent: false,
                logoImageFile: 'filename',
                showLogoPreview: false
            };

            expect(serialized).toEqual(expectedData);
        });

        it('Test hasValidWidthAndHeight', () => {
            const logoConfig = new LogoConfig();
            // logoWidth & logoHeight are undefined
            expect(logoConfig.hasValidWidthAndHeight()).toBeFalsy();

            logoConfig.logoWidth = 0; // 0 is not considered valid
            logoConfig.logoHeight = 1;
            expect(logoConfig.hasValidWidthAndHeight()).toBeFalsy();

            logoConfig.logoWidth = 5;
            logoConfig.logoHeight = 0; // 0 is not considered valid
            expect(logoConfig.hasValidWidthAndHeight()).toBeFalsy();

            logoConfig.logoHeight = null;
            expect(logoConfig.hasValidWidthAndHeight()).toBeFalsy();

            logoConfig.logoHeight = NaN;
            expect(logoConfig.hasValidWidthAndHeight()).toBeFalsy();

            logoConfig.logoHeight = 20;
            expect(logoConfig.hasValidWidthAndHeight()).toBeTruthy();
        });
    });
});
