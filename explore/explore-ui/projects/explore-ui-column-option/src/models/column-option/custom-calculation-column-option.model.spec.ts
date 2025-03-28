import {
    ColumnConfig,
    ColumnOptionFactory,
    CoreTestUtils,
    ExploreInputValidationInfo,
    NotificationType,
    CoreUserMetaDataStore,
    UserMetaData
} from '@blk/explore-ui-core';
import {BookColumnOption} from './book-column-option.model';
import {CustomCalculationColumnOption} from './custom-calculation-column-option.model';
import {CustomCalculationMeasureNodeColumnOption} from './custom-calculation-measure-node-column-option.model';

describe('CustomCalculationColumnOption', () => {
    let customCalculation: CustomCalculationColumnOption;
    const colConfig1 = {
        columnTag: 'market_val',
        positionColumnType: 'PORT',
        optionValues: [{
            measureNode: 'firstLevel',
            configType: CustomCalculationMeasureNodeColumnOption.CONFIG_TYPE
        }]
    };
    const colConfig2 = {
        columnTag: 'market_val',
        positionColumnType: 'BENCH',
        optionValues: [{
            measureNode: 'total',
            configType: CustomCalculationMeasureNodeColumnOption.CONFIG_TYPE
        }]
    };

    beforeAll(() => {
        CoreTestUtils.initDefinitions();
        ColumnOptionFactory.registerOptionType(CustomCalculationMeasureNodeColumnOption.CONFIG_TYPE, CustomCalculationMeasureNodeColumnOption);
        ColumnOptionFactory.registerOptionType(CustomCalculationColumnOption.CONFIG_TYPE, CustomCalculationColumnOption);
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        customCalculation = new CustomCalculationColumnOption({
            expression: 'a-b',
            measures: {
                a: colConfig1,
                b: colConfig2
            }
        });
        customCalculation.measureMapping['a'].columnKey = undefined;
        customCalculation.measureMapping['b'].columnKey = undefined;
    });

    it('Test model initialization', () => {
        expect(customCalculation).not.toBeUndefined();
        expect(customCalculation).not.toBeNull();
        expect(customCalculation.expression).toBeTruthy();
        expect(customCalculation.measureMapping).toBeTruthy();
        expect(customCalculation.expression).toBe('a-b');
        expect(customCalculation.measureMapping['a'].equals(new ColumnConfig(colConfig1))).toBeTruthy();
        expect(customCalculation.measureMapping['b'].equals(new ColumnConfig(colConfig2))).toBeTruthy();
    });

    it('Serialize/Deserialize test', () => {
        CoreUserMetaDataStore.userMetaData.login = 'user01';
        customCalculation.measureMapping['a'].columnKey = 'aaaa';
        customCalculation.measureMapping['b'].columnKey = 'bbbb';
        const serializedCustomCalc = customCalculation.serialize();
        // should not include measure columnKeys in serialization
        expect(JSON.stringify(serializedCustomCalc).includes('aaaa')).toEqual(false);
        expect(JSON.stringify(serializedCustomCalc).includes('bbbb')).toEqual(false);

        const calc = new CustomCalculationColumnOption(serializedCustomCalc);

        // should include randomly generated measure columnKeys when deserialized
        expect(calc.measureMapping['a'].columnKey).toBeDefined();
        expect(calc.measureMapping['b'].columnKey).toBeDefined();

        calc.measureMapping['a'].columnKey = undefined;
        calc.measureMapping['b'].columnKey = undefined;
        customCalculation.measureMapping['a'].columnKey = undefined;
        customCalculation.measureMapping['b'].columnKey = undefined;
        expect(calc.equals(customCalculation)).toBeTruthy();
    });

    it('Test isValidColumnOption', () => {
        // Test for special keywords
        const tWithBracket = 'T(';
        const tWithSpacesBracket = 'T  (';
        const javaTypeWord = 'java\.type';
        const keywords = ['alert', 'document', 'confirm', 'prompt', 'console', 'for', 'forEach', 'while', 'window', 'system', javaTypeWord, tWithBracket, tWithSpacesBracket];

        let i: number;
        let keyword: string;
        let shouldHaveErrorOnScript: boolean;
        let shouldHaveErrorOnSpecialWords: boolean;

        for (i = 0; i < keywords.length; i++) {
            keyword = keywords[i];

            // Check the keyword appearing on the first line - should have an error
            customCalculation.expression = '  ' + keyword + ' ';
            runValidateAndVerifyKeywordError(customCalculation, true, false);

            // Check the keywords appearing on the non-first line  - - should have an error
            customCalculation.expression = 'var x = 1; \n' + keyword;
            runValidateAndVerifyKeywordError(customCalculation, true, false);

            // Check key words appearing in the comment after some code - should have an error
            customCalculation.expression = 'var x = 1; // ' + keyword;
            runValidateAndVerifyKeywordError(customCalculation, true, false);

            // Check key words appearing in the comment line - should not have an error
            customCalculation.expression = ' // ' + keyword + ' ';
            runValidateAndVerifyKeywordError(customCalculation, false, false);

            customCalculation.expression = '\t// ' + keyword + ' ';
            runValidateAndVerifyKeywordError(customCalculation, false, false);

            // Check keywords as the prefix in the variable name - should not have an error with the following exceptions:
            // 1) java.type - should fail on the script validation because "var java.typeX;" is an invalid var name
            // 2) T( or T ( - should fail on the special words validation because "var T(X;" and "var T  (X;"
            // should match special words regex.
            customCalculation.expression = 'var ' + keyword + 'X;';

            shouldHaveErrorOnSpecialWords = keyword === tWithBracket || keyword === tWithSpacesBracket;

            shouldHaveErrorOnScript = keyword === javaTypeWord;

            runValidateAndVerifyKeywordError(customCalculation, shouldHaveErrorOnSpecialWords, shouldHaveErrorOnScript);

            // Check keywords as the suffix in the variable name - should not have an error with the following exceptions:
            // 1) java.type - should fail on the script validation because "var Xjava.type;" is an invalid var name
            // 2) T( or T ( - should fail on the script validation because "var XT(;" and "var XT  (;"
            // are too invalid var names
            customCalculation.expression = 'var X' + keyword + ';';
            shouldHaveErrorOnSpecialWords = false;

            shouldHaveErrorOnScript = keyword === javaTypeWord || keyword === tWithBracket || keyword === tWithSpacesBracket;

            runValidateAndVerifyKeywordError(customCalculation, shouldHaveErrorOnSpecialWords, shouldHaveErrorOnScript);
        }
        // Test for missing column definitions
        customCalculation.measureMapping['a'].columnTag = 'non_existent_tag';
        let validationInfo = customCalculation.isValidColumnOption();
        expect(validationInfo).not.toBe(undefined);
        expect(validationInfo.notificationType).toBe(NotificationType.ERROR);
        expect(validationInfo.message).toContain('You do not have permission on column measures used within this custom calculation.');

        customCalculation.measureMapping['a'].columnTag = 'market_val'; // Reset to valid tag
        customCalculation.measureMapping['b'].columnTag = 'non_existent_tag';
        validationInfo = customCalculation.isValidColumnOption();
        expect(validationInfo).not.toBe(undefined);
        expect(validationInfo.notificationType).toBe(NotificationType.ERROR);
        expect(validationInfo.message).toContain('You do not have permission on column measures used within this custom calculation.');
    
    });

    it('tests addRequestParams', () => {
        const requestParams: any = {};
        customCalculation.addRequestParams(requestParams);
        expect(requestParams['customCalculation']).toBeDefined();
        expect(requestParams['customCalculation']['expression']).toEqual('a-b');
        expect(Object.values(requestParams['customCalculation']['aliasDependencyMap']).length).toEqual(2);
        Object.values(requestParams['customCalculation']['aliasDependencyMap'])
            .forEach(option => expect(option['optionValues']['customCalculationNode']).toBeDefined());
    });

    it('tests equals', () => {
        expect(customCalculation.equals(null)).toBeFalsy();
        expect(customCalculation.equals(new BookColumnOption())).toBeFalsy();
        expect(customCalculation.equals(new CustomCalculationColumnOption())).toBeFalsy();
        expect(customCalculation.equals(new CustomCalculationColumnOption({expression: 'a-b'}))).toBeFalsy();
        let calc = new CustomCalculationColumnOption({
            expression: 'a-b',
            measures: {
                a: colConfig1
            }
        });
        calc.measureMapping['a'].columnKey = undefined;
        expect(customCalculation.equals(calc)).toBeFalsy();

        calc = new CustomCalculationColumnOption({
            expression: 'a-b',
            measures: {
                a: colConfig1,
                b: {
                    columnTag: 'market_val',
                    positionColumnType: 'BENCH',
                    optionValues: [{
                        measureNode: 'security',
                        configType: CustomCalculationMeasureNodeColumnOption.CONFIG_TYPE
                    }]
                }
            }
        });
        calc.measureMapping['a'].columnKey = undefined;
        calc.measureMapping['b'].columnKey = undefined;

        expect(customCalculation.equals(calc)).toBeFalsy();

        calc = new CustomCalculationColumnOption({
            expression: 'a-b',
            measures: {
                a: colConfig1,
                b: colConfig2
            }
        });
        calc.measureMapping['a'].columnKey = undefined;
        calc.measureMapping['b'].columnKey = undefined;

        expect(customCalculation.equals(calc)).toBeTruthy();
    });

    /**
     * Runs "isValidColumnOption" on the given custom calculation and validates the validation response
     */
    function runValidateAndVerifyKeywordError(custCalc: CustomCalculationColumnOption, shouldHaveErrorOnKeyword: boolean, shouldHaveErrorOnScript: boolean) {
        const validationInfo: ExploreInputValidationInfo = custCalc.isValidColumnOption();

        if (shouldHaveErrorOnKeyword || shouldHaveErrorOnScript) {
            expect(validationInfo).not.toBe(undefined);
            expect(validationInfo.notificationType).toBe(NotificationType.ERROR);
            if (shouldHaveErrorOnKeyword) {
                expect(validationInfo.message).toContain('should not include keywords');
            } else {
                expect(validationInfo.message).toContain('Custom Calculation Expression Error');
            }
        } else {
            expect(validationInfo).toBe(undefined);
        }
    }
});
