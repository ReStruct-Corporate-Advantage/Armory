import {CommonUtils} from './common.utils';
import {CoreUrlConstants} from '../constants';

describe('CommonUtils', () => {
    describe('generateUniqueIdAsString Test', () => {
        it('should return a unique id and by default the length is 15', () => {
            expect(CommonUtils.generateUniqueIdAsString(10).length).toBe(10);
            expect(CommonUtils.generateUniqueIdAsString().length).toBe(15);
        });

        it('should NOT include \'-\' in the unique id', () => {
            expect(CommonUtils.generateUniqueIdAsString().includes('-')).toBeFalsy();
        });
    });

    /**
     * Test case for toSenteceCase method
     */
    it('Test toSentenceCase', () => {
        const test1 = 'Current';
        // Should not change anything
        expect(CommonUtils.toSentenceCase(test1)).toEqual('Current');
        const test2 = 'Prior Day';
        // Should only lower case the 'D' in 'Day'
        expect(CommonUtils.toSentenceCase(test2)).toEqual('Prior day');
        const test3 = 'Display options';
        // Should not change anything
        expect(CommonUtils.toSentenceCase(test3)).toEqual('Display options');
        const test4 = 'Test TEST Test';
        // Should only lower case the 'T' in the last 'Test'. All caps words are ignored
        expect(CommonUtils.toSentenceCase(test4)).toEqual('Test TEST test');
        const test5 = 'Month      End';
        // Should lower case the 'E' in 'End'. It doesn't matter how many spaces are between words
        expect(CommonUtils.toSentenceCase(test5)).toEqual('Month      end');
    });

    /**
     * Test case for getDateInLTFormat method
     */
    it('Test toSentenceCase', () => {
        const date = '01/26/2020'; // MM/DD/YYYY
        // Should not change anything
        expect(CommonUtils.getDateInLTFormat(date)).toEqual('26-01-2020');
    });

    it('Test decompressResponse', () => {
        const compressedResponse = 'eNqrVspIzcnJV7JSKs8vyklRqgUANWsF9w==';
        const expectedJson = {
            hello: 'world'
        };

        expect(CommonUtils.decompressResponse(compressedResponse)).toEqual(expectedJson);
    });


    it('Test decompressResponse special characters', () => {
        const compressedResponse = 'eNqFUstqGzEU/RWhtUlik0CZXWxMKBgn2NNuSgiy5mYsrJEmerQMxgv3F/IDTTdNmtLQkE3p0p8yP1Jdj5zJIpDNQTr3dXSPlnRmgC0y/UXRZEmFHWh1KXJvIKOJMx46bUIqnASa0P6OILYELpgkfM4M4w6MpR1q/WwK3OlwST4t2/KJl5BWJXYYeOt00WSFCqG49BmcujmYvucLcLvZxuPEJeVanmkrnNBqoKUvVGx0djpJQ4MQTlke7jOtFxecV5HbCQ4sGXhjQD2HmvppOnk/PtlSRRm54ZVn0kbuI5Me8CG0Xl/XX6/r9X29vqnXD2QoiRKbP5qAdZsbAopIFs7cg2R7m2+hfvMd4Q7hFuEnwj3Cb4QHhCeEvwj/EH58bipvnyt/ITw2WedB04vNRb3Hzhkx8w5Qs2mXjPtulzv2Uu4ecxneB6sOdXE/jR0k+rHqvG7aNIxReeiYG+3LftUYEd0JpzErtmnAvRGuIieY1mwbDdv6Y4Ff5JEvXzP0eDQKAqi3MNYKms9gm9+wOn8h+Y0/KJl1H8qMOcj6Fc4VhQ3i5yGE5KgNh+BBd7/3br930Dsi3cOke0iG05Su/gNN2x64';
        const expectedResponse = '{"breakdown":{"isConfigured":true,"breakdownTitle":"Breakdown special characters","subSectors":[{"breakdownRuleType":"CustomSector","includeOtherBucket":true,"rule":{"colPositionColumnType":"PORT","colTag":"book_ccy","colTitle":"Book Currency","colType":"STRING","compType":"Equals","compValues":["こんにちは El niño está en la escuela.à","â","é","è","ê","ë","î","ï","ô","ù","û","çvà","è","é","ì","ò","ù"],"customSectorType":"Attributes","ruleType":"Rule","includeNullValues":false},"title":"Custom Sector"},{"breakdownRuleType":"String","groupByColumn":{"columnName":"Security Group","columnTag":"sec_group","positionColumnType":"ALL"},"useNoneBuckets":true}]},"title":"Breakdown special characters","lastUpdatedBy":"simsingh","dateLastUpdated":"01/28/2025 14:14 EST"}';
        expect(CommonUtils.decompressResponse(compressedResponse, false)).toEqual(expectedResponse);
    });

    describe('isLocalHost', () => {
        it('isLocalHost', () => {
            jest.spyOn(CommonUtils, 'getLocation').mockImplementation(() => {
                return {
                    origin: 'http://localhost:3000'
                };
            });
            expect(CommonUtils.isLocalHost()).toBeTruthy();
        });
    });

    describe('isExploreBeta tests', () => {
        it('should return false if location includes localhost', () => {
            jest.spyOn(CommonUtils, 'getLocation').mockReturnValue({pathname: 'localhost/explore'});
            const result = CommonUtils.isExploreBeta();
            expect(result).toBe(false);
        });

        it('should return true if location includes "explore-beta"', () => {
            jest.spyOn(CommonUtils, 'getLocation').mockReturnValue({pathname: 'dev.blackrock.com/explore-beta'});
            const result = CommonUtils.isExploreBeta();
            expect(result).toBe(true);
        });

        it('should return false if location does not include "explore-beta"', () => {
            jest.spyOn(CommonUtils, 'getLocation').mockReturnValue({pathname: 'dev.blackrock.com/explore-gamma'});
            const result = CommonUtils.isExploreBeta();
            expect(result).toBe(false);
        });
    });

    describe('isExploreGamma tests', () => {
        it('should return false if location includes localhost', () => {
            jest.spyOn(CommonUtils, 'getLocation').mockReturnValue({pathname: 'localhost/explore'});
            const result = CommonUtils.isExploreGamma();
            expect(result).toBe(false);
        });

        it('should return true if location includes "explore-gamma"', () => {
            jest.spyOn(CommonUtils, 'getLocation').mockReturnValue({pathname: 'dev.blackrock.com/explore-gamma'});
            const result = CommonUtils.isExploreGamma();
            expect(result).toBe(true);
        });

        it('should return false if location does not include "explore-gamma"', () => {
            jest.spyOn(CommonUtils, 'getLocation').mockReturnValue({pathname: 'dev.blackrock.com/explore-beta'});
            const result = CommonUtils.isExploreGamma();
            expect(result).toBe(false);
        });
    });

    describe('Aladdin climate link tests', () => {
        const location = {
            origin: 'https://tst.blackrock.com'
        };

        it('should get DEV Aladdin Climate url', () => {
            jest.spyOn(CommonUtils, 'isLocalHost').mockReturnValueOnce(true);
            jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValueOnce(false);
            jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValueOnce(false);
            jest.spyOn(CommonUtils, 'getLocation').mockReturnValueOnce(location);

            const url = CommonUtils.getModeSensitiveApplicationUrl(CoreUrlConstants.ALADDIN_CLIMATE_PATH, CoreUrlConstants.ALADDIN_CLIMATE_BETA_PATH);
            expect(url).toEqual('https://dev.blackrock.com/apps/aladdin-climate/#');
        });

        it('should get DEV Aladdin Climate beta url for explore beta', () => {
            jest.spyOn(CommonUtils, 'isLocalHost').mockReturnValueOnce(true);
            jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValueOnce(true);
            jest.spyOn(CommonUtils, 'getLocation').mockReturnValueOnce(location);

            const url = CommonUtils.getModeSensitiveApplicationUrl(CoreUrlConstants.ALADDIN_CLIMATE_PATH, CoreUrlConstants.ALADDIN_CLIMATE_BETA_PATH);

            expect(url).toEqual('https://dev.blackrock.com/apps/aladdin-climate-beta/#');
        });

        it('should get DEV Aladdin Climate beta url for explore gamma', () => {
            jest.spyOn(CommonUtils, 'isLocalHost').mockReturnValueOnce(true);
            jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValueOnce(false);
            jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValueOnce(true);
            jest.spyOn(CommonUtils, 'getLocation').mockReturnValueOnce(location);

            const url = CommonUtils.getModeSensitiveApplicationUrl(CoreUrlConstants.ALADDIN_CLIMATE_PATH, CoreUrlConstants.ALADDIN_CLIMATE_BETA_PATH);

            expect(url).toEqual('https://dev.blackrock.com/apps/aladdin-climate-beta/#');
        });

        it('should get current environment Aladdin Climate url', () => {
            jest.spyOn(CommonUtils, 'isLocalHost').mockReturnValueOnce(false);
            jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValueOnce(false);
            jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValueOnce(false);
            jest.spyOn(CommonUtils, 'getLocation').mockReturnValueOnce(location);

            const url = CommonUtils.getModeSensitiveApplicationUrl(CoreUrlConstants.ALADDIN_CLIMATE_PATH, CoreUrlConstants.ALADDIN_CLIMATE_BETA_PATH);

            expect(url).toEqual('https://tst.blackrock.com/apps/aladdin-climate/#');
        });

        it('should get current environment Aladdin Climate beta url', () => {
            jest.spyOn(CommonUtils, 'isLocalHost').mockReturnValueOnce(false);
            jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValueOnce(false);
            jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValueOnce(true);
            jest.spyOn(CommonUtils, 'getLocation').mockReturnValueOnce(location);

            const url = CommonUtils.getModeSensitiveApplicationUrl(CoreUrlConstants.ALADDIN_CLIMATE_PATH, CoreUrlConstants.ALADDIN_CLIMATE_BETA_PATH);

            expect(url).toEqual('https://tst.blackrock.com/apps/aladdin-climate-beta/#');
        });
    });

    it('test compareTheValues', () => {
        const a = ['a', 'b'];
        const b = ['b', 'a'];
        expect(CommonUtils.compareTheValues(a, b)).toBeTruthy();
    });
});
