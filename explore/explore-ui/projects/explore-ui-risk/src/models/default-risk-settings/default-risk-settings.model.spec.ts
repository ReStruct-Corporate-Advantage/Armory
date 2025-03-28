import {DefaultRiskSettings} from './default-risk-settings.model';

describe('DefaultRiskSettings', () => {
    it('should be created - without data', () => {
        expect(new DefaultRiskSettings()).toBeTruthy();
    });

    it('should be created - with empty data', () => {
        const defaultRiskSettings: DefaultRiskSettings = new DefaultRiskSettings({});
        expect(defaultRiskSettings).toBeTruthy();
        expect(defaultRiskSettings.weightingScheme).toBeUndefined();
        expect(defaultRiskSettings.riskHorizon).toBeUndefined();
        expect(defaultRiskSettings.modelMapping).toBeUndefined();
        expect(defaultRiskSettings.confidenceLevelInStdDeviation).toBeUndefined();
        expect(defaultRiskSettings.assetClassCovariance).toBeUndefined();
        expect(defaultRiskSettings.dxsBlock).toBeUndefined();
        expect(defaultRiskSettings.scaleDxsExposures).toBeUndefined();
    });

    it('should create', () => {
        const defaultRiskSettings: DefaultRiskSettings = new DefaultRiskSettings({
            'RiskHorizon': '4',
            'WeightingScheme': {
                'name': 'DLY',
                'defaultPeriod': 252,
                'defaultDecay': 0.982820599
            },
            'ModelMapping': 'P100',
            'ConfidenceLevelInStdDeviation': 1,
            'AssetClassCovariance': 'abc',
            'DxsBlock': 'test',
            'ScaleDxsExposures': true
        });

        expect(defaultRiskSettings).toBeTruthy();

        expect(defaultRiskSettings.weightingScheme).toBeTruthy();
        expect(defaultRiskSettings.weightingScheme.name === 'DLY').toBeTruthy();
        expect(defaultRiskSettings.weightingScheme.defaultPeriod === 252).toBeTruthy();
        expect(defaultRiskSettings.weightingScheme.defaultDecay === 0.982820599).toBeTruthy();

        expect(defaultRiskSettings.riskHorizon === '4').toBeTruthy();
        expect(defaultRiskSettings.modelMapping === 'P100').toBeTruthy();
        expect(defaultRiskSettings.confidenceLevelInStdDeviation === 1).toBeTruthy();

        expect(defaultRiskSettings.assetClassCovariance === 'abc').toBeTruthy();
        expect(defaultRiskSettings.dxsBlock === 'test').toBeTruthy();
        expect(defaultRiskSettings.scaleDxsExposures).toEqual(true);
    });
});
