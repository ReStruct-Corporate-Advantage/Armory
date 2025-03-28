import {
    AbstractColumnOption,
    ColumnConfig,
    ColumnOptionFactory,
    ColumnOptionMetaDataInterface,
    CoreTestUtils
} from '@blk/explore-ui-core';
import {ColumnOptionInitializer} from '../column-option.initializer';
import {BookColumnOption} from '../models/column-option/book-column-option.model';
import {CustomTitleColumnOption} from '../models/column-option/custom-title-column-option.model';
import {ColumnOptionUtils} from './column-option.utils';
import {HighlightColumnOption} from '../models/column-option/highlight-column-option.model';
import {ScenarioColumnOption} from '../models/column-option/scenario-column-option.model';

describe('ColumnOptionUtils', () => {
    beforeAll(() => {
        ColumnOptionInitializer.initializeConfig();
        CoreTestUtils.initDefinitions();
        ColumnOptionFactory.registerOptionType(HighlightColumnOption.CONFIG_TYPE, HighlightColumnOption);
        ColumnOptionFactory.registerOptionType(ScenarioColumnOption.CONFIG_TYPE, ScenarioColumnOption);
        ColumnOptionFactory.registerOptionType(ScenarioColumnOption.ALT_CONFIG_TYPE, ScenarioColumnOption);
    });

    describe('getCustomTitle Test', () => {
        it('should return custom title from column if exist', () => {
            const columnWithCustomTitle = new ColumnConfig();
            columnWithCustomTitle.optionValues.push(new CustomTitleColumnOption({customTitle: 'customTitle'}));
            expect(ColumnOptionUtils.getCustomTitle(columnWithCustomTitle)).toBe('customTitle');

            const columnWithEmptyTitle = new ColumnConfig();
            columnWithEmptyTitle.optionValues.push(new CustomTitleColumnOption({customTitle: ''}));
            expect(ColumnOptionUtils.getCustomTitle(columnWithEmptyTitle)).toBe(null);

            const columnWithTitleUndefined = new ColumnConfig();
            columnWithTitleUndefined.optionValues.push(new CustomTitleColumnOption({customTitle: undefined}));
            expect(ColumnOptionUtils.getCustomTitle(columnWithTitleUndefined)).toBe(null);

            const columnWithNoCustomTitle = new ColumnConfig();
            expect(ColumnOptionUtils.getCustomTitle(columnWithNoCustomTitle)).toBe(null);
        });
    });

    /**
     * Test case for method updateColumnTitle
     */
    it('Test updateColumnTitle', () => {
        const column = new ColumnConfig();
        column.columnTag = 'book_value';
        column.positionColumnType = 'PORT';
        const optionValue = new BookColumnOption();
        optionValue.accountingConvention = 'GAAP';
        ColumnOptionUtils.updateColumnTitle(column, optionValue, []);
        expect(column.columnTitle).toBe('Book Value (GAAP)');
    });

    it('tests if column breakdown has RAS multimanager enabled', () => {
        const column: ColumnConfig = ColumnConfig.createColumn('col1');
        expect(ColumnOptionUtils.isColumnRasMultiManagerEnabled(column)).toBeFalsy();

        column.optionValues = [];
        expect(ColumnOptionUtils.isColumnRasMultiManagerEnabled(column)).toBeFalsy();

        column.optionValues[0] = {};
        expect(ColumnOptionUtils.isColumnRasMultiManagerEnabled(column)).toBeFalsy();

        column.optionValues[0].configType = 'abc';
        expect(ColumnOptionUtils.isColumnRasMultiManagerEnabled(column)).toBeFalsy();

        column.optionValues[0].configType = 'columnBreakdown';
        expect(ColumnOptionUtils.isColumnRasMultiManagerEnabled(column)).toBeFalsy();

        column.optionValues[0].multiManagerData = {'decompositionMode': 'none'};
        expect(ColumnOptionUtils.isColumnRasMultiManagerEnabled(column)).toBeFalsy();

        column.optionValues[0].multiManagerData = {'decompositionMode': 'managerSelection'};
        expect(ColumnOptionUtils.isColumnRasMultiManagerEnabled(column)).toBeTruthy();
    });

    describe('hasSameConfigType Test', () => {
        it('should have same config type', () => {
            const targetColumnOption: AbstractColumnOption = ColumnOptionFactory.createNewModel(HighlightColumnOption.CONFIG_TYPE);
            const sourceColumnOptionMetaData: ColumnOptionMetaDataInterface = {
                columnOptionConfigType: 'highlight',
                columnOptionKey: 'highlightColumnOptionKey',
                columnOptionTitle: 'highlightColumnOptionTitle',
                columnOptionAttributes: []
            };
            expect(ColumnOptionUtils.hasSameConfigType(targetColumnOption, sourceColumnOptionMetaData)).toBe(true);
        });
        // target column option has ScenarioColumnOption.CONFIG_TYPE and source column option has ScenarioColumnOption.ALT_CONFIG_TYPE
        it('should have same config type for scenario column option', () => {
            const targetColumnOption: AbstractColumnOption = ColumnOptionFactory.createNewModel(ScenarioColumnOption.CONFIG_TYPE);
            const sourceColumnOptionMetaData: ColumnOptionMetaDataInterface = {
                columnOptionConfigType: 'scenarioRiskFactorViewColumnSettings',
                columnOptionKey: 'scenarioColumnOptionKey',
                columnOptionTitle: 'scenarioColumnOptionTitle',
                columnOptionAttributes: []
            };
            expect(ColumnOptionUtils.hasSameConfigType(targetColumnOption, sourceColumnOptionMetaData)).toBe(true);
        });
        // target column option has ScenarioColumnOption.ALT_CONFIG_TYPE and source column option has ScenarioColumnOption.CONFIG_TYPE
        it('should have same config type for scenario column option reverse order', () => {
            const targetColumnOption: AbstractColumnOption = ColumnOptionFactory.createNewModel(ScenarioColumnOption.ALT_CONFIG_TYPE);
            const sourceColumnOptionMetaData: ColumnOptionMetaDataInterface = {
                columnOptionConfigType: 'scenarioSettings',
                columnOptionKey: 'scenarioColumnOptionKey',
                columnOptionTitle: 'scenarioColumnOptionTitle',
                columnOptionAttributes: []
            };
            expect(ColumnOptionUtils.hasSameConfigType(targetColumnOption, sourceColumnOptionMetaData)).toBe(true);
        });
    });

    describe('updateColumnOptions Test', () => {
        let columnOptionMetaDataInterfaces: ColumnOptionMetaDataInterface[] = [{
                columnOptionConfigType: 'performanceSettings',
                columnOptionKey: 'performanceSettingsColumnOptionKey',
                columnOptionTitle: 'performanceSettingsColumnOptionTitle',
                columnOptionAttributes: []
        }];
        const restrictedColumnOptions = {sections: ['performanceSettingsColumnOptionKey']};
        const columnOptionsToAdd = [{
            columnOptionKey: 'highlight',
            columnOptionTitle: 'Highlight',
            columnOptionConfigType: 'highlight',
            columnOptionAttributes: []
        }];
        const columnOptionsToModify = new Map<string, () => {}>();
        // test that restrictedColumnOptions should be removed from column options
        it('should remove restricted column option', () => {
            jest.spyOn(ColumnOptionFactory, 'getFilteredColumnOptions').mockReturnValueOnce([]);
            const updatedColumnOptions = ColumnOptionUtils.updateColumnOptions(columnOptionMetaDataInterfaces, restrictedColumnOptions, undefined, undefined);
            expect(updatedColumnOptions.length).toBe(0);
        });
        // test that columnOptionsToAdd should be added to column options
        it('should add column option', () => {
            columnOptionMetaDataInterfaces = columnOptionMetaDataInterfaces.concat(columnOptionsToAdd);
            expect(columnOptionMetaDataInterfaces.length).toBe(2);
            expect(columnOptionMetaDataInterfaces[1].columnOptionKey).toBe('highlight');
        });
        // test that column options should be modified
        it('should modify column option', () => {
            jest.spyOn(ColumnOptionFactory, 'modifyColumnOptions').mockImplementation(() => {
                    columnOptionMetaDataInterfaces
                        .filter(columnOption => columnOption.columnOptionConfigType === HighlightColumnOption.CONFIG_TYPE)
                        .forEach(columnOption => columnOption.columnOptionTitle = columnOption.columnOptionTitle.concat('_modified'));
                });
            const updatedColumnOptions = ColumnOptionUtils.updateColumnOptions(columnOptionMetaDataInterfaces, undefined, undefined, columnOptionsToModify);
            expect(updatedColumnOptions[0].columnOptionTitle).toBe('performanceSettingsColumnOptionTitle');
            expect(updatedColumnOptions[1].columnOptionTitle).toBe('Highlight_modified');
        });
    });
});
