import {RiskColumnSettings} from '@models/riskSettings/risk-column-settings.model';

describe('RiskColumnSettings', () => {

    it('Test addRequestParams', () => {
        const riskColumnSettings = new RiskColumnSettings();
        riskColumnSettings.showSecurities = true;
        riskColumnSettings.isPortGroupSummaryRequest = false;
        const actualRequestParam = {};
        riskColumnSettings.addRequestParams(actualRequestParam);
        expect(actualRequestParam['showSecurities']).toEqual(riskColumnSettings.showSecurities);
        expect(actualRequestParam['isPortGroupSummaryRequest']).toEqual(riskColumnSettings.isPortGroupSummaryRequest);
    });

    it('Test serialize/deserialize ', function () {
        let riskColumnSettings = new RiskColumnSettings();
        let data = riskColumnSettings.serialize();
        let deserializedRiskColumnSettings = new RiskColumnSettings(data);
        expect(riskColumnSettings).toStrictEqual(deserializedRiskColumnSettings);
        riskColumnSettings.showSecurities = true;
        riskColumnSettings.isPortGroupSummaryRequest = false;
        riskColumnSettings.disableSectorBreakdown = true;
        riskColumnSettings.disableFactorBreakdown = true;
        data = riskColumnSettings.serialize();
        deserializedRiskColumnSettings = new RiskColumnSettings(data);
        expect(riskColumnSettings).toStrictEqual(deserializedRiskColumnSettings);
        riskColumnSettings.columnSetSelected = {label: 'Test', value: 'Test'};
        riskColumnSettings.groupingTypeSelected = {label: 'xyz', value: 'xyz', matchingRiskCategory: 'abc'};
        data = riskColumnSettings.serialize();
        deserializedRiskColumnSettings = new RiskColumnSettings(data);
        expect(riskColumnSettings).toStrictEqual(deserializedRiskColumnSettings);
        riskColumnSettings = new RiskColumnSettings();
        riskColumnSettings.deserialize(null);
        expect(riskColumnSettings.columnSetSelected).toBeUndefined();
        riskColumnSettings.deserialize({});
        expect(riskColumnSettings.columnSetSelected).toBeUndefined();
        riskColumnSettings.deserialize(undefined);
        expect(riskColumnSettings.columnSetSelected).toBeUndefined();
    });

    it('Test equals ', function () {
        const riskColumnSettings = new RiskColumnSettings();
        const otherRiskColumnSettings = new RiskColumnSettings();
        expect(riskColumnSettings.equals(otherRiskColumnSettings)).toBeTruthy();
        riskColumnSettings.showSecurities = true;
        riskColumnSettings.isPortGroupSummaryRequest = false;
        riskColumnSettings.disableSectorBreakdown = true;
        riskColumnSettings.disableFactorBreakdown = true;
        expect(riskColumnSettings.equals(otherRiskColumnSettings)).toBeFalsy();
        otherRiskColumnSettings.showSecurities = true;
        otherRiskColumnSettings.isPortGroupSummaryRequest = false;
        otherRiskColumnSettings.disableSectorBreakdown = true;
        otherRiskColumnSettings.disableFactorBreakdown = true;
        otherRiskColumnSettings.columnSetSelected = 'Test';
        otherRiskColumnSettings.groupingTypeSelected = 'xyz';
        expect(riskColumnSettings.equals(otherRiskColumnSettings)).toBeFalsy();
        otherRiskColumnSettings.disableSectorBreakdown = false;
        expect(riskColumnSettings.equals(otherRiskColumnSettings)).toBeFalsy();
        otherRiskColumnSettings.disableSectorBreakdown = true;
        riskColumnSettings.columnSetSelected = 'Test';
        expect(riskColumnSettings.equals(otherRiskColumnSettings)).toBeFalsy();
        riskColumnSettings.groupingTypeSelected = 'xyz';
        expect(riskColumnSettings.equals(otherRiskColumnSettings)).toBeTruthy();
        otherRiskColumnSettings.isPortGroupSummaryRequest = true;
        expect(riskColumnSettings.equals(otherRiskColumnSettings)).toBeFalsy();
        expect(riskColumnSettings.equals(null)).toBeFalsy();
        expect(riskColumnSettings.equals(undefined)).toBeFalsy();
    });

    it('Test isDataStoreInput ', function () {
        const riskColumnSettings = new RiskColumnSettings();
        expect(riskColumnSettings.isDataStoreInput()).toBeTruthy();
    });

});
