import { FactorSettingsColumnOption } from './factor-settings-column-option.model';
import {NumericColumnFormatColumnOption} from './numeric-column-format-column-option.model';

describe('FactorSettingsColumnOption', () => {

    describe('should create an instance', () => {
        it('without any argument to the constructor', () => {
            const factorSettingsColumnOption = new FactorSettingsColumnOption();
            expect(factorSettingsColumnOption).toBeTruthy();
            expect(factorSettingsColumnOption.isValid()).toBeTruthy();
            expect(factorSettingsColumnOption.configType).toBe('factorSettingsColumnOption');
            expect(factorSettingsColumnOption.numberOfRiskFactors).toBeFalsy();
            expect(factorSettingsColumnOption.additionalAnalytics).toBeFalsy();
        });

        it('with argument to the constructor', () => {
            const factorSettingsColumnOption = new FactorSettingsColumnOption({numberOfRiskFactors: 3, additionalAnalytics: ['R2']});
            expect(factorSettingsColumnOption).toBeTruthy();
            expect(factorSettingsColumnOption.isValid()).toBeTruthy();
            expect(factorSettingsColumnOption.numberOfRiskFactors).toBe(3);
            expect(factorSettingsColumnOption.additionalAnalytics).toStrictEqual(['R2']);
        });
    });

    describe('test equals', () => {
        it('Invalid numberOfRiskFactors', () => {
            const factorSettingsColumnOption = new FactorSettingsColumnOption({numberOfRiskFactors: 0, additionalAnalytics: ['R-Squared']});
            expect(factorSettingsColumnOption.isValid()).toBeFalsy();
            factorSettingsColumnOption.numberOfRiskFactors = 11;
            expect(factorSettingsColumnOption.isValid()).toBeFalsy();
        });

        it('Invalid additionalAnalytics', () => {
            const factorSettingsColumnOption = new FactorSettingsColumnOption({numberOfRiskFactors: 1, additionalAnalytics: ['Squared']});
            expect(factorSettingsColumnOption.isValid()).toBeFalsy();
        });
    });

    describe('test equals', () => {
        let factorSettingsColumnOption: FactorSettingsColumnOption;

        beforeEach(() => {
            factorSettingsColumnOption = new FactorSettingsColumnOption();
        });

        it('Undefined', () => {
            expect(factorSettingsColumnOption.equals(undefined)).toBeFalsy();
        });

        it('Other column option', () => {
            const other = new NumericColumnFormatColumnOption();
            expect(factorSettingsColumnOption.equals(other)).toBeFalsy();
        });

        it('Same column option', () => {
            const other = new FactorSettingsColumnOption();
            expect(factorSettingsColumnOption.equals(other)).toBeTruthy();
        });

        it('Same column option', () => {
            const other = new FactorSettingsColumnOption({numberOfRiskFactors: 1});
            expect(factorSettingsColumnOption.equals(other)).toBeFalsy();
        });

        it('Same column option', () => {
            const other = new FactorSettingsColumnOption({numberOfRiskFactors: 1, additionalAnalytics: ['Factors']});
            factorSettingsColumnOption.numberOfRiskFactors = 1;
            factorSettingsColumnOption.additionalAnalytics = ['Factors'];
            expect(factorSettingsColumnOption.equals(other)).toBeTruthy();
        });
    });

    describe('test addRequestParams', () => {

        let requestParam: any;

        beforeEach(() => {
            requestParam = {};
        });

        it('empty value', () => {
            const columnOption = new FactorSettingsColumnOption();
            columnOption.addRequestParams(requestParam);
            expect(Object.keys(requestParam.factorSettings).length).toBe(2);
            expect(requestParam.factorSettings.numberOfRiskFactors).toBeUndefined();
            expect(requestParam.factorSettings.additionalAnalytics).toBeUndefined();
        });

        it('all properties', () => {
            const columnOption = new FactorSettingsColumnOption({numberOfRiskFactors: 1, additionalAnalytics: ['Factors']});
            columnOption.addRequestParams(requestParam);
            expect(Object.keys(requestParam.factorSettings).length).toBe(2);
            expect(requestParam.factorSettings.numberOfRiskFactors).toBe(1);
            expect(requestParam.factorSettings.additionalAnalytics).toStrictEqual(['Factors']);
        });
    });
});
