import {ColumnDefinition, CoreDefinitionStore, NumericColumnFormat} from '@blk/explore-ui-core';
import {FormatAndScaleFactory} from '../../../factories';
import {ColumnConfig} from '@blk/explore-ui-core';
import {HighlightColumnOption} from '../../../models/column-option/highlight-column-option.model';
import {HighlightSettings} from '../../../models/highlight/highlight-settings.model';
import {ColumnOptionTestBed} from '../../../test-utils';
import {HighlightColumnOptionComponent} from './highlight-column-option.component';
import {NumericDataFormatter} from '../../../models/data-formatter/numeric-data-formatter.model';

describe('HighlightColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<HighlightColumnOptionComponent, HighlightColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Highlight',
            columnOptionConfigType: 'highlight',
            columnOptionKey: 'highlight',
            columnOptionAttributes: [
                {title: 'Compare Type', key: 'compareType', dataType: 'S'},
                {title: 'Compare Value', key: 'compareValue', dataType: 'S'},
                {title: 'Highlight Color', key: 'highlightColor', dataType: 'S'}
            ]
        };

        // Additional column config
        const columnConfig = new ColumnConfig();
        columnConfig.columnTag = 'pct_mv';
        columnConfig.columnKey = 'pct_mv_1';
        columnConfig.positionColumnType = 'PORT';
        columnConfig.columnTitle = 'Market Value %';

        const numericColumnFormat = new NumericColumnFormat({
            decimalPlaces: 1,
            isUseThousandsSeparator: true,
            isScalable: true,
            scalingFactor: 0.01
        });

        // create column def and place in data store
        const pctMVColumnDef = new ColumnDefinition();
        pctMVColumnDef.columnTag = 'pct_mv';
        pctMVColumnDef.title = 'Market Value %';
        pctMVColumnDef.dataType = 'DOUBLE';
        pctMVColumnDef.isStaticColumn = false;
        pctMVColumnDef.columnFormat = numericColumnFormat;
        CoreDefinitionStore.columnTagColumnsPairs = new Map().set(pctMVColumnDef.columnTag, [pctMVColumnDef]);

        jest.spyOn(FormatAndScaleFactory, 'getFormatterToUse').mockImplementation((_a, _b) => new NumericDataFormatter(new NumericColumnFormat(), []));

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<HighlightColumnOptionComponent, HighlightColumnOption>(
            HighlightColumnOptionComponent,
            new HighlightColumnOption(),
            mockedOption,
            undefined,
            undefined,
            undefined,
            columnConfig
        );
    });

    it('should initialize the component and get the comparison types for the column datatype', () => {
        expect(testBed.component).toBeTruthy();
        expect(testBed.component.validOperators.length).toBe(12);
    });

    it('should enable and disable leaf node only highlighting', () => {
        let checkboxEventMock: any = new CustomEvent('checkboxChanged', {detail: {value: {checked: true}}});
        testBed.component.updateHighlightOnlyLeafLevel(checkboxEventMock);
        expect(testBed.component.highlightColumnOption.highlightOnlyLeaf).toBe(true);

        checkboxEventMock = new CustomEvent('checkboxChanged', {detail: {value: {checked: false}}});
        testBed.component.updateHighlightOnlyLeafLevel(checkboxEventMock);
        expect(testBed.component.highlightColumnOption.highlightOnlyLeaf).toBe(false);
    });

    describe('Highlight Rules Tests', () => {

        it('should add and delete rules', () => {
            const rule1 = new HighlightSettings();
            const rule2 = new HighlightSettings();

            testBed.component.highlightColumnOption.highlightSettings = [];
            testBed.component.highlightColumnOption.highlightSettings.push(rule1, rule2);
            expect(testBed.component.highlightColumnOption.highlightSettings.length).toBe(2);

            // add rule
            testBed.component.addNewHighlightRule();
            expect(testBed.component.highlightColumnOption.highlightSettings.length).toBe(3);

            // delete first rule
            testBed.component.deleteHighlightRule(0);
            expect(testBed.component.highlightColumnOption.highlightSettings.length).toBe(2);
            expect(testBed.component.highlightColumnOption.highlightSettings[0]).toBe(rule2);
        });

        it('should reorder rules', () => {
            const rule1 = new HighlightSettings();
            const rule2 = new HighlightSettings();
            const rule3 = new HighlightSettings();

            testBed.component.highlightColumnOption.highlightSettings = [];
            testBed.component.highlightColumnOption.highlightSettings.push(rule1, rule2, rule3);

            // move rule2 to top
            testBed.component.reorderHighlightRule(1, true);
            expect(testBed.component.highlightColumnOption.highlightSettings[0]).toBe(rule2);
            expect(testBed.component.highlightColumnOption.highlightSettings[1]).toBe(rule1);
            expect(testBed.component.highlightColumnOption.highlightSettings[2]).toBe(rule3);

            // move rule1 to end
            testBed.component.reorderHighlightRule(1, false);
            expect(testBed.component.highlightColumnOption.highlightSettings[0]).toBe(rule2);
            expect(testBed.component.highlightColumnOption.highlightSettings[1]).toBe(rule3);
            expect(testBed.component.highlightColumnOption.highlightSettings[2]).toBe(rule1);
        });

        it('should create two highlight rules', () => {
            // create two highlight rules
            testBed.component.highlightColumnOption.highlightSettings = [];
            testBed.component.addNewHighlightRule();
            testBed.component.addNewHighlightRule();

            testBed.fixture.detectChanges();

            expect(testBed.fixture.debugElement.nativeElement.querySelector('.highlight-container')).toMatchSnapshot();
        });
    });
});
