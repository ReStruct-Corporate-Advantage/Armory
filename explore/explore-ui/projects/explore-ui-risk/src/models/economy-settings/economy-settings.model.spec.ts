import {DateValue, RiskParameter, WeightingSchemes} from '@blk/explore-ui-core';
import {CoreRiskConstants} from '../../core-risk.constants';
import {EconomySettings} from './economy-settings.model';

describe('EconomySettings', () => {
    /**
     * Test case for EconomySettings initializing correctly
     */
    it('Test if EconomySettings initializes correctly ', () => {
        // GIVEN
        const economySettings = new EconomySettings(new EconomySettings(), CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // THEN
        expect(economySettings.parentRiskSettings).toBeDefined();
        expect(economySettings.name).toBeDefined();
        expect(economySettings.name).toEqual(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
    });

    /**
     * Test deserialize
     */
    it('Test deserialize for Relative/Absolute', () => {
        // GIVEN
        const orgDefaultRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        const portDefaultRiskSettings = new EconomySettings(orgDefaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        portDefaultRiskSettings.deserialize({
            weightingScheme: 'DLY',
            riskHorizon: 2,
            decayFactor: 0.33,
            confidenceLevelSD: 2,
            period: 3,
            overlap: 2,
            dateObject: {date: 12233017, calCode: 'GreenPkg', dateString: false}
        });
        const economySettings = new EconomySettings(portDefaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const data: any = {
            weightingScheme: 'DLY',
            riskHorizon: 2,
            decayFactor: 0.34,
            confidenceLevelSD: 2,
            period: 4,
            dateObject: new DateValue({date: '12/03/2017', calCode: 'GreenPkg', dateString: false})
        };

        // WHEN
        economySettings.deserialize(data);

        // THEN
        expect(economySettings.weightingScheme).toEqual('DLY');
        expect(economySettings.riskHorizon).toEqual(2);
        expect(economySettings.decayFactor).toEqual(0.34);
        expect(economySettings.confidenceLevelSD).toEqual(2);
        expect(economySettings.period).toEqual(4);
        expect(economySettings.overlap).toEqual(2);
        expect(economySettings.dateObject).toEqual(new DateValue({
            date: '12/03/2017',
            calCode: 'GreenPkg',
            dateString: false
        }));

        const portDefaultRiskSettingsForRelative = new EconomySettings(orgDefaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        portDefaultRiskSettings.deserialize({
            weightingScheme: 'DLY',
            riskHorizon: 2,
            decayFactor: 0.33,
            confidenceLevelSD: 2,
            period: 3,
            dateObject: {dateStringValue: 'T-3', calCode: 'GreenPkg', dateString: true}
        });
        const economySettingsForRelative = new EconomySettings(portDefaultRiskSettingsForRelative, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const dataForRelative: any = {
            weightingScheme: 'DLY',
            riskHorizon: 2,
            decayFactor: 0.34,
            confidenceLevelSD: 2,
            period: 4,
            overlap: 4,
            dateObject: {dateStringValue: 'T-3', calCode: 'GreenPkg', dateString: true}
        };

        // WHEN
        economySettingsForRelative.deserialize(dataForRelative);

        // THEN
        expect(economySettingsForRelative.weightingScheme).toEqual('DLY');
        expect(economySettingsForRelative.riskHorizon).toEqual(2);
        expect(economySettingsForRelative.decayFactor).toEqual(0.34);
        expect(economySettingsForRelative.confidenceLevelSD).toEqual(2);
        expect(economySettingsForRelative.period).toEqual(4);
        expect(economySettingsForRelative.overlap).toEqual(4);
        expect(economySettingsForRelative.dateObject).toEqual({
            dateStringValue: 'T-3',
            calCode: 'GreenPkg',
            dateString: true
        } as any);
    });

    /**
     * Test serialize
     */
    it('Test serialize for Relative/Absolute', () => {
        // GIVEN
        const parentRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const economySettings = new EconomySettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        economySettings.weightingScheme = 'DLY';
        economySettings.riskHorizon = 2;
        economySettings.decayFactor = 0.33;
        economySettings.confidenceLevelSD = 2;
        economySettings.period = 3;
        economySettings.overlap = 6;
        economySettings.dateObject = new DateValue({date: '12/03/2017', calCode: 'GreenPkg', dateString: false});

        // WHEN
        const expected = economySettings.serialize();

        // THEN
        expect(expected).toEqual({
            weightingScheme: 'DLY',
            riskHorizon: 2,
            decayFactor: 0.33,
            confidenceLevelSD: 2,
            period: 3,
            overlap: 6,
            dateObject: {date: '12/03/2017', dateString: false, calCode: 'GreenPkg'}
        });

        // For Relative
        const economySettingsRelative = new EconomySettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        economySettingsRelative.weightingScheme = 'DLY';
        economySettingsRelative.riskHorizon = 2;
        economySettingsRelative.decayFactor = 0.33;
        economySettingsRelative.confidenceLevelSD = 2;
        economySettingsRelative.period = 3;
        economySettingsRelative.dateObject = new DateValue({
            dateStringValue: 'T-3',
            calCode: 'GreenPkg',
            dateString: true
        });

        const expectedForRelative = economySettingsRelative.serialize();

        // THEN
        expect(expectedForRelative).toEqual({
            weightingScheme: 'DLY',
            riskHorizon: 2,
            decayFactor: 0.33,
            confidenceLevelSD: 2,
            period: 3,
            dateObject: {dateStringValue: 'T-3', calCode: 'GreenPkg', dateString: true}
        });
    });

    /**
     * Test cases for securityListOptions.ts
     */
    describe('computeConfidenceLevelInPercentage tests', function () {
        let defaultRiskSettings;
        let portDefaultRiskSettings;
        let economySettings;
        beforeEach(() => {
            // GIVEN
            defaultRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
            portDefaultRiskSettings = new EconomySettings(defaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
            economySettings = new EconomySettings(portDefaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
            economySettings.availableWeightingSchemes = [
                new WeightingSchemes({
                    'value': 'WKS',
                    'displayName': 'Weekly Short-Term Half-Life',
                    'toolTip': 'Weekly Short-Term Half-Life',
                    'defaultDecay': 0.917,
                    'halfLifeLabel': 'weeks',
                    'isHalfLifeModifiable': false,
                    'defaultPeriod': 104,
                    'isPeriodModifiable': true,
                    'isCustomScheme': false,
                    'defaultOverlap': 1
                }),
                new WeightingSchemes({
                    'value': 'WKL',
                    'displayName': 'Weekly Long-Term Half-Life',
                    'toolTip': 'Weekly Long-Term Half-Life',
                    'defaultDecay': 0.9737,
                    'halfLifeLabel': 'weeks',
                    'isHalfLifeModifiable': false,
                    'defaultPeriod': 104,
                    'isPeriodModifiable': true,
                    'isCustomScheme': false,
                    'defaultOverlap': 2
                }),
                new WeightingSchemes({
                    'value': 'MTC',
                    'displayName': 'Monthly Constant-Weighted',
                    'toolTip': 'Monthly Constant-Weighted',
                    'defaultDecay': 1,
                    'halfLifeLabel': 'months',
                    'isHalfLifeModifiable': true,
                    'defaultPeriod': 72,
                    'isPeriodModifiable': true,
                    'isCustomScheme': false,
                    'defaultOverlap': 3
                }),
                new WeightingSchemes({
                    'value': 'DLY',
                    'displayName': 'Daily User-Defined Half-Life',
                    'toolTip': 'Daily User-Defined Half-Life',
                    'defaultDecay': 0.982820599,
                    'halfLifeLabel': 'days',
                    'isHalfLifeModifiable': true,
                    'defaultPeriod': 252,
                    'isPeriodModifiable': true,
                    'isCustomScheme': false,
                    'defaultOverlap': 4
                }),
                new WeightingSchemes({
                    'value': 'DLY',
                    'displayName': 'GP Default based on DLY',
                    'toolTip': 'Daily User-Defined Half-Life',
                    'halfLifeLabel': 'days',
                    'defaultDecay': 0.982820599,
                    'isHalfLifeModifiable': true,
                    'defaultPeriod': 104,
                    'isPeriodModifiable': true,
                    'isCustomScheme': true,
                    'defaultOverlap': 5
                })
            ];
        });

        /**
         * Test computeConfidenceLevelInPercentage
         */
        it('Test should compute confidence level in percentage correctly', () => {
            // WHEN
            economySettings.confidenceLevelSD = 0.8;
            economySettings.computeConfidenceLevelInPercentage();

            // THEN
            expect(economySettings.confidenceLevelPercentage).toEqual(78.8145);
        });

        /**
         * Test computeConfidenceLevelInPercentage
         */
        it('Test should compute confidence level in percentage correctly', () => {
            // WHEN
            economySettings.confidenceLevelSD = 2.0;
            economySettings.computeConfidenceLevelInPercentage();

            // THEN
            expect(economySettings.confidenceLevelPercentage).toEqual(97.725);
        });

        /**
         * Test computeConfidenceLevelInStdDeviation
         */
        it('Test should compute confidence level in Std Deviation correctly', () => {
            // WHEN
            economySettings.confidenceLevelPercentage = 98;
            economySettings.computeConfidenceLevelInStdDeviation();

            // THEN
            expect(economySettings.confidenceLevelSD).toEqual(2.053749);
        });

        /**
         * Test computeConfidenceLevelInStdDeviation
         */
        it('Test should compute confidence level in Std Deviation correctly', () => {
            // WHEN
            economySettings.confidenceLevelPercentage = 79;
            economySettings.computeConfidenceLevelInStdDeviation();

            // THEN
            expect(economySettings.confidenceLevelSD).toEqual(0.806421);
        });

        /**
         * Test resetPeriod
         */
        it('Test computePeriod - MTC', function () {
            // WHEN
            economySettings.period = null;
            economySettings.selectedPeriod = null;
            economySettings.weightingScheme = 'MTC';
            economySettings.computePeriod();

            // THEN
            expect(economySettings.period).toEqual(72);
            expect(economySettings.selectedPeriod).toEqual('6Y');
        });

        /**
         * Test resetPeriod
         */
        it('Test computePeriod - WKL', function () {
            // WHEN
            economySettings.period = null;
            economySettings.selectedPeriod = null;
            economySettings.weightingScheme = 'WKL';
            economySettings.computePeriod();

            // THEN
            expect(economySettings.period).toEqual(104);
            expect(economySettings.selectedPeriod).toEqual('2Y');
        });

        /**
         * Test computePeriod
         */
        it('Test computePeriod', function () {
            // WHEN
            economySettings.period = 126;
            economySettings.weightingScheme = 'DLY';
            economySettings.computePeriod();

            // THEN
            expect(economySettings.selectedPeriod).toEqual('6M');
        });

        /**
         * Test computePeriod
         */
        it('Test computePeriod', function () {
            // WHEN
            economySettings.period = 1008;
            economySettings.weightingScheme = 'DLY';
            economySettings.computePeriod();

            // THEN
            expect(economySettings.selectedPeriod).toEqual('4Y');
        });

        /**
         * Test computePeriod
         */
        it('Test computePeriod', function () {
            // WHEN
            economySettings.period = 288;
            economySettings.weightingScheme = 'WKL';
            economySettings.computePeriod();

            // THEN
            expect(economySettings.selectedPeriod).toEqual('Other');
        });

        /**
         * Test resetPeriod
         */
        it('Test computePeriod when different parentRiskSettings', function () {
            // WHEN
            economySettings.period = 1008;
            economySettings.weightingScheme = 'DLY';
            ((economySettings as EconomySettings).parentRiskSettings as EconomySettings).weightingScheme = 'MKT';
            economySettings.computePeriod();

            // THEN
            expect(economySettings.selectedPeriod).toEqual('4Y');
        });

        /**
         * Test resetHalfLife
         */
        it('Test resetHalfLife1', function () {
            // WHEN
            economySettings.decayFactor = 0.982820599;
            economySettings.weightingScheme = 'DLY';
            economySettings.resetHalfLife();

            // THEN
            expect(economySettings.halfLifeLabel).toEqual(CoreRiskConstants.HALF_LIFE_LABEL.DAYS);
            expect(economySettings.isHalfLifeModifiable).toEqual(true);
            expect(economySettings.isPeriodModifiable).toEqual(true);
        });

        /**
         * Test resetHalfLife
         */
        it('Test resetHalfLife2', function () {
            // WHEN
            economySettings.decayFactor = 0.982820599;
            economySettings.weightingScheme = 'MTC';
            economySettings.resetHalfLife();

            // THEN
            expect(economySettings.halfLifeInDays).toEqual(40);
            expect(economySettings.halfLifeLabel).toEqual(CoreRiskConstants.HALF_LIFE_LABEL.MONTHS);
            expect(economySettings.isHalfLifeModifiable).toEqual(true);
            expect(economySettings.isPeriodModifiable).toEqual(true);
        });

        /**
         * Test resetHalfLife
         */
        it('Test resetHalfLife3', function () {
            // WHEN
            economySettings.decayFactor = 0.982820599;
            economySettings.weightingScheme = 'WKL';
            economySettings.resetHalfLife();

            // THEN
            expect(economySettings.halfLifeInDays).toEqual(40);
            expect(economySettings.halfLifeLabel).toEqual(CoreRiskConstants.HALF_LIFE_LABEL.WEEKS);
            expect(economySettings.isHalfLifeModifiable).toEqual(false);
            expect(economySettings.isPeriodModifiable).toEqual(true);
        });

        /**
         * Test setDefaultPeriod
         */
        it('Test setDefaultPeriod', function () {
            jest.spyOn(economySettings, 'createCustomBasedOnPeriod').mockImplementation(() => {
                return;
            });

            jest.spyOn(economySettings, 'computePeriod').mockImplementation(() => {
                return;
            });

            // WHEN
            economySettings.period = 104;
            economySettings.setDefaultPeriod();

            // THEN
            expect(economySettings.computePeriod).toHaveBeenCalled();
            expect(economySettings.createCustomBasedOnPeriod).toHaveBeenCalled();
        });

        /**
         * Test createCustomBasedOnPeriod
         */
        it('Test createCustomBasedOnPeriod', function () {
            jest.spyOn(economySettings, 'handleChangeInWeightingSchemeDependents').mockImplementation((function () {
                return;
            }));

            // WHEN
            economySettings.period = null;
            economySettings.parentRiskSettings.period = 104;
            economySettings.createCustomBasedOnPeriod();

            // THEN
            expect(economySettings.handleChangeInWeightingSchemeDependents).toHaveBeenCalled();
        });

        /**
         * Test createCustomBasedOnPeriod
         */
        it('Test createCustomBasedOnPeriod', function () {
            jest.spyOn(economySettings, 'handleChangeInWeightingSchemeDependents').mockImplementation((function () {
                return;
            }));

            // WHEN
            economySettings.period = 99;
            economySettings.createCustomBasedOnPeriod();

            // THEN
            expect(economySettings.handleChangeInWeightingSchemeDependents).toHaveBeenCalled();
        });

        /**
         * Test handleChangeInWeightingSchemeDependents
         */
        it('checks if custom weighting scheme is handled properly if it was custom already', function () {
            // WHEN
            economySettings.selectedPeriod = '10Y';
            economySettings.weightingScheme = 'WKL';
            economySettings.handleChangeInWeightingSchemeDependents();

            // THEN
            expect(economySettings.weightingScheme).toEqual('WKL');
        });

        /**
         * Test makes weighting scheme custom when half life is changed
         */
        it('makes weighting scheme custom when half life is changed1', function () {
            // WHEN CUSTOM
            economySettings.parentRiskSettings.parentRiskSettings.weightingScheme = 'WKL';
            economySettings.weightingScheme = 'WKL';
            economySettings.decayFactor = 0.98557454;

            economySettings.handleChangeInWeightingSchemeDependents();

            const expectedAvailableWeightingSchemes2: WeightingSchemes[] = [
                new WeightingSchemes({
                    'value': 'WKS',
                    'displayName': 'Weekly Short-Term Half-Life',
                    'toolTip': 'Weekly Short-Term Half-Life',
                    'defaultDecay': 0.917,
                    'halfLifeLabel': 'weeks',
                    'isHalfLifeModifiable': false,
                    'defaultPeriod': 104,
                    'isPeriodModifiable': true,
                    'isCustomScheme': false,
                    'defaultOverlap': 1
                }),
                new WeightingSchemes({
                    'value': 'WKL',
                    'displayName': 'Weekly Long-Term Half-Life',
                    'toolTip': 'Weekly Long-Term Half-Life',
                    'defaultDecay': 0.9737,
                    'halfLifeLabel': 'weeks',
                    'isHalfLifeModifiable': false,
                    'defaultPeriod': 104,
                    'isPeriodModifiable': true,
                    'isCustomScheme': false,
                    'defaultOverlap': 2
                }),
                new WeightingSchemes({
                    'value': 'MTC',
                    'displayName': 'Monthly Constant-Weighted',
                    'toolTip': 'Monthly Constant-Weighted',
                    'defaultDecay': 1,
                    'halfLifeLabel': 'months',
                    'isHalfLifeModifiable': true,
                    'defaultPeriod': 72,
                    'isPeriodModifiable': true,
                    'isCustomScheme': false,
                    'defaultOverlap': 3
                }),
                new WeightingSchemes({
                    'value': 'DLY',
                    'displayName': 'Daily User-Defined Half-Life',
                    'toolTip': 'Daily User-Defined Half-Life',
                    'defaultDecay': 0.982820599,
                    'halfLifeLabel': 'days',
                    'isHalfLifeModifiable': true,
                    'defaultPeriod': 252,
                    'isPeriodModifiable': true,
                    'isCustomScheme': false,
                    'defaultOverlap': 4
                }),
                new WeightingSchemes({
                    'value': 'WKL',
                    'displayName': 'Custom based on WKL',
                    'toolTip': 'Weekly Long-Term Half-Life',
                    'halfLifeLabel': 'weeks',
                    'defaultDecay': 0.98557454,
                    'isHalfLifeModifiable': false,
                    'defaultPeriod': 104,
                    'isPeriodModifiable': true,
                    'isCustomScheme': true,
                    'isOrgOrPortDefault': false,
                    'defaultOverlap': 2
                })
            ];

            // THEN
            expect(JSON.stringify(economySettings.availableWeightingSchemes)).toEqual(JSON.stringify(expectedAvailableWeightingSchemes2));
        });

        /**
         * Test makes weighting scheme custom when half life is changed
         */
        it('makes weighting scheme custom when half life is changed2', function () {
            // WHEN GP
            economySettings.decayFactor = null;
            economySettings.parentRiskSettings.decayFactor = 0.98557454;
            economySettings.weightingScheme = 'WKL';

            economySettings.handleChangeInWeightingSchemeDependents();

            const expectedAvailableWeightingSchemes3 = [
                new WeightingSchemes({
                    'value': 'WKS',
                    'displayName': 'Weekly Short-Term Half-Life',
                    'toolTip': 'Weekly Short-Term Half-Life',
                    'defaultDecay': 0.917,
                    'halfLifeLabel': 'weeks',
                    'isHalfLifeModifiable': false,
                    'defaultPeriod': 104,
                    'isPeriodModifiable': true,
                    'isCustomScheme': false,
                    'defaultOverlap': 1
                }),
                new WeightingSchemes({
                    'value': 'WKL',
                    'displayName': 'Weekly Long-Term Half-Life',
                    'toolTip': 'Weekly Long-Term Half-Life',
                    'defaultDecay': 0.9737,
                    'halfLifeLabel': 'weeks',
                    'isHalfLifeModifiable': false,
                    'defaultPeriod': 104,
                    'isPeriodModifiable': true,
                    'isCustomScheme': false,
                    'defaultOverlap': 2
                }),
                new WeightingSchemes({
                    'value': 'MTC',
                    'displayName': 'Monthly Constant-Weighted',
                    'toolTip': 'Monthly Constant-Weighted',
                    'defaultDecay': 1,
                    'halfLifeLabel': 'months',
                    'isHalfLifeModifiable': true,
                    'defaultPeriod': 72,
                    'isPeriodModifiable': true,
                    'isCustomScheme': false,
                    'defaultOverlap': 3
                }),
                new WeightingSchemes({
                    'value': 'DLY',
                    'displayName': 'Daily User-Defined Half-Life',
                    'toolTip': 'Daily User-Defined Half-Life',
                    'defaultDecay': 0.982820599,
                    'halfLifeLabel': 'days',
                    'isHalfLifeModifiable': true,
                    'defaultPeriod': 252,
                    'isPeriodModifiable': true,
                    'isCustomScheme': false,
                    'defaultOverlap': 4
                }),
                new WeightingSchemes({
                    'value': 'WKL',
                    'displayName': 'GP Default based on WKL',
                    'toolTip': 'Weekly Long-Term Half-Life',
                    'halfLifeLabel': 'weeks',
                    'defaultDecay': 0.9737,
                    'isHalfLifeModifiable': false,
                    'defaultPeriod': 104,
                    'isPeriodModifiable': true,
                    'isCustomScheme': true,
                    'isOrgOrPortDefault': false,
                    'defaultOverlap': 2
                })
            ];

            // THEN
            expect(JSON.stringify(economySettings.availableWeightingSchemes)).toEqual(JSON.stringify(expectedAvailableWeightingSchemes3));
        });

        /**
         * Test getting the period when the parent has a various weighting schemes.
         */
        it('Test getting the period when the parent has a various weighting schemes', function () {
            // WHEN
            economySettings.weightingScheme = 'WKL';
            // THEN - expect it to pick up the available period setting.
            expect(economySettings.period).toEqual(104);

            // WHEN Set the value on the parent.
            economySettings.parentRiskSettings.period = 10;
            // THEN - expect it to pick up the available period setting as the parent does not have the correct scheme set.
            expect(economySettings.period).toEqual(104);

            // WHEN Set the value on the parent.
            economySettings.parentRiskSettings.weightingScheme = economySettings.weightingScheme;
            // THEN - expect it to pick up the parents period as the weighting scheme is the same.
            expect(economySettings.period).toEqual(10);

            // WHEN Set the value on the parent.
            economySettings.parentRiskSettings.weightingScheme = 'MTC';
            economySettings.parentRiskSettings.period = 10;
            economySettings.parentRiskSettings.parentRiskSettings.weightingScheme = economySettings.weightingScheme;
            economySettings.parentRiskSettings.parentRiskSettings.period = 15;
            // THEN - expect it to pick up the parents parent period as the weighting scheme is the same skipping the middle layer.
            expect(economySettings.period).toEqual(15);
        });

        /**
         * Test computePeriodInText
         */
        it('Test computePeriodInText', function () {
            // WHEN
            economySettings.selectedPeriod = '5Y';
            economySettings.weightingScheme = 'DLY';
            economySettings.computePeriodInText();

            // THEN
            expect(economySettings.period).toEqual(1260);
        });

        /**
         * Test computePeriodInText
         */
        it('Test computePeriodInText', function () {
            // WHEN
            economySettings.selectedPeriod = '6M';
            economySettings.weightingScheme = 'DLY';
            economySettings.computePeriodInText();

            // THEN
            expect(economySettings.period).toEqual(126);
        });

        /**
         * Test computePeriodInText
         */
        it('Test computePeriodInText', function () {
            // WHEN
            economySettings.selectedPeriod = '6M';
            economySettings.weightingScheme = 'WKL';
            economySettings.computePeriodInText();

            // THEN
            expect(economySettings.period).toEqual(26);
        });

        /**
         * Test computePeriodInText
         */
        it('Test computePeriodInText', function () {

            // WHEN
            economySettings.selectedPeriod = '5Y';
            economySettings.weightingScheme = 'WKL';
            economySettings.computePeriodInText();

            // THEN
            expect(economySettings.period).toEqual(260);
        });

        /**
         * Test computePeriodInText
         */
        it('Test computePeriodInText', function () {
            // WHEN
            economySettings.selectedPeriod = '10Y';
            economySettings.weightingScheme = 'WKL';
            economySettings.computePeriodInText();

            // THEN
            expect(economySettings.period).toEqual(520);
        });

        /**
         * Test computePeriodInText
         */
        it('Test computePeriodInText', function () {
            // WHEN
            economySettings.selectedPeriod = '10Y';
            economySettings.weightingScheme = 'MTC';
            economySettings.computePeriodInText();

            // THEN
            expect(economySettings.period).toEqual(120);
        });

        /**
         * Test computePeriodInText
         */
        it('Test computePeriodInText', function () {
            // WHEN
            economySettings.selectedPeriod = '10Y';
            economySettings.weightingScheme = 'DLY';
            economySettings.computePeriodInText();

            // THEN
            expect(economySettings.period).toEqual(2520);
        });

        /**
         * Test computeHalfLifeDecay
         */
        it('Test computeHalfLifeDecay', function () {
            jest.spyOn(economySettings, 'resetHalfLife').mockImplementation((function () {
                return;
            }));
            // WHEN
            economySettings.halfLifeInDays = -6;
            economySettings.computeHalfLifeDecay();

            // THEN
            expect(economySettings.resetHalfLife).toHaveBeenCalled();
        });

        /**
         * Test computeHalfLifeDecay
         */
        it('Test computeHalfLifeDecay', function () {
            // WHEN
            economySettings.halfLifeInDays = 25;
            economySettings.computeHalfLifeDecay();

            // THEN
            expect(economySettings.decayFactor).toEqual(0.97265495);
        });

        /**
         * Test computeHalfLifeDecay
         */
        it('Test computeHalfLifeDecay', function () {
            // WHEN
            economySettings.halfLifeInDays = 40;
            economySettings.computeHalfLifeDecay();

            // THEN
            expect(economySettings.decayFactor).toEqual(0.9828206);
        });

        /**
         * Test computeHalfLifeDecay
         */
        it('Test computeHalfLifeDecay', function () {
            // WHEN
            economySettings.halfLifeInDays = 20;
            economySettings.computeHalfLifeDecay();

            // THEN
            expect(economySettings.decayFactor).toEqual(0.96593633);
        });

        /**
         * Test computeHalfLifeDecay
         */
        it('Test computeHalfLifeDecay', function () {
            // WHEN
            economySettings.halfLifeInDays = 100;
            economySettings.computeHalfLifeDecay();

            // THEN
            expect(economySettings.decayFactor).toEqual(0.9930925);
        });

        /**
         * Test computeHalfLifeDecay
         */
        it('Test computeHalfLifeDecay with different parent risk settings', function () {
            // WHEN
            economySettings.halfLifeInDays = 40;
            ((economySettings as EconomySettings).parentRiskSettings as EconomySettings).weightingScheme = 'MKT';
            economySettings.computeHalfLifeDecay();

            // THEN
            expect(economySettings.decayFactor).toEqual(0.9828206);
        });

        /**
         * Test computeHalfLifeInDays
         */
        it('Test computeHalfLifeInDays', function () {
            jest.spyOn(economySettings, 'resetHalfLife').mockImplementation((function () {
                return;
            }));
            // WHEN
            economySettings.decayFactor = -0.9930925;
            economySettings.computeHalfLifeInDays();

            // THEN
            expect(economySettings.resetHalfLife).toHaveBeenCalled();
        });

        /**
         * Test computeHalfLifeInDays
         */
        it('Test computeHalfLifeInDays', function () {
            jest.spyOn(economySettings, 'resetHalfLife').mockImplementation((function () {
                return;
            }));
            // WHEN
            economySettings.decayFactor = 1;
            economySettings.computeHalfLifeInDays();

            // THEN
            expect(economySettings.halfLifeInDays).toEqual(null);
        });

        /**
         * Test computeHalfLifeInDays
         */
        it('Test computeHalfLifeInDays', function () {
            jest.spyOn(economySettings, 'resetHalfLife').mockImplementation((function () {
                return;
            }));
            // WHEN
            economySettings.decayFactor = 0.9930925;
            economySettings.computeHalfLifeInDays();

            // THEN
            expect(economySettings.halfLifeInDays).toEqual(100);
        });

        /**
         * Test computeHalfLifeInDays
         */
        it('Test computeHalfLifeInDays', function () {
            jest.spyOn(economySettings, 'resetHalfLife').mockImplementation((function () {
                return;
            }));

            // WHEN
            economySettings.decayFactor = 0.96593633;
            economySettings.computeHalfLifeInDays();

            // THEN
            expect(economySettings.halfLifeInDays).toEqual(20);
        });

        /**
         * Test computeHalfLifeInDays
         */
        it('Test computeHalfLifeInDays', function () {
            jest.spyOn(economySettings, 'resetHalfLife').mockImplementation((function () {
                return;
            }));

            // WHEN
            economySettings.decayFactor = 0.9828206;
            economySettings.computeHalfLifeInDays();

            // THEN
            expect(economySettings.halfLifeInDays).toEqual(40);
        });

        /**
         * Test computeHalfLifeInDays
         */
        it('Test computeHalfLifeInDays', function () {
            jest.spyOn(economySettings, 'resetHalfLife').mockImplementation((function () {
                return;
            }));

            // WHEN
            economySettings.decayFactor = 0.97265495;
            economySettings.computeHalfLifeInDays();

            // THEN
            expect(economySettings.halfLifeInDays).toEqual(25);
        });

        /**
         * Test for getDateToUse
         */
        it('Test getDateToUse', () => {
            economySettings.dateObject = {
                dateString: true, dateStringValue: 'T-9'
            };
            expect(economySettings.getDateToUse(economySettings.dateObject)).toEqual('T-9');

            economySettings.dateObject = {
                dateString: false, date: '07072018'
            };
            expect(economySettings.getDateToUse(economySettings.dateObject)).toEqual('07072018');
        });

        /**
         * Test for addRequestData method
         */
        it(' Test add RequestData', () => {
            const portfolioDefaultRiskSettings = new EconomySettings(new EconomySettings(), CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            portfolioDefaultRiskSettings.weightingScheme = 'MTC';
            portfolioDefaultRiskSettings.riskHorizon = 2;
            portfolioDefaultRiskSettings.decayFactor = 0.33;
            portfolioDefaultRiskSettings.confidenceLevelSD = 2;
            portfolioDefaultRiskSettings.period = 3;
            portfolioDefaultRiskSettings.overlap = 3;
            portfolioDefaultRiskSettings.dateObject = new DateValue({date: '12/03/2017', calCode: 'UK'});

            const requestParams: any = {};
            portfolioDefaultRiskSettings.addRequestData(requestParams, new EconomySettings());

            const expectedRequestParam: any = {
                Calendar: 'UK',
                ConfidenceLevelInStdDeviation: 2,
                CovMatrix: 'MTC',
                DecayFactor: 0.33,
                EconomyDate: '12/03/2017',
                Period: 3,
                RiskHorizon: 2,
                Overlap: 3
            };
            expect(requestParams).toEqual(expectedRequestParam);
        });

        /**
         * Test for addRequestData method with addDefaultValues flag
         */
        it(' Test add RequestData with addDefaultValues flag', () => {
            const parentSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
            parentSettings.decayFactor = 0.33;
            parentSettings.overlap = 3;
            parentSettings.period = 3;
            const portfolioDefaultRiskSettings = new EconomySettings(parentSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
            portfolioDefaultRiskSettings.decayFactor = 0.33;
            portfolioDefaultRiskSettings.period = 3;
            portfolioDefaultRiskSettings.overlap = 3;

            const requestParams: any = {};
            portfolioDefaultRiskSettings.addRequestData(requestParams, new EconomySettings());

            const expectedRequestParam: any = {
                DecayFactor: 0.33,
                Period: 3,
                Overlap: 3
            };
            expect(requestParams).not.toEqual(expectedRequestParam);

            portfolioDefaultRiskSettings.addRequestData(requestParams, new EconomySettings(), true);
            expect(requestParams).toEqual(expectedRequestParam);
        });


        /**
         * Test Test
         */
        it('Test setDefaultOverlap', function () {
            // WHEN
            economySettings.weightingScheme = 'DLY';
            economySettings.setDefaultOverlap();

            // THEN
            expect(economySettings.overlap).toEqual(4);
        });
    });

    /**
     * Test resetSettings
     */
    it('Test resetSettings', function () {
        // GIVEN
        const parentRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const economySettings = new EconomySettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        economySettings.weightingScheme = 'DLY';
        economySettings.riskHorizon = 2;
        economySettings.decayFactor = 0.33;
        economySettings.confidenceLevelSD = 2;
        economySettings.period = 3;
        economySettings.dateObject = new DateValue({dateString: true, dateStringValue: 'T-1', calCode: 'UK'})
        // WHEN
        economySettings.resetSettings();

        // THEN
        expect(economySettings.weightingScheme).toEqual(undefined);
        expect(economySettings.riskHorizon).toEqual(undefined);
        expect(economySettings.decayFactor).toEqual(undefined);
        expect(economySettings.confidenceLevelSD).toEqual(1);
        expect(economySettings.period).toEqual(undefined);
        expect(economySettings.dateObject).toEqual(undefined);
    });

    /**
     * Test addRequestData When
     */
    it('Test addRequestData', function () {

        // GIVEN
        const defaultRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        const parentRiskSettings = new EconomySettings(defaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const economySettings = new EconomySettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        defaultRiskSettings.weightingScheme = 'DLY';
        economySettings.weightingScheme = 'DLY';
        defaultRiskSettings.riskHorizon = 2;
        defaultRiskSettings.decayFactor = 0.33;
        defaultRiskSettings.confidenceLevelSD = 2;
        defaultRiskSettings.period = 3;

        // WHEN
        const expected: any = {};
        economySettings.addRequestData(expected, economySettings);

        // THEN
        expect(expected).toEqual({});
    });

    /**
     * Test addRequestData When
     */
    it('Test addRequestData', function () {
        // GIVEN
        const defaultRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        const parentRiskSettings = new EconomySettings(defaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const economySettings = new EconomySettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        defaultRiskSettings.weightingScheme = 'DLY';
        economySettings.weightingScheme = 'MTC';
        economySettings.riskHorizon = 2;
        economySettings.decayFactor = 0.33;
        economySettings.confidenceLevelSD = 2;
        economySettings.period = 3;
        economySettings.dateObject = new DateValue({date: '12/03/2017', calCode: 'UK'});

        // WHEN
        const expected: any = {};
        economySettings.addRequestData(expected, economySettings);

        // THEN
        expect(expected).toEqual({
            CovMatrix: 'MTC',
            RiskHorizon: 2,
            DecayFactor: 0.33,
            ConfidenceLevelInStdDeviation: 2,
            Period: 3,
            EconomyDate: '12/03/2017',
            Calendar: 'UK'
        });
    });

    /**
     * Test addRequestData for Column
     */
    it('Test addRequestData for Column', function () {
        // GIVEN
        const defaultRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        const parentRiskSettings = new EconomySettings(defaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const widgetEconomyRiskSettings = new EconomySettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        const economySettings = new EconomySettings(widgetEconomyRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);

        defaultRiskSettings.weightingScheme = 'DLY';
        parentRiskSettings.weightingScheme = 'MTC';
        parentRiskSettings.riskHorizon = 2;
        parentRiskSettings.decayFactor = 0.33;
        parentRiskSettings.confidenceLevelSD = 2;
        parentRiskSettings.period = 3;
        parentRiskSettings.dateObject = new DateValue({date: '12/03/2017', calCode: 'UK'});

        // WHEN
        const expected: any = {};
        economySettings.addRequestData(expected, economySettings.parentRiskSettings as EconomySettings);

        // THEN
        expect(expected).toEqual({});
    });

    /**
     * Test doesValueExist
     */
    it('Test doesValueExist when it does', function () {
        // GIVEN
        const economySettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        economySettings.weightingScheme = 'MTC';
        economySettings.riskHorizon = 2;
        economySettings.decayFactor = 0.33;
        economySettings.confidenceLevelSD = 2;
        economySettings.period = 3;
        economySettings.dateObject = new DateValue({date: '12/03/2017', calCode: 'UK'});
        // THEN
        expect(economySettings.doesValueExist('weightingScheme')).toEqual(true);
        expect(economySettings.doesValueExist('riskHorizon')).toEqual(true);
        expect(economySettings.doesValueExist('decayFactor')).toEqual(true);
        expect(economySettings.doesValueExist('confidenceLevelSD')).toEqual(true);
        expect(economySettings.doesValueExist('period')).toEqual(true);
        expect(economySettings.doesValueExist('dateObject')).toEqual(true);
    });

    /**
     * Test doesValueExist When
     */
    it('Test doesValueExist when it doesnt ', () => {
        // GIVEN
        const economySettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        // WHEN
        economySettings.weightingScheme = undefined;
        economySettings.riskHorizon = undefined;
        economySettings.decayFactor = undefined;
        economySettings.confidenceLevelSD = undefined;
        economySettings.period = undefined;
        economySettings.dateObject = undefined;

        // THEN
        expect(economySettings.doesValueExist('weightingScheme')).toEqual(false);
        expect(economySettings.doesValueExist('riskHorizon')).toEqual(false);
        expect(economySettings.doesValueExist('decayFactor')).toEqual(false);
        expect(economySettings.doesValueExist('confidenceLevelSD')).toEqual(false);
        expect(economySettings.doesValueExist('period')).toEqual(false);
        expect(economySettings.doesValueExist('dateObject')).toEqual(false);
    });

    it('update economy Risk setting flag test case', () => {
        const economySettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);
        expect(economySettings.isEconomyRiskSettingChanged()).toBeFalsy();

        // change one setting
        economySettings.weightingScheme = 'FMI';
        expect(economySettings.isEconomyRiskSettingChanged()).toBeTruthy();
    });

    it('Test Economy date taking value from parentRiskSettings ', () => {
        const parentRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        parentRiskSettings.dateObject = new DateValue({dateString: true, dateStringValue: 'T-1', calCode: 'UK'});
        const economySettings = new EconomySettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);

        expect(economySettings.dateObject).toStrictEqual(parentRiskSettings.dateObject);

        // assigning dateObject variable with parentRiskSetting dateObject
        economySettings['_dateObject'] = economySettings.dateObject;

        // Any changes at parentRiskSettings dateObject will not get reflected to local dateObject variable due to clone deep
        parentRiskSettings.dateObject.dateStringValue = 'T-3';
        expect(economySettings['_dateObject'].dateStringValue).toBe('T-1');
    });

    it('Formats parent value', () => {
        const parentEconomySettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        const economySettings = new EconomySettings(parentEconomySettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        parentEconomySettings.dateObject = DateValue.newRelativeDate('T-1');
        expect(economySettings.getFormattedParentValue(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DATE_OBJECT)).toEqual('T-1');

        parentEconomySettings.weightingScheme = 'scheme-1';
        const weightingScheme = new WeightingSchemes();
        weightingScheme.value = 'scheme-1';
        weightingScheme.displayName = 'Weighting Scheme 1';
        economySettings.availableWeightingSchemes = [weightingScheme];
        expect(economySettings.getFormattedParentValue(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.WEIGHTING_SCHEME)).toEqual(weightingScheme.displayName);

        parentEconomySettings.period = 2;
        expect(economySettings.getFormattedParentValue(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.PERIOD)).toEqual('Other OR 2');

        parentEconomySettings.decayFactor = 0.5;
        expect(economySettings.getFormattedParentValue(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.DECAY_FACTOR)).toEqual('1 OR 0.5 σ');

        parentEconomySettings.overlap = 3;
        expect(economySettings.getFormattedParentValue(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.OVERLAP)).toEqual('3');

        parentEconomySettings.riskHorizon = 3;
        const riskHorizon = new RiskParameter();
        riskHorizon.value = '3';
        riskHorizon.text = 'Risk Horizon 3';
        economySettings.riskHorizons = [riskHorizon];
        expect(economySettings.getFormattedParentValue(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.RISK_HORIZON)).toEqual(riskHorizon.text);

        parentEconomySettings.confidenceLevelSD = 1.5;
        expect(economySettings.getFormattedParentValue(CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.CONFIDENCE_LEVEL_SD)).toEqual('93.3193 % OR 1.5 σ');
    });
});
