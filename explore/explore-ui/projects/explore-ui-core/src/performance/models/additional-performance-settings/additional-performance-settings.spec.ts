import {PerformanceConstants} from '../../performance.constants';
import {AdditionalPerformanceSettings} from './additional-performance-settings';

describe('AdditionalPerformanceSettings', () => {
    it('test Equals', () => {
        const additionalSettings: any = {
            'asReported': true,
            'showSummary': true,
            'aggregateBMOnlyReturnSecurities': true,
            'removeBMOnlyReturnBucket': true,
            'collapseClosedPositions': true,
            'customBreakdownType': true,
            'customPivotPoint': 'ONE_YEAR',
            'overrideDateSortByOldest': true
        };
        const additionalPerformanceSettings1 = new AdditionalPerformanceSettings(additionalSettings);
        const additionalPerformanceSettings2 = new AdditionalPerformanceSettings(additionalSettings);

        // Different asReported
        additionalPerformanceSettings2.asReported = false;
        expect(additionalPerformanceSettings1.equals(additionalPerformanceSettings2)).toBe(false);

        // Different showSummary
        additionalPerformanceSettings2.asReported = true;
        additionalPerformanceSettings2.showSummary = false;
        expect(additionalPerformanceSettings1.equals(additionalPerformanceSettings2)).toBe(false);

        // Different aggregateBMOnlyReturnSecurities
        additionalPerformanceSettings2.showSummary = true;
        additionalPerformanceSettings2.aggregateBMOnlyReturnSecurities = false;
        expect(additionalPerformanceSettings1.equals(additionalPerformanceSettings2)).toBe(false);

        // Different removeBMOnlyReturnBucket
        additionalPerformanceSettings2.aggregateBMOnlyReturnSecurities = true;
        additionalPerformanceSettings2.removeBMOnlyReturnBucket = false;
        expect(additionalPerformanceSettings1.equals(additionalPerformanceSettings2)).toBe(false);

        // Different collapseClosedPositions
        additionalPerformanceSettings2.removeBMOnlyReturnBucket = true;
        additionalPerformanceSettings2.collapseClosedPositions = false;
        expect(additionalPerformanceSettings1.equals(additionalPerformanceSettings2)).toBe(false);

        // Different customPivotPoint
        additionalPerformanceSettings2.collapseClosedPositions = true;
        additionalPerformanceSettings2.customPivotPoint = 'TWO_YEARS';
        expect(additionalPerformanceSettings1.equals(additionalPerformanceSettings2)).toBe(false);

        // Null customPivotPoint - Same settings
        additionalPerformanceSettings2.customPivotPoint = null;
        additionalPerformanceSettings1.customPivotPoint = null;
        expect(additionalPerformanceSettings1.equals(additionalPerformanceSettings2)).toBe(true);

        // Same settings
        additionalPerformanceSettings2.customPivotPoint = 'ONE_YEAR';
        additionalPerformanceSettings1.customPivotPoint = 'ONE_YEAR';
        expect(additionalPerformanceSettings1.equals(additionalPerformanceSettings2)).toBe(true);

        // different override date sort by oldest
        additionalPerformanceSettings2.overrideDateSortByOldest = false;
        expect(additionalPerformanceSettings1.equals(additionalPerformanceSettings2)).toEqual(false);

        additionalPerformanceSettings2.overrideDateSortByOldest = true;

        // Different customBreakdownType
        additionalPerformanceSettings2.customBreakdownType = false;
        expect(additionalPerformanceSettings1.equals(additionalPerformanceSettings2)).toBe(false);

        // Different isNetReturn
        additionalPerformanceSettings2.isNetReturn = true;
        expect(additionalPerformanceSettings1.equals(additionalPerformanceSettings2)).toEqual(false);

    });

    it('Test serialize and deserialize', () => {
        const additionalSettings: any = {
            'AS-REPORTED': true,
            'showSummary': true,
            'aggregateBMOnlyReturnSecurities': true,
            'removeBMOnlyReturnBucket': true,
            'collapseClosedPositions': true,
            'customBreakdownType': true,
            'customPivotPoint': 'ONE_YEAR',
            'isNetReturn': true,
            'overrideDateSortByOldest': true
        };
        const additionalPerformanceSettings = new AdditionalPerformanceSettings(additionalSettings);
        const data: any = additionalPerformanceSettings.serialize();
        const deserializedAdditionalPerformanceSettings = new AdditionalPerformanceSettings();
        deserializedAdditionalPerformanceSettings.deserialize(data);
        expect(additionalPerformanceSettings.equals(deserializedAdditionalPerformanceSettings)).toBe(true);
    });

    it('should create an instance', () => {
        expect(new AdditionalPerformanceSettings()).toBeTruthy();
    });

    it('test addRequestData', () => {
        const additionalSettings: any = {
            'asReported': true,
            'showSummary': true,
            'aggregateBMOnlyReturnSecurities': true,
            'removeBMOnlyReturnBucket': true,
            'collapseClosedPositions': true,
            'customBreakdownType': true,
            'customPivotPoint': 'ONE_YEAR',
            'isNetReturn': true,
            'overrideDateSortByOldest': true
        };
        const additionalPerformanceSettings = new AdditionalPerformanceSettings(additionalSettings);
        const requestParams: any = {};
        additionalPerformanceSettings.addRequestData(requestParams);
        expect(requestParams[PerformanceConstants.AS_REPORTED]).toBeTruthy();
        expect(requestParams.showSummary).toBeTruthy();
        expect(requestParams.aggregateBMOnlyReturnSecurities).toBeTruthy();
        expect(requestParams.removeBMOnlyReturnBucket).toBeTruthy();
        expect(requestParams.collapseClosedPositions).toBeTruthy();
        expect(requestParams.customBreakdownType).toBeTruthy();
        expect(requestParams.customPivotPoint).toBe('ONE_YEAR');
        expect(requestParams.isNetReturn).toEqual(true);
        expect(requestParams.overrideDateSortByOldest).toEqual(true);
    });
});
