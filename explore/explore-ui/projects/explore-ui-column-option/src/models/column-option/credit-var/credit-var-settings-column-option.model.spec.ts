import { CreditVarSettingsColumnOption } from './credit-var-settings-column-option.model';

describe('CreditVarSettingsColumnOption', () => {
    let creditVarSettingsColumnOption: CreditVarSettingsColumnOption;

    beforeEach(() => {
        creditVarSettingsColumnOption = new CreditVarSettingsColumnOption();
    });

    describe('constructor', () => {
        it('should initialize confidenceLevelPercentage if data is provided', () => {
            const data = { confidenceLevelPercentage: 90 };
            const columnOption = new CreditVarSettingsColumnOption(data);
            expect(columnOption.confidenceLevelPercentage).toBe(90);
        });

        it('should not initialize confidenceLevelPercentage if data is not provided', () => {
            const columnOption = new CreditVarSettingsColumnOption();
            expect(columnOption.confidenceLevelPercentage).toBe(84);
        });
    });

    describe('isValidConfidenceLevelPercentage', () => {
        it('should return false if confidenceLevelPercentage is empty', () => {
            creditVarSettingsColumnOption.confidenceLevelPercentage = undefined;
            expect(creditVarSettingsColumnOption.isValid()).toBe(false);
        });

        it('should return true if confidenceLevelPercentage is not empty', () => {
            creditVarSettingsColumnOption.confidenceLevelPercentage = 90;
            expect(creditVarSettingsColumnOption.isValid()).toBe(true);
        });
    });

    describe('doAddRequestParams', () => {
        it('should add confidenceLevelPercentage to requestParams if it is valid', () => {
            creditVarSettingsColumnOption.confidenceLevelPercentage = 90;
            const requestParams = {};
            creditVarSettingsColumnOption['doAddRequestParams'](requestParams);
            expect(requestParams).toEqual({
                creditVarSettings: {
                    confidenceLevelPercentage: 90
                }
            });
        });

        it('should not add confidenceLevelPercentage to requestParams if it is not valid', () => {
            creditVarSettingsColumnOption.confidenceLevelPercentage = undefined;
            const requestParams = {};
            creditVarSettingsColumnOption['doAddRequestParams'](requestParams);
            expect(requestParams).toEqual({
                creditVarSettings: {}
            });
        });
    });
});
