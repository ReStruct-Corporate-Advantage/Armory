import {CoreRiskConstants, HvarRiskSettingsModel, MCVaRRiskSettingsModel} from '@blk/explore-ui-risk';
import {RiskSettingsUtils} from '@utils/risk-settings.utils';

describe('test RiskSettingsUtils', () => {
    describe('test buildMCVaRRiskSettingsPropertyValue', () => {
        const mcvarRiskSettings = new MCVaRRiskSettingsModel(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        it('default value', () => {
            const riskSettingsMap = RiskSettingsUtils.buildMCVaRRiskSettingsPropertyValue(mcvarRiskSettings);
            expect(riskSettingsMap.size).toBe(7);
            let degreesOfFreedomKeyExists = false;
            for (const [key, value] of riskSettingsMap.entries()) {
                if (key === 'Degrees of freedom') {
                    degreesOfFreedomKeyExists = true;
                }
                expect(value.source).toBeUndefined();
            }
            expect(degreesOfFreedomKeyExists).toBeFalsy();
        });

        it('non default value', () => {
            const riskSettingsData: any = {
                distributionType: CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[0].value,
                degreesOfFreedom: 100,
                samples: 100,
                seed: 10,
                pricingType: CoreRiskConstants.MCVAR_PRICING_TYPES[0].value,
                includeTimeReturn: true,
                idiosyncraticCorrelation: CoreRiskConstants.MCVAR_IDIO_CALCS[0].value,
                useImportanceSampling: true,
                trainingSamples: 4
            };
            mcvarRiskSettings.deserialize(riskSettingsData);
            const riskSettingsMap = RiskSettingsUtils.buildMCVaRRiskSettingsPropertyValue(mcvarRiskSettings);
            expect(riskSettingsMap.size).toBe(7);
            for (const [key, value] of riskSettingsMap.entries()) {
                expect(key).toBeDefined();
                expect(value.source === undefined || value.source === 'Organization (Default)').toBeTruthy();
            }
        });
    });

    describe('test buildHVaRRiskSettingsPropertyValue', () => {
        const hvarRiskSettings = new HvarRiskSettingsModel(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        it('default value', () => {
            const riskSettingsMap = RiskSettingsUtils.buildHVaRRiskSettingsPropertyValue(hvarRiskSettings);
            expect(riskSettingsMap.size).toBe(9);
            for (const [key, value] of riskSettingsMap.entries()) {
                expect(key).toBeDefined();
                expect(value.source).toBeUndefined();
            }
        });

        it ('non default value', () => {
            const riskSettingsData: any = {
                confidenceLevelPercentage: 2,
                returnHorizonSelection: 'days',
                numberOfDays: 10,
                linear: 5,
                fullRevaluation: true,
                includeTimeReturn: true,
                startDate: {date: 12233017, calCode: 'GreenPkg', dateString: false},
                historicalReturnDecay: 'Half Life',
                volatilityScaling: 'OFF',
                advancedHvarRiskSettings: {
                    holdingPeriod: 20,
                    confidenceLevelScale: 0.5
                }
            };
            hvarRiskSettings.deserialize(riskSettingsData);
            const riskSettingsMap = RiskSettingsUtils.buildHVaRRiskSettingsPropertyValue(hvarRiskSettings);
            expect(riskSettingsMap.size).toBe(12);
            for (const [key, value] of riskSettingsMap.entries()) {
                expect(key).toBeDefined();
                expect(value.source === undefined || value.source === 'Organization (Default)').toBeTruthy();
            }
        });
    });
    describe('test numberOfDays', () => {
        it('numberOfDaysIsDefined', () => {
            const numberOfDays = RiskSettingsUtils.numberOfDays(10, undefined);
            expect(numberOfDays).toBe(10);
        });

        describe('numberOfDaysIsUndefined', () => {
            it('returnHorizonSelectionIsDays', () => {
                const numberOfDays = RiskSettingsUtils.numberOfDays(undefined, 'days');
                expect(numberOfDays).toBe(20);
            });

            it('returnHorizonSelectionIs1Week', () => {
                const numberOfDays = RiskSettingsUtils.numberOfDays(undefined, '1week');
                expect(numberOfDays).toBe(5);
            });

            it('returnHorizonSelectionIs1Month', () => {
                const numberOfDays = RiskSettingsUtils.numberOfDays(undefined, '1month');
                expect(numberOfDays).toBe(21);
            });
        });
    });

    describe('test nonLinear', () => {
        it('nonLinearIsDefined', () => {
            const nonLinear = RiskSettingsUtils.nonLienear(5, undefined);
            expect(nonLinear).toBe(5);
        });

        describe('nonLinearIsUndefined', () => {
            it('returnHorizonSelectionIsDays', () => {
                const nonLinear = RiskSettingsUtils.nonLienear(undefined, 'days');
                expect(nonLinear).toBe(5);
            });

            it('returnHorizonSelectionIs1Week', () => {
                const nonLinear = RiskSettingsUtils.nonLienear(undefined, '1week');
                expect(nonLinear).toBe(5);
            });

            it('returnHorizonSelectionIs1Month', () => {
                const nonLinear = RiskSettingsUtils.nonLienear(undefined, '1month');
                expect(nonLinear).toBe(21);
            });
        });
    });
});
