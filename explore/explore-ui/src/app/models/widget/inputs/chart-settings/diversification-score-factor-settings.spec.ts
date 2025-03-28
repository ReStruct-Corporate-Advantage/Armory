import {DiversificationScoreFactorSettings} from './diversification-score-factor-settings';
import {WidgetInputType} from '../../../../../../projects/explore-ui-core/src/widget-config/enums';

describe('test DiversificationScoreFactorSettings', () => {

    let diversificationScoreFactorSettings: DiversificationScoreFactorSettings;

    beforeEach(() => {
        diversificationScoreFactorSettings = new DiversificationScoreFactorSettings();
    });

    it('test configType', () => {
        expect(DiversificationScoreFactorSettings.configType).toBe(WidgetInputType.DIVERSIFICATION_SCORE_FACTOR_SETTINGS);
        expect(diversificationScoreFactorSettings.getConfigType()).toBe(WidgetInputType.DIVERSIFICATION_SCORE_FACTOR_SETTINGS);
        expect(diversificationScoreFactorSettings.isDataStoreInput()).toBeTruthy();
    });

    describe('test serialize', () => {
        it('empty property', () => {
            const serialized = diversificationScoreFactorSettings.serialize();
            expect(Object.keys(serialized).length).toBe(1);
            expect(serialized.configType).toBe(WidgetInputType.DIVERSIFICATION_SCORE_FACTOR_SETTINGS);
            expect(serialized.numberOfRiskFactors).toBeUndefined();
            expect(serialized.additionalAnalytics).toBeUndefined();
        });

        it ('with all params', () => {
            diversificationScoreFactorSettings.numberOfRiskFactors = 5;
            diversificationScoreFactorSettings.additionalAnalytics = [ 'A', 'B' ];
            const serialized = diversificationScoreFactorSettings.serialize();
            expect(Object.keys(serialized).length).toBe(3);
            expect(serialized.configType).toBe(WidgetInputType.DIVERSIFICATION_SCORE_FACTOR_SETTINGS);
            expect(serialized.numberOfRiskFactors).toBe(5);
            expect(serialized.additionalAnalytics.length).toBe(2);
            expect(serialized.additionalAnalytics.includes('A'));
            expect(serialized.additionalAnalytics.includes('B'));
        });
    });

    describe('test deserialize', () => {
        it('empty property', () => {
            diversificationScoreFactorSettings.deserialize({});
            expect(diversificationScoreFactorSettings.numberOfRiskFactors).toBeUndefined();
            expect(diversificationScoreFactorSettings.additionalAnalytics).toBeUndefined();
        });

        it ('with all params', () => {
            diversificationScoreFactorSettings.deserialize({numberOfRiskFactors: 6, additionalAnalytics: ['A', 'B']});
            expect(diversificationScoreFactorSettings.numberOfRiskFactors).toBe(6);
            expect(diversificationScoreFactorSettings.additionalAnalytics.length).toBe(2);
            expect(diversificationScoreFactorSettings.additionalAnalytics.includes('A'));
            expect(diversificationScoreFactorSettings.additionalAnalytics.includes('B'));
        });
    });

    describe('test equals', () => {
        it ('both empty', () => {
            const diversificationScoreFactorSettings1 = new DiversificationScoreFactorSettings();
            expect(diversificationScoreFactorSettings1.equals(diversificationScoreFactorSettings)).toBeTruthy();
        });

        it('numberOfRiskFactors different', () => {
            const diversificationScoreFactorSettings1 = new DiversificationScoreFactorSettings();
            diversificationScoreFactorSettings1.numberOfRiskFactors = 1;
            expect(diversificationScoreFactorSettings1.equals(diversificationScoreFactorSettings)).toBeFalsy();
            diversificationScoreFactorSettings.numberOfRiskFactors = 1;
            expect(diversificationScoreFactorSettings1.equals(diversificationScoreFactorSettings)).toBeTruthy();
        });

        it('additionalAnalytics different', () => {
            const diversificationScoreFactorSettings1 = new DiversificationScoreFactorSettings();
            diversificationScoreFactorSettings1.additionalAnalytics = ['A', 'B'];
            expect(diversificationScoreFactorSettings1.equals(diversificationScoreFactorSettings)).toBeFalsy();
            diversificationScoreFactorSettings.additionalAnalytics = ['A', 'B'];
            expect(diversificationScoreFactorSettings1.equals(diversificationScoreFactorSettings)).toBeTruthy();
            diversificationScoreFactorSettings1.additionalAnalytics = ['A', 'B', 'C'];
            expect(diversificationScoreFactorSettings1.equals(diversificationScoreFactorSettings)).toBeFalsy();
        });
    });

    describe('test addRequestParams', () => {
        it('empty', () => {
            const params: any = {}
            diversificationScoreFactorSettings.addRequestParams(params);
            expect(Object.keys(params).length).toBe(0);
        });

        it('all params', () => {
            const params: any = {}
            diversificationScoreFactorSettings.numberOfRiskFactors = 1;
            diversificationScoreFactorSettings.additionalAnalytics = ['A', 'B'];
            diversificationScoreFactorSettings.addRequestParams(params);
            expect(Object.keys(params).length).toBe(1);
            expect(params.diversificationScoreFactorSettings).toBeTruthy();
            expect(Object.keys(params.diversificationScoreFactorSettings).length).toBe(2);
            expect(params.diversificationScoreFactorSettings.numberOfRiskFactors).toBe(1);
            expect(params.diversificationScoreFactorSettings.additionalAnalytics.length).toBe(2);
            expect(params.diversificationScoreFactorSettings.additionalAnalytics.includes('A')).toBeTruthy();
            expect(params.diversificationScoreFactorSettings.additionalAnalytics.includes('B')).toBeTruthy();
        });
    });

    it('Test shouldSkipSerialize', () => {
        expect(diversificationScoreFactorSettings.shouldSkipSerialize()).toBeFalsy();
    });
});
