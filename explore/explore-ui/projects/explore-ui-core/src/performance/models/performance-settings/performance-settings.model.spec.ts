import {isEqual} from 'lodash';
import {TimePeriodConstants} from '../../../date/constants';
import {DateValue} from '../../../date/models/date-value/date-value.model';
import {PerformanceConstants} from '../../performance.constants';
import {AdditionalPerformanceSettings} from '../additional-performance-settings/additional-performance-settings';
import {AttributionSettings} from '../attribution-settings/attribution-settings.model';
import {PerformanceSettings} from './performance-settings.model';
import {PerformanceTimePeriod} from '../../../date/models/time-period/performance-time-period.model';
import {WidgetConfigType} from "../../../widget-config/enums";
import {KrdBucketDetails} from "../../../definition/models/krd-bucket-details.model";
import {CoreDefinitionStore} from "../../../definition/core-definition.store";
import {CoreWidgetConfigStore} from "../../../widget-config/core-widget-config.store";
import {WidgetConfig} from "../../../widget-config/models/widget-config.model";

describe('PerformanceSettings', () => {
    it('equals', () => {
        const timePeriod1 = new PerformanceTimePeriod('Month To Date', 1, 'MTD');
        const timePeriod2 = new PerformanceTimePeriod('Month To Date', 1, 'MTD');

        const attributionSettings1 = new AttributionSettings('FIXED_INCOME', 'FIXED_INCOME', ['rf_contr', 'rldn_contr'], 'MARKET_VALUE', 'RELATIVE', 'IMMEDIATE_PARENT_LEVEL', 'MarketValue', false);
        const attributionSettings2 = new AttributionSettings('FIXED_INCOME', 'FIXED_INCOME', ['rf_contr', 'rldn_contr'], 'MARKET_VALUE', 'RELATIVE', 'IMMEDIATE_PARENT_LEVEL', 'MarketValue', false);

        const additionalSettings: any = {
            'asReported': true,
            'showSummary': true,
            'aggregateBMOnlyReturnSecurities': true,
            'removeBMOnlyReturnBucket': true,
            'collapseClosedPositions': true,
            'customPivotPoint': 'ONE_YEAR'
        };

        const additionalPerformanceSettings1 = new AdditionalPerformanceSettings(additionalSettings);
        const additionalPerformanceSettings2 = new AdditionalPerformanceSettings(additionalSettings);

        const performanceSettings1 = new PerformanceSettings(undefined, timePeriod1, attributionSettings1, additionalPerformanceSettings1);
        const performanceSettings2 = new PerformanceSettings(undefined, timePeriod2, attributionSettings2, additionalPerformanceSettings2);

        // Different time period
        timePeriod2.shortName = 'QTD';
        expect(performanceSettings1.equals(performanceSettings2)).toBeFalsy();

        // Different attribution settings
        timePeriod2.shortName = 'MTD';
        expect(performanceSettings1.equals(performanceSettings2)).toBeTruthy();

        // Different attribution settings
        attributionSettings2.cannedMethod = 'FIXED_INCOME';
        additionalPerformanceSettings2.showSummary = false;
        expect(performanceSettings1.equals(performanceSettings2)).toBeFalsy();

        // Same settings
        additionalPerformanceSettings2.showSummary = true;
        expect(performanceSettings1.equals(performanceSettings2)).toBeTruthy();
    });

    it('Test serialize and deserialize', () => {
        const timePeriod = new PerformanceTimePeriod('Month To Date', 1, 'MTD');
        const attSettings = new AttributionSettings('FIXED_INCOME', 'FIXED_INCOME', ['rf_contr', 'rldn_contr'], 'MARKET_VALUE', 'RELATIVE', 'IMMEDIATE_PARENT_LEVEL', 'MarketValue', false);

        const additionalSettings: any = {
            'asReported': true,
            'showSummary': true,
            'aggregateBMOnlyReturnSecurities': true,
            'removeBMOnlyReturnBucket': true,
            'collapseClosedPositions': true,
            'customPivotPoint': 'ONE_YEAR'
        };

        const additionalPerformanceSettings = new AdditionalPerformanceSettings(additionalSettings);
        const performanceSettings = new PerformanceSettings(undefined, timePeriod, attSettings, additionalPerformanceSettings);
        // Predefined canned method
        const data: any = performanceSettings.serialize();
        const deserializedPerformanceSettings = new PerformanceSettings();
        deserializedPerformanceSettings.deserialize(data);
        expect(performanceSettings.timePeriod.equals(deserializedPerformanceSettings.timePeriod)).toBeTruthy();
        expect(performanceSettings.additionalSettings.equals(deserializedPerformanceSettings.additionalSettings)).toBeTruthy();
        const expectedAttributionSettings = new AttributionSettings();
        expectedAttributionSettings.cannedMethod = 'FIXED_INCOME';
        expectedAttributionSettings.sectorWeighting = 'MARKET_VALUE';
        expectedAttributionSettings.attributionCalculatorMethod = 'RELATIVE';
        expectedAttributionSettings.sectorLevel = 'IMMEDIATE_PARENT_LEVEL';
        expectedAttributionSettings.exposureMode = 'MarketValue';
        expect(deserializedPerformanceSettings.attributionSettings.equals(expectedAttributionSettings)).toBe(true);
    });

    it('Test resetTimePeriod', () => {
        const defaultTimePeriod = new PerformanceTimePeriod('Month to Date', 1, 'MTD');
        const defaultPerformanceSettings = PerformanceSettings.createPerformanceSettings(undefined, defaultTimePeriod);
        const performanceSettings = PerformanceSettings.createPerformanceSettings(defaultPerformanceSettings, new PerformanceTimePeriod('Year to Date', 2, 'YTD'));
        let expectedValue = performanceSettings.checkAndResetTimePeriod(false);
        expect(expectedValue).toBeTruthy();
        performanceSettings.checkAndResetTimePeriod(true);
        expect(performanceSettings.timePeriod.equals(defaultTimePeriod)).toBeTruthy();
        expectedValue = performanceSettings.checkAndResetTimePeriod(false);
        expect(expectedValue).toBeFalsy();
    });

    it('Test configType', () => {
        const performanceSettings = new PerformanceSettings();
        expect(performanceSettings.configType).toEqual('performanceSettings');
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {};
        let model: PerformanceSettings = PerformanceSettings.createModelLegacy(data);
        expect(model).not.toBeDefined();
        const timePeriod = new PerformanceTimePeriod(undefined, 1, 'MTD');
        // Try with valid options.
        data[TimePeriodConstants.TIME_PERIOD] = 'MTD';
        data[TimePeriodConstants.NUMBER_OF_PERIODS] = 1;
        model = PerformanceSettings.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.timePeriod.equals(timePeriod)).toBe(true);
        expect(data[TimePeriodConstants.TIME_PERIOD]).not.toBeDefined();
        expect(data[TimePeriodConstants.NUMBER_OF_PERIODS]).not.toBeDefined();

        data[TimePeriodConstants.TIME_PERIOD] = 'CUSTOM';
        data[TimePeriodConstants.NUMBER_OF_PERIODS] = 1;
        data[TimePeriodConstants.START_DATE] = '31-March-2016';
        data[TimePeriodConstants.END_DATE] = '10-Sep-2016';
        data[PerformanceConstants.ATTRIBUTION_METHOD] = 'CUSTOM';
        data[PerformanceConstants.FACTORS] = ['rf_contr', 'rldn_contr'];
        data[PerformanceConstants.SECTOR_WEIGHTING] = 'MARKET_VALUE';
        data[PerformanceConstants.ATTRIBUTION_CALCULATOR_METHOD] = 'RELATIVE';
        data[PerformanceConstants.SECTOR_LEVEL] = 'IMMEDIATE_PARENT_LEVEL';
        data[PerformanceConstants.ASSET_TYPE] = 'EQ_MANDATE';
        data[PerformanceConstants.MULTI_MANAGER_ATTRIBUTION] = true;

        timePeriod.shortName = 'CUSTOM';
        timePeriod.fromDateValue = '31-March-2016';
        timePeriod.toDateValue = '10-Sep-2016';

        model = PerformanceSettings.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.timePeriod.equals(timePeriod)).toBe(true);
        expect(data[TimePeriodConstants.TIME_PERIOD]).not.toBeDefined();
        expect(data[TimePeriodConstants.NUMBER_OF_PERIODS]).not.toBeDefined();
        expect(data[TimePeriodConstants.START_DATE]).not.toBeDefined();
        expect(data[TimePeriodConstants.END_DATE]).not.toBeDefined();
        const attributionSettings = model.attributionSettings;
        expect(attributionSettings.cannedMethod).toBe('CUSTOM');
        expect(attributionSettings.assetType).toBe('EQ_MANDATE');
        expect(attributionSettings.sectorWeighting).toBe('MARKET_VALUE');
        expect(attributionSettings.attributionCalculatorMethod).toBe('RELATIVE');
        expect(attributionSettings.sectorLevel).toBe('IMMEDIATE_PARENT_LEVEL');
        expect(attributionSettings.factors[0]).toBe('rf_contr');
        expect(attributionSettings.factors[1]).toBe('rldn_contr');
        expect(attributionSettings.multiManagerAttribution).toBe(true);
        expect(isEqual(data, {})).toBeTruthy();
    });

    /**
     * Test createDefaultTimePeriod
     */
    it('Test createDefaultTimePeriod', () => {
        const timePeriod = new PerformanceTimePeriod('Month to Date', 1, 'MTD');
        const expectedTimePeriod = PerformanceSettings.createDefaultTimePeriod();
        expect(timePeriod.equals(expectedTimePeriod)).toEqual(true);
    });

    /**
     * Test case for method createPerformanceSettings
     */
    it('Test createPerformanceSettings', () => {
        const timePeriod = new PerformanceTimePeriod('Month To Date', 1, 'MTD');
        const attribSettings = new AttributionSettings('FIXED_INCOME', 'FIXED_INCOME');
        const performanceSettings = PerformanceSettings.createPerformanceSettings(undefined, timePeriod, attribSettings);
        expect(performanceSettings.parentPerformanceSettings).not.toBeDefined();
        expect(performanceSettings.timePeriod.equals(timePeriod)).toBe(true);
        expect(performanceSettings.attributionSettings.parentAttributionSettings.equals(attribSettings)).toBe(true);
    });

    /**
     * Test case for method isValid
     */
    it('Test isValid', () => {
        const timePeriod = new PerformanceTimePeriod('Month To Date', 1, 'MTD');
        let performanceSettings = PerformanceSettings.createPerformanceSettings(undefined, undefined);
        expect(performanceSettings.isValid()).toBeFalsy();
        performanceSettings = PerformanceSettings.createPerformanceSettings(undefined, timePeriod);
        expect(performanceSettings.isValid()).toBeTruthy();
    });

    it('Test getModifiedWidgetTitleDetails', () => {
        const performanceSettings = new PerformanceSettings();
        performanceSettings.timePeriod = new PerformanceTimePeriod('Month To Date', 1, 'MTD');
        expect(performanceSettings.getModifiedWidgetTitleDetails(null)).toEqual('Month To Date');
        performanceSettings.timePeriod = new PerformanceTimePeriod(null, 2, 'MTD');
        expect(performanceSettings.getModifiedWidgetTitleDetails(null)).toEqual('2 MTD');

        // Custom time period
        performanceSettings.timePeriod = new PerformanceTimePeriod('Custom', 1, 'CUSTOM', '29-Feb-2016', '10-Mar-2016');
        expect(performanceSettings.getModifiedWidgetTitleDetails(null)).toEqual('Custom( 29-Feb-2016 - 10-Mar-2016 )');

        // Custom time period- with relative date
        performanceSettings.timePeriod = new PerformanceTimePeriod('Custom', 1, 'CUSTOM');
        performanceSettings.timePeriod.fromDateValue = 'T-10';
        performanceSettings.timePeriod.toDateValue = 'T-2';
        expect(performanceSettings.getModifiedWidgetTitleDetails(null)).toEqual('Custom( T-10 - T-2 )');

        performanceSettings.timePeriod = new PerformanceTimePeriod('Custom', 1, 'CUSTOM', '29-Feb-2016', null);
        const datePicker = new DateValue();
        datePicker.dateString = false;
        datePicker.dateStringValue = '10-Mar-2016';
        // date in DateValue should hold value in US format
        datePicker.date = '03/11/2016';
        expect(performanceSettings.getModifiedWidgetTitleDetails(datePicker)).toEqual('Custom( 29-Feb-2016 - 11-Mar-2016 )');

        datePicker.dateString = true;
        datePicker.dateStringValue = '10-Mar-2016';
        datePicker.date = '03/11/2016';
        expect(performanceSettings.getModifiedWidgetTitleDetails(datePicker)).toEqual('Custom( 29-Feb-2016 - 10-Mar-2016 )');
    });

    it('add portfolio performance Settings in request for PGS', () => {
        const data = {
            attributionSettings: {
                cannedMethod: 'CUSTOM',
                attributionCalculatorMethod: 'test_method',
                sectorWeighting: 'test_weighting',
                sectorLevel: 'test_level'
            }
        };
        const performanceSettings = new PerformanceSettings(data);
        const requestParams = {};
        performanceSettings.addPortfolioPerformanceSettingsToPGSRequest(requestParams);
        expect(requestParams['performanceSettings']['cannedAttributionMethod']).toBe('CUSTOM');
        expect(requestParams['performanceSettings']['attributionCalculatorMethod']).toBe('test_method');
        expect(requestParams['performanceSettings']['sectorWeighting']).toBe('test_weighting');
        expect(requestParams['performanceSettings']['sectorLevel']).toBe('test_level');
    });

    describe('test doAddRequestParams', () => {
        // Test addRequestParams
        it('timePeriod addRequestData must be called', () => {
            const settings: PerformanceSettings = new PerformanceSettings();
            settings.timePeriod = new PerformanceTimePeriod();

            jest.spyOn(settings.timePeriod, 'addRequestData').mockReturnValue(null);

            settings.addRequestParams({});

            expect(settings.timePeriod.addRequestData).toHaveBeenCalled();
        });

        it('attributionSettings addRequestData must be called', () => {
            const settings: PerformanceSettings = new PerformanceSettings();
            settings.attributionSettings = new AttributionSettings();

            jest.spyOn(settings.attributionSettings, 'addRequestData').mockReturnValue(null);
            settings.addRequestParams({});
            settings.attributionSettings.cannedMethod = 'EQUITY';
            // attributionSettings.addRequestData will not be called as PerformanceSettings is not valid, because it doesn't have timePeriod
            expect(settings.attributionSettings.addRequestData).not.toHaveBeenCalled();

            settings.timePeriod = new PerformanceTimePeriod();
            settings.addRequestParams({});
            expect(settings.attributionSettings.addRequestData).toHaveBeenCalled();
        });

        describe('customPivotPoint parameter', () => {
            CoreDefinitionStore.krdBucketDetail = [
                new KrdBucketDetails({
                    'bucketName': 'Short',
                    'colTag': 'krd_3m',
                    'name': '3 Month',
                    'value': 'THREE_MONTH'
                }),
                new KrdBucketDetails({
                    'bucketName': 'Short',
                    'colTag': 'krd_1y',
                    'name': '1 Year',
                    'value': 'ONE_YEAR'
                }),
                new KrdBucketDetails({
                    'bucketName': 'Middle',
                    'colTag': 'krd_2y',
                    'name': '2 Year',
                    'value': 'TWO_YEAR'
                }),
                new KrdBucketDetails({
                    'bucketName': 'Middle',
                    'colTag': 'krd_3y',
                    'name': '3 Year',
                    'value': 'THREE_YEAR'
                }),
                new KrdBucketDetails({
                    'bucketName': 'Middle',
                    'colTag': 'krd_10y',
                    'name': '10 Year',
                    'value': 'TEN_YEAR'
                }),
                new KrdBucketDetails({
                    'bucketName': 'Long',
                    'colTag': 'krd_25y',
                    'name': '25 Year',
                    'value': 'TWENTYFIVE_YEAR'
                }),
                new KrdBucketDetails({
                    'bucketName': 'Long',
                    'colTag': 'krd_30y',
                    'name': '30 Year',
                    'value': 'THIRTY_YEAR'
                })
            ];
            const chartConfigMap = new Map<string, WidgetConfig>();
            chartConfigMap.set(WidgetConfigType.PRA, new WidgetConfig({inputCategories: []}))
            chartConfigMap.set(WidgetConfigType.RETURNS, new WidgetConfig({inputCategories: []}))
            CoreWidgetConfigStore.chartConfig = chartConfigMap;
            it('will not be added because widget is not passed', () => {
                const settings: PerformanceSettings = new PerformanceSettings();
                settings.timePeriod = new PerformanceTimePeriod();
                const params: any = {};
                settings.addRequestParams(params);
                expect(params.customPivotPoint).toBeUndefined();
            });
            it('will not be added because widget is not a return widget', () => {
                const settings: PerformanceSettings = new PerformanceSettings();
                settings.timePeriod = new PerformanceTimePeriod();
                const params: any = {};
                settings.addRequestParams(params, null);
                expect(params.customPivotPoint).toBeUndefined();
            });
            it('default TEN_YEAR will be added for RETURNS widget', () => {
                const settings: PerformanceSettings = new PerformanceSettings();
                settings.timePeriod = new PerformanceTimePeriod();
                const params: any = {'customPivotPoint': ''};
                settings.addRequestParams(params, null);
                expect(params.customPivotPoint).toBe('TEN_YEAR');
            });
            it('default TEN_YEAR will not be added for RETURNS widget as the value is not empty', () => {
                const settings: PerformanceSettings = new PerformanceSettings();
                settings.timePeriod = new PerformanceTimePeriod();
                const params: any = {'customPivotPoint': 'TWENTY_YEAR'};
                settings.addRequestParams(params, null);
                expect(params.customPivotPoint).toBe('TWENTY_YEAR');
            });
        });
    });
});
