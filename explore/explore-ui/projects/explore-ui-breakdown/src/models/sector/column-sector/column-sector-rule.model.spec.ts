import {ColumnSectorRule} from './column-sector-rule.model';
import {CustomSectorType} from '../../../enums/custom-sector-type.enum';
import {CustomSectorRule} from '../custom-sector/custom-sector-rule.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {SectorConstants} from '../../../constants/sector.constants';

describe('ColumnSectorRule', () => {

    beforeAll(() => {
        ConfigTypeFactory.registerConfigType(SectorConstants.ConfigType.COLUMN_SECTOR_RULE, ColumnSectorRule);
    });

    it('should create an instance', () => {
        expect(new ColumnSectorRule()).toBeTruthy();
    });
    /**
     * Test calling serialize on the ColumnSectorRule and then using that generated string to deserialize into a new ColumnSectorRule and test it is the same.
     */
    it('Serialize/Deserialize test', () => {
        const rule: ColumnSectorRule = new ColumnSectorRule();
        rule.columnName = 'Security Group';
        rule.columnTag = 'sec_group';
        rule.positionColumnType = 'ALL';
        rule.dataType = 'String';
        rule.comparisonType = 'EQUALS';
        rule.comparisonValues = ['EQUITY', 'BND'];
        rule.comparisonLabels = ['EQUITY', 'BOND'];
        rule.customSectorType = CustomSectorType.FUND;

        // Convert the object to string and then back to json again.
        const serializedData: string = JSON.stringify(rule.serialize());
        const deserializedData: any = JSON.parse(serializedData);
        const newRule: ColumnSectorRule = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.COLUMN_SECTOR_RULE, true);

        // Validate that the before and after are the same.
        validateRuleEqual(rule, newRule);
    });

    /**
     * validates that the rule attributes are the same.
     */
    function validateRuleEqual(origRule: ColumnSectorRule, newRule: ColumnSectorRule): void {
        expect(newRule).toBeDefined();
        expect(newRule).not.toBeNull();
        expect(newRule.columnName).toBe(origRule.columnName);
        expect(newRule.columnTag).toBe(origRule.columnTag);
        expect(newRule.positionColumnType).toBe(origRule.positionColumnType);
        expect(newRule.dataType).toBe(origRule.dataType);
        expect(newRule.comparisonType).toBe(origRule.comparisonType);
        expect(newRule.customSectorType).toBe(origRule.customSectorType);

        if (origRule.comparisonValues && origRule.comparisonValues.length > 0) {
            validateArray(origRule.comparisonValues, newRule.comparisonValues);
        }
        if (origRule.comparisonLabels && origRule.comparisonLabels.length > 0) {
            validateArray(origRule.comparisonLabels, newRule.comparisonLabels);
        }
    }

    /**
     * Validates that the arrays are the same.
     */
    function validateArray(origArray: string[] | number[], newArray: string[] | number[]): void {
        expect(newArray).toBeDefined();
        expect(newArray).not.toBeNull();
        expect(newArray.length).toBe(origArray.length);
        const count: number = newArray.length;
        for (let i = 0; i < count; i++) {
            expect(newArray[i]).toBe(origArray[i]);
        }
    }

    /**
     * Test the different scenarios of the is valid.
     */
    it('test isValid', () => {
        const rule: ColumnSectorRule = new ColumnSectorRule();

        // Initially this should not be valid.
        expect(rule.isValid()).toBeFalsy();

        // Set a variable 1 at a time to ensure that it is nto valid until they are all set.
        rule.columnTag = 'sec_group';
        expect(rule.isValid()).toBeFalsy();
        rule.comparisonType = 'equals';
        expect(rule.isValid()).toBeFalsy();
        rule.comparisonValues = [];
        expect(rule.isValid()).toBeFalsy();
        rule.comparisonValues = ['ABS'];
        expect(rule.isValid()).toBeTruthy();
    });

    /**
     * Tests that a whitespace gets replaced in a column tag when creating
     * ColumnSectorRule with deserialised data
     */
    it('test white space replacement in a column tag', () => {
        const colTag = ' sec   attr1  ';
        const expectedString = '_space_sec_space__space__space_attr1_space__space_';

        // Create a column sector rule
        const rule: ColumnSectorRule = new ColumnSectorRule();
        rule.columnName = 'Security Group';
        rule.columnTag = colTag;
        rule.positionColumnType = 'ALL';
        rule.dataType = 'String';
        rule.comparisonType = 'EQUALS';
        rule.comparisonValues = ['EQUITY', 'BND'];
        rule.comparisonLabels = ['EQUITY', 'BOND'];

        // Serialise / Deserialise
        const serializedData: string = JSON.stringify(rule.serialize());
        const deserializedData: any = JSON.parse(serializedData);

        // Create a column sector rule from the deserialised data
        const newRule: ColumnSectorRule = ConfigTypeFactory.createConfig(deserializedData, SectorConstants.ConfigType.COLUMN_SECTOR_RULE, true);

        // Check that the whitespace is replaced in the column tag
        expect(newRule.columnTag).toEqual(expectedString);
    });

    it('test getDisplayTextForFundSectoring', () => {
        const rule: ColumnSectorRule = new ColumnSectorRule();
        rule.customSectorType = CustomSectorType.FUND;
        rule.comparisonValues = ['ABS'];
        const title = rule.getDisplayTextForFundSectoring();
        expect(title).toEqual('Fund Assignment Equals ABS');
    });

    it('test getDisplayTextForFundSectoring', () => {
        const rule: ColumnSectorRule = new ColumnSectorRule();
        rule.customSectorType = CustomSectorType.INDEX;
        rule.comparisonValues = ['ABS'];
        const title = rule.getDisplayTextForFundSectoring();
        expect(title).toEqual('Index Assignment Equals ABS');
    });

    it('test getDisplayTextForFundSectoring', () => {
        const rule: ColumnSectorRule = new ColumnSectorRule();
        rule.customSectorType = CustomSectorType.PORTFOLIO;
        rule.comparisonValues = ['ABS'];
        const title = rule.getDisplayTextForFundSectoring();
        expect(title).toEqual('Portfolio Assignment Equals ABS');
    });

    it('tests updateRule method - for string type', () => {
        const columnRule: ColumnSectorRule = new ColumnSectorRule();
        columnRule.columnName = 'Security Group';
        columnRule.columnTag = 'sec_group';
        columnRule.positionColumnType = 'ALL';
        columnRule.dataType = 'STRING';
        columnRule.comparisonType = 'Equals';

        const selectedColumn = {
            'columnTag': 'sec_group',
            'title': 'Security Group',
            'uses': 'ALL',
            'dataType': 'STRING',
            'groups': ['Security'],
            'staticColumn': true,
            'id': 'sec_group_ALL',
            'text': 'Security Group',
            'a_attr': {
                'title': 'Security Group\n\nDefinition:\nThe broadest type of classification of securities. \nSome examples are : MBS (Mortgage-Backed Securities), ABS (Asset-Backed), FUTURE (Futures)'
            },
            'parent': 'POSITION',
            'type': 'column'
        };

        columnRule.comparisonValues = ['ARM', 'CASH', 'CDI', 'CLC', 'CMDTY'];
        let didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', ['ARM', 'CASH', 'CDI', 'CLC'], 'STRING');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = ['ARM', 'CASH', 'CDI', 'CLC', 'CMDTY'];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', ['CDI', 'CLC', 'ABS', 'ARM', 'CASH', 'BND'], 'STRING');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = ['ARM', 'CASH', 'CDI', 'CLC', 'CMDTY'];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', ['CASH', 'CLC', 'ARM', 'CMDTY', 'CDI'], 'STRING');
        expect(didRuleChanged).toBeFalsy();

        columnRule.comparisonValues = ['ARM', 'CASH', 'CDI', 'CLC', 'CMDTY'];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', [], 'STRING');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = ['ARM', 'CASH', 'CDI', 'CLC', 'CMDTY'];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', null, 'STRING');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = ['ARM', 'CASH', 'CDI', 'CLC', 'CMDTY'];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', 'CDI', 'STRING');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = ['ARM', 'CASH', 'CDI', 'CLC', 'CMDTY'];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', 'ABS', 'STRING');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = ['ARM', 'CASH', 'CDI', 'CLC', 'CMDTY'];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Does not equal', ['ARM', 'CASH', 'CDI', 'CLC', 'CMDTY'], 'STRING');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = null;
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', ['ARM', 'CASH', 'CDI', 'CLC', 'CMDTY'], 'STRING');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = null;
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', null, 'STRING');
        expect(didRuleChanged).toBeFalsy();

        columnRule.comparisonValues = null;
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', [], 'STRING');
        expect(didRuleChanged).toBeFalsy();
    });

    it('tests updateRule method_2 - for number type', () => {
        const columnRule: ColumnSectorRule = new ColumnSectorRule();
        columnRule.columnName = 'Description';
        columnRule.columnTag = 'sec_desc';
        columnRule.positionColumnType = 'ALL';
        columnRule.dataType = 'NUMBER';
        columnRule.comparisonType = 'Equals';

        const selectedColumn = {
            'a_attr': {
                'title': 'Description↵↵Definition:↵Security description'
            },
            'columnTag': 'sec_desc',
            'dataType': 'NUMBER',
            'groups': ['Security'],
            'id': 'sec_desc_ALL',
            'parent': 'POSITION',
            'staticColumn': false,
            'text': 'Description',
            'title': 'Description',
            'type': 'column',
            'uses': 'ALL'
        };

        columnRule.comparisonValues = [1, 2, 3, 4];
        let didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', [1, 2, 3, 4, 0], 'NUMBER');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = [1, 2, 3, 4];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', [3, 2, 1], 'NUMBER');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = [1, 2, 3, 4];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', [4, 3, 2, 1], 'NUMBER');
        expect(didRuleChanged).toBeFalsy();

        columnRule.comparisonValues = [1, 2, 3, 4];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', [], 'NUMBER');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = [1, 2, 3, 4];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', null, 'NUMBER');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = [1, 2, 3, 4];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', 9, 'NUMBER');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = [1, 2, 3, 4];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', 4, 'NUMBER');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = [1, 2, 3, 4];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Does not equal', [1, 3, 2, 4], 'STRING');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = null;
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', [1, 3, 2, 4], 'STRING');
        expect(didRuleChanged).toBeTruthy();

        columnRule.comparisonValues = null;
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', null, 'STRING');
        expect(didRuleChanged).toBeFalsy();

        columnRule.comparisonValues = null;
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', [], 'STRING');
        expect(didRuleChanged).toBeFalsy();

        columnRule.comparisonValues = [1, 2, 3, 4];
        didRuleChanged = ColumnSectorRule.updateRule(columnRule, selectedColumn, 'Equals', 4, 'NUMBER', true);
        expect(didRuleChanged).toBeTruthy();
    });

    describe('equal test case method', () => {
        let columnRule: ColumnSectorRule;
        let ruleInput: ColumnSectorRule;
        beforeAll(() => {
            columnRule = new ColumnSectorRule();
            ruleInput = new ColumnSectorRule();
        });

        it('Give different instance for equality and should fail', () => {
            const ruleInput1: CustomSectorRule = new CustomSectorRule();

            // As columnRule and ruleInput are of different instance
            expect(columnRule.equals(ruleInput1)).toBeFalsy();
        });

        it('Same instance for equality and that should return true', () => {
            expect(columnRule.equals(ruleInput)).toBeTruthy();
        });

        it('Populating with different values for columnRule and ruleInput and check their equality', () => {
            // Giving same value
            // Populating columnRule
            columnRule.columnName = 'Description';
            columnRule.columnTag = 'sec_desc';
            columnRule.positionColumnType = 'ALL';
            columnRule.dataType = 'NUMBER';
            columnRule.comparisonType = 'Equals';
            columnRule.comparisonValues = ['EQUITY', 'BND'];
            columnRule.comparisonLabels = ['EQUITY', 'BOND'];

            // Populating ruleInput1
            ruleInput.columnName = 'Description';
            ruleInput.columnTag = 'sec_desc';
            ruleInput.positionColumnType = 'ALL';
            ruleInput.dataType = 'NUMBER';
            ruleInput.comparisonType = 'Equals';
            ruleInput.comparisonValues = ['EQUITY', 'BND'];
            ruleInput.comparisonLabels = ['EQUITY', 'BOND'];

            // As Both contains same value
            expect(columnRule.equals(ruleInput)).toBeTruthy();

            // Changing comparisionValues at 1 index
            ruleInput.comparisonValues[1] = 'DummyValue';
            // As columnRule and ruleInput1 contain different value for comparisionValues
            expect(columnRule.equals(ruleInput)).toBeFalsy();
        });
    });
});
