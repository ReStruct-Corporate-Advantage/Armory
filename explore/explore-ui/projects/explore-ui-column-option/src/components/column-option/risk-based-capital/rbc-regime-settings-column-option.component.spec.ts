import {ColumnOptionTestBed} from '../../../test-utils';
import {RbcRegimeSettingsColumnOptionComponent} from './rbc-regime-settings-column-option.component';
import {RbcRegimeSettingsColumnOption} from '../../../models/column-option/rbc-regime-settings-column-option.model';
import {ColumnConfig, DefinitionInitializer} from '@blk/explore-ui-core';

/**
 * Tests for RbcRegimeSettingsColumnOptionComponent class
 */
describe('RbcRegimeSettingsColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<RbcRegimeSettingsColumnOptionComponent, RbcRegimeSettingsColumnOption>;

    beforeEach(() => {
        const mockedOption = {
            columnOptionAttributes: [
                {
                    title: 'Regime Selection',
                    key: 'rbcRegimeSettings',
                    CLASS_TYPE: 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                    dataType: 'S'
                }
            ],
            columnOptionConfigType: 'rbcRegimeSettingsColumnOption',
            columnOptionTitle: 'Risk settings ',
            CLASS_TYPE: 'com.bfm.prism.data.column.options.riskbasedcapital.RiskBasedCapitalRegimeColumnOption',
            columnOptionKey: 'rbcRegimeSettingsColumnOption'
        };

        const columnConfig = new ColumnConfig();
        columnConfig.columnTag = 'standalone_rbc';
        columnConfig.columnKey = 'standalone_rbc_1';
        columnConfig.positionColumnType = 'PORT';
        columnConfig.columnTitle = 'Standalone RBC';

        const regimes = {'REGIME_EU_SOLVII': {'regimeId': 'REGIME_EU_SOLVII', 'regimeName': 'Eu Solvency II', 'regimeDescription': 'Solvency II is a risk-based framework representing a set of regulatory requirements for insurance firms domiciled in Europe, including the European operations of overseas insurers. It helps insurers understand the risks inherent in their businesses and allocate enough capital to cover those risks.', 'riskFactors': [{'riskFactorId': 'RISK_TYPE_INTEREST_RATE', 'riskFactorName': 'Interest Rate SCR', 'riskFactorDescription': 'Sensitivity of assets and liabilities to change in the term structure of interest rates or interest rate volatility, both in real and notional terms. For each bank curve across all currencies, we calculate the pre-defined up and down relative shocks on a daily basis. For yield curves with negative rates, the shocked amount for the specific yield curve point will be zero.'}, {'riskFactorId': 'RISK_TYPE_EQUITY', 'riskFactorName': 'Equity SCR', 'riskFactorDescription': 'Sensitivity to the level or volatility of equity market prices.We calculate market value exposure for all relevant assets apart from SCR for convertibles and equity options that are calculated via full revaluation.'}, {'riskFactorId': 'RISK_TYPE_SPREAD', 'riskFactorName': 'Spread SCR', 'riskFactorDescription': 'Sensitivity to changes in the level or in the volatility fo credit spreads over the risk-free interest rate term structure. Spread shocks use modified duration for sovereign bonds and spread duration for credit bonds/derivatives and structured products. '}, {'riskFactorId': 'RISK_TYPE_PROPERTY', 'riskFactorName': 'Property SCR', 'riskFactorDescription': 'Sensitivity of assets, liabilities and financial investments to the level and volatility of property market prices. The property shock is an instantaneous 25% decrease in the value of the real estate investments. '}, {'riskFactorId': 'RISK_TYPE_CONCENTRATION', 'riskFactorName': 'Market Concentration SCR', 'riskFactorDescription': 'Assessing balance sheet exposures to individual issuers. The total concentration risk SCR is calculated by taking the square root of the sum of square values of each issuer concentration SCR. '}, {'riskFactorId': 'RISK_TYPE_CURRENCY', 'riskFactorName': 'Currency SCR', 'riskFactorDescription': 'Sensitvity to the level or volatility of currency exchange rates. The currency in which the entity prepares its financial statements is defined as the local currency. All other currencies are referred to as foreign currencies.'}, {'riskFactorId': 'RISK_TYPE_TOTAL', 'riskFactorName': 'Total Market SCR', 'riskFactorDescription': 'Combine individual risk factor SCRs using the EIOPA-defined correlation matrix that allows for diversification benefits between the risk factors.'}]}};
        DefinitionInitializer.createRbcRegimeMapping({RbcRegimeOptions: regimes});

        testBed = new ColumnOptionTestBed<RbcRegimeSettingsColumnOptionComponent, RbcRegimeSettingsColumnOption>(
            RbcRegimeSettingsColumnOptionComponent,
            new RbcRegimeSettingsColumnOption(),
            mockedOption,
            undefined,
            undefined,
            undefined
        );
    });

    it('Should initialize', () => {
        expect(testBed.component).toBeTruthy();
        expect(testBed.component.regimeOptions.length).toEqual(1);
    });

    it('Test getOptionValueConfigType', () => {
        expect(testBed.component.getOptionValueConfigType()).toEqual(RbcRegimeSettingsColumnOptionComponent.OPTION_KEY);
    });

    it('Test onRegimeSelected', () => {
        expect(testBed.component.optionValue.regimeSelection.regime.isValid()).toBeFalsy();
        expect(testBed.component.optionValue.regimeSelection.riskFactors.length).toEqual(0);
        testBed.component.onRegimeSelected(testBed.component.regimeOptions[0].values[0]);
        expect(testBed.component.optionValue.regimeSelection.regime.isValid()).toBeTruthy();
        expect(testBed.component.riskFactors[0].values.length).toEqual(7);
    });

    it('Test onRiskFactorChanged', () => {
        const event: any = new CustomEvent('build', {detail: {value: 'RISK_TYPE_INTEREST_RATE'}});
        const event2: any = new CustomEvent('build', {detail: {value: ['RISK_TYPE_INTEREST_RATE', 'RISK_TYPE_EQUITY']}});
        testBed.component.onRiskFactorChanged(event);
        expect(testBed.component.optionValue.regimeSelection.riskFactors.length).toEqual(1);
        testBed.component.onRiskFactorChanged(event2);
        expect(testBed.component.optionValue.regimeSelection.riskFactors.length).toEqual(2);
    });

    it('Test isSingleSelectOption', () => {
        testBed.component.restrictedColumnOptions = {sections: [], options: [{section: 'singleSelectOptions', options: ['spawnsChildColumns']}]};
        expect(testBed.component.isSingleSelectOption()).toBeFalsy();
        testBed.component.option.columnOptionAttributes.push({
            title: 'Spawns Child Columns',
            key: 'spawnsChildColumns',
            dataType: 'S'
        });
        expect(testBed.component.isSingleSelectOption()).toBeTruthy();
    });
});
