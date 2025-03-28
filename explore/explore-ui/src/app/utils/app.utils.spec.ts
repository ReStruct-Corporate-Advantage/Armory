import {AppUtils} from './app.utils';
import {URLConstants} from '../constants';
import {
    ColumnConfig,
    CommonUtils,
    CoreDefinitionStore,
    CoreUserMetaDataStore,
    TokenConstants,
    UserMetaData,
    TokenUtils,
    CoreAppUtils
} from '@blk/explore-ui-core';
import {Widget} from '@models/widget/widget.model';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {Buffer} from 'buffer';

describe('AppUtils', () => {

    describe('isCtrlPressed Test', () => {
        it('should return true if ctrl on windows or cmd on mac is pressed', () => {
            const event1 = {ctrlKey: true};
            expect(AppUtils.isCtrlPressed(event1)).toBeTruthy();

            const event2 = {metaKey: true};
            expect(AppUtils.isCtrlPressed(event2)).toBeTruthy();

            const event3 = {ctrlKey: false};
            expect(AppUtils.isCtrlPressed(event3)).toBeFalsy();

            const event4 = {metaKey: false};
            expect(AppUtils.isCtrlPressed(event4)).toBeFalsy();
        });
    });

    describe('isShiftPressed Test', () => {
        it('should return true if ctrl on windows or cmd on mac is pressed', () => {
            const event1 = {shiftKey: true};
            expect(AppUtils.isShiftPressed(event1)).toBeTruthy();

            const event2 = {shiftKey: false};
            expect(AppUtils.isShiftPressed(event2)).toBeFalsy();
        });
    });

    describe('Test Get HREF method', () => {
        it('Returns dev link if localhost', () => {
            jest.spyOn(CommonUtils, 'isLocalHost').mockReturnValueOnce(true);
            expect(AppUtils.getHref()).toEqual(URLConstants.DEV_EXPLORE_BETA_URL);
        });
        it('Returns href without URL constants', () => {
            const location = {href: 'https://dev.blackrock.com/apps/explore-beta/?workspace=1252333'};
            jest.spyOn(CommonUtils, 'getLocation').mockReturnValue(location);
            jest.spyOn(CommonUtils, 'isLocalHost').mockReturnValueOnce(false);
            expect(AppUtils.getHref()).toEqual(URLConstants.DEV_EXPLORE_BETA_URL);
        });
    });

    describe('getBaseUrl Test', () => {
        it('should getBaseUrl for non-Explore http2bms URL', () => {
            expect(AppUtils.getBaseUrl(false)).toBe('/bms/request/app/');
        });
        it('should getBaseUrl for prod', () => {
            jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(false);
            jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValue(false);
            expect(AppUtils.getBaseUrl()).toBe('/bms/request/app/explore');
        });

        it('should getBaseUrl for beta', () => {
            jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(true);
            jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValue(false);
            expect(AppUtils.getBaseUrl()).toBe('/bms/request/app/explore-beta');
        });

        it('should getBaseUrl for gamma', () => {
            jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(false);
            jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValue(true);
            expect(AppUtils.getBaseUrl()).toBe('/bms/request/app/explore-gamma');
        });

        it('should getBaseUrl for external BEN clients', () => {
            jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(false);
            jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValue(false);
            jest.spyOn(CoreAppUtils, 'isExternalBENClient').mockReturnValue(true);
            expect(AppUtils.getBaseUrl()).toBe('/risk/bms/request/app/explore');

            jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(true);
            expect(AppUtils.getBaseUrl()).toBe('/risk/bms/request/app/explore-beta');
        });
    });

    describe('getCustomSource Test', () => {
        it('should return sourceId if any', () => {
            expect(AppUtils.getCustomSource()).toBe('');

            jest.spyOn(AppUtils, 'getCustomSourceId').mockReturnValue('12345');
            expect(AppUtils.getCustomSource()).toBe('/?__sourceId=12345');
        });
    });

    /**
     * Test case for method isAladdinViewEnabled
     */
    it('Test isAladdinViewEnabled', function () {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        expect(AppUtils.isAladdinViewEnabled()).not.toBe(true);

        CoreUserMetaDataStore.userMetaData.launchApps = [AppUtils.ALADDIN_VIEW];
        expect(AppUtils.isAladdinViewEnabled()).toBe(true);
    });

    /**
     * Test case for method isAnSerEnabled
     */
    it('Test isAnSerEnabled', function () {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        expect(AppUtils.isAnSerEnabled()).not.toBe(true);

        CoreUserMetaDataStore.userMetaData.launchApps = [AppUtils.ANSER];
        expect(AppUtils.isAnSerEnabled()).toBe(true);
    });

    /**
     * Test case for method isAladdinResearchEnabled
     */
    it('Test isAladdinResearchEnabled', function () {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        expect(AppUtils.isAladdinResearchEnabled()).not.toBe(true);

        CoreUserMetaDataStore.userMetaData.launchApps = [AppUtils.ALADDIN_RESEARCH];
        expect(AppUtils.isAladdinResearchEnabled()).toBe(true);
    });

    /**
     * Test case for method isSecurityMasterEnabled
     */
    it('Test isSecurityMasterEnabled', function () {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        expect(AppUtils.isSecurityMasterEnabled()).not.toBe(true);

        CoreUserMetaDataStore.userMetaData.launchApps = [AppUtils.SECURITY_MASTER];
        expect(AppUtils.isSecurityMasterEnabled()).toBe(true);
    });

    /**
     * Test case for method isPricePopupFeatureEnabled
     */
    it('Test isPricePopupFeatureEnabled', function () {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_PRICE_CHART] = 'N';
        expect(AppUtils.isPricePopupFeatureEnabled()).toBe(false);

        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_PRICE_CHART] = 'Y';
        expect(AppUtils.isPricePopupFeatureEnabled()).not.toBe(true);

        CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
        expect(AppUtils.isPricePopupFeatureEnabled()).toBe(true);
    });

    describe('Test fileDownloaderAppName', () => {
        it('Beta', () => {
            jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(true);
            jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValue(false);
            expect(AppUtils.getFileDownloaderAppName()).toBe(AppUtils.FILE_DOWNLOADER_BETA);
        });

        it('Gamma', () => {
            jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(false);
            jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValue(true);
            expect(AppUtils.getFileDownloaderAppName()).toBe(AppUtils.FILE_DOWNLOADER_GAMMA);
        });

        it('Prod', () => {
            jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(false);
            jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValue(false);
            expect(AppUtils.getFileDownloaderAppName()).toBe(AppUtils.FILE_DOWNLOADER);
        });
    });

    describe('Test launchApp', () => {
        it('No params', () => {
            jest.spyOn(CommonUtils, 'isLocalHost').mockReturnValue(true);
            jest.spyOn(window, 'open').mockImplementation((url, name) => {
                expect(url).toBe('https://dev.blackrock.com/LaunchApp/TestApp?close_window=1');
                expect(name).toBe('LaunchTestApp');
            });
            AppUtils.launchApp('TestApp');
        });

        it('params', () => {
            jest.spyOn(CommonUtils, 'isLocalHost').mockReturnValue(true);
            jest.spyOn(window, 'open').mockImplementation((url, name) => {
                expect(url).toBe('https://dev.blackrock.com/LaunchApp/TestApp?close_window=1&param1=value1&param2=value2');
                expect(name).toBe('LaunchTestApp');
            });
            AppUtils.launchApp('TestApp', 'param1=value1&param2=value2');
        });
    });

    /**
     * Test case for method isClimateEnabled
     */
    it('Test isClimateEnabled', function () {
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_CLIMATE_ENABLED] = 'N';
        expect(AppUtils.isClimateEnabled()).toBe(false);

        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_CLIMATE_ENABLED] = 'Y';
        expect(AppUtils.isClimateEnabled()).toBe(true);
    });

    /**
     * Test case for method isTelemetryTrackingEnabled
     */
    it('Test isTelemetryTrackingEnabled', function () {
        const urlParamSpy = jest.spyOn(AppUtils, 'getURLParamWithDefault');
        urlParamSpy.mockReturnValue('false');
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_TELEMETRY_ENABLED] = 'N';
        expect(AppUtils.isTelemetryTrackingEnabled()).toBe(false);
        urlParamSpy.mockReturnValue('true');
        expect(AppUtils.isTelemetryTrackingEnabled()).toBe(false);

        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_TELEMETRY_ENABLED] = 'Y';
        expect(AppUtils.isTelemetryTrackingEnabled()).toBe(true);
        urlParamSpy.mockReturnValue('false');
        expect(AppUtils.isTelemetryTrackingEnabled()).toBe(false);
    });

    describe('Test checkBrowser', () => {

        function setUserAgent(userAgent) {
            Object.defineProperty(navigator, "userAgent", {
                get: function () {
                    return userAgent;
                },
                configurable: true
            });
        }

        it('Test checkBrowser', () => {
            setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36');
            expect(AppUtils.checkBrowser()).toBe('Chrome');

            setUserAgent('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)');
            expect(AppUtils.checkBrowser()).toBe('Internet Explorer');

            setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 11.1; ) Gecko/20100101 Firefox/84.0');
            expect(AppUtils.checkBrowser()).toBe('FireFox');

            setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15 ');
            expect(AppUtils.checkBrowser()).toBe('Safari');

            setUserAgent(' Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36 OPR/73.0.3856.329');
            expect(AppUtils.checkBrowser()).toBe('Opera');


        });

    });

    describe('getConfigColumnTags Test', () => {
        function getMetaData() {
            const metaData = new WidgetDataStoreMetaData();
            const cols = new ColumnSet();
            cols.columns[0] = new ColumnConfig({'columnTag': 'security_description',
                'columnKey': 'security_description_1'});

            // Previous code only looking for columns with name equals 'columns'
            metaData.inputs.set('sizeColumn', cols);
            metaData.inputs.set('breakdownTree', new Breakdown());
            return metaData;
        }
        it('should return all column Tags as list', () => {
            const widget = new Widget();
            const datastore = new WidgetDataStore();
            const metadata = getMetaData();

            datastore.metaData = metadata;
            widget.dataStore = datastore;

            const columnTags = AppUtils.getConfigColumnTags(widget);
            expect(columnTags[0]).toBe('security_description');
        });
    });
    describe('encodeRequest tests', () => {
        it('should encode request', () => {
            jest.spyOn(AppUtils, 'getURLParamWithDefault').mockReturnValue(null);
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            const req = {
                'portfolio': 'ILB',
                'fullPortfolioName': 'iShares Government Inflation ETF',
                'portfolioIdentifier': 'ILB',
                'portId': 'ILB12345',
                'forDate': '09/04/2018',
                'currency': 'AUD',
                'holidayCalendar': 'GP_REG_AUSTRALIA_STD',
                'includeAliasPortfolios': false,
                'benchSelection': 'RISK',
                'benchOrder': 1,
                'splitPositionTypes': 'XC,XF,XH,XS,SW,O,ST',
                'positionMode': 'AS_OF_W',
                'factorAttributionType': 'FI_MANDATE',
                'columns': [{
                    'columnTag': 'security_description',
                    'columnKey': 'security_description_1',
                    'positionColumnType': 'ALL',
                    'title': 'Security Description'
                }, {
                    'columnTag': 'cusip',
                    'columnKey': 'cusip_0',
                    'positionColumnType': 'ALL',
                    'title': 'CUSIP'
                }, {
                    'columnTag': 'pct_mv',
                    'columnKey': 'pct_mv_1',
                    'positionColumnType': 'PORT',
                    'title': 'Market Value %'
                }, {
                    'columnTag': 'sec_group',
                    'columnKey': 'sec_group_hidden',
                    'positionColumnType': 'ALL',
                    'title': 'Security Group',
                    'visible': false
                }, {
                    'columnTag': 'sec_type',
                    'columnKey': 'sec_type_hidden',
                    'positionColumnType': 'ALL',
                    'title': 'Security Type',
                    'visible': false
                }
                ],
                'breakdownTree': '{\'breakdown\':{\'breakdownTitle\':\'Barclays Four Pillar\',\'subSectors\':[{\'breakdownRuleType\':\'String\',\'groupByColumn\':{\'columnName\':\'Barclays Four Pillar Sectors (gp_BARCSECT4P) - Level 1\',\'columnTag\':\'grsector`gp_BARCSECT4P`1\',\'dataType\':\'STRING\'},\'subSectors\':[{\'breakdownRuleType\':\'String\',\'groupByColumn\':{\'columnName\':\'Barclays Four Pillar Sectors (gp_BARCSECT4P) - Level 2\',\'columnTag\':\'grsector`gp_BARCSECT4P`2\',\'dataType\':\'STRING\'},\'subSectors\':[{\'breakdownRuleType\':\'String\',\'groupByColumn\':{\'columnName\':\'Barclays Four Pillar Sectors (gp_BARCSECT4P) - Level 3\',\'columnTag\':\'grsector`gp_BARCSECT4P`3\',\'dataType\':\'STRING\'},\'subSectors\':[{\'breakdownRuleType\':\'String\',\'groupByColumn\':{\'columnName\':\'Barclays Four Pillar Sectors (gp_BARCSECT4P) - Level 4\',\'columnTag\':\'grsector`gp_BARCSECT4P`4\',\'dataType\':\'STRING\'},\'useNoneBuckets\':false}],\'useNoneBuckets\':false}],\'useNoneBuckets\':false}],\'useNoneBuckets\':false}]},\'title\':\'Barclays Four Pillar\'}',
                'isTopBottomSectoring': false,
                'isDisplayAtGroupNode': false,
                'isLightLookthroughEnabled': false,
                'normalizedWidgetFilter': false,
                'benchmarkPositionAggregationType': 'NONE',
                'closedPositionAggregationType': 'NONE',
                'portfolioPositionAggregationType': 'NONE',
                'overrideDateSortByOldest': false,
                'riskSettings': {
                    'riskMatrix': 1
                },
                'title': 'Risk and Exposure',
                'type': 'agGrid',
                'benchmark': 'UBSAUGVSIL',
                'benchmarkFullName': 'Bloomberg AusBond Infl Govt 0+ Yr Index',
                'createNestedNoneBuckets': false,
                'createNestedOtherBuckets': false,
                'dataFormat': 'COMPACT_JSON'
            };
            const result: any = AppUtils.encodeRequest(req);
            const decodedReq = Buffer.from(result.requestParams as string, 'base64').toString();
            expect(decodedReq).toEqual(JSON.stringify(req));
            expect(result.portIdsLRO).toStrictEqual(['ILB12345']);
        });

        it('should set portIdsLRO for multi-port comparison', () => {
            jest.spyOn(AppUtils, 'getURLParamWithDefault').mockReturnValue(null);
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);

            const req1 = {
                'portfolio': 'ILB',
                'fullPortfolioName': 'iShares Government Inflation ETF',
                'portfolioIdentifier': 'ILB',
                'portId': 'ILB12345',
                'forDate': '09/04/2018',
                'currency': 'AUD'
            };
            const req2 = {
                'portfolio': 'PEP',
                'fullPortfolioName': 'PEP ETF',
                'portfolioIdentifier': 'PEP',
                'portId': 'PEP12345',
                'forDate': '09/04/2018',
                'currency': 'USD'
            };
            const result = AppUtils.encodeRequest({multiRequests: [req1, req2]});
            expect(result.portIdsLRO).toStrictEqual(['ILB12345', 'PEP12345']);
        });

        it('should not encode request when url param set to false', () => {
            jest.spyOn(AppUtils, 'getURLParamWithDefault').mockReturnValue('false');
            const req = {
                'portfolio': 'ILB',
                'fullPortfolioName': 'iShares Government Inflation ETF',
                'portfolioIdentifier': 'ILB',
                'portId': 'ILB12345',
                'forDate': '09/04/2018',
                'currency': 'AUD'
            };
            const result = AppUtils.encodeRequest(req);
            expect(result).toStrictEqual({portIdsLRO: ['ILB12345'], ...req});
        });
    });
});
