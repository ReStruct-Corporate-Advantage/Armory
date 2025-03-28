import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HighlightColumnOption} from '../../../../models/column-option/highlight-column-option.model';
import {
    ColumnConfig,
    ColumnOptionFactory,
    CoreTestUtils,
    ExploreSelectOption,
    NumericColumnFormat,
    CoreUserMetaDataStore,
    UserMetaData
} from '@blk/explore-ui-core';
import {HighlightComparisonType} from '../../../../enums';
import {HighlightRuleFactory} from '../../../../factories';
import {NumericDataFormatter} from '../../../../models/data-formatter/numeric-data-formatter.model';
import {HighlightSettings} from '../../../../models/highlight/highlight-settings.model';
import {LibColumnUtils} from '../../../../utils';
import {HighlightRuleComponent} from './highlight-rule.component';

describe('HighlightRuleComponent', () => {
    let component: HighlightRuleComponent;
    let fixture: ComponentFixture<HighlightRuleComponent>;

    beforeAll(() => {
        CoreTestUtils.initDefinitions();
        ColumnOptionFactory.registerOptionType(HighlightColumnOption.CONFIG_TYPE, HighlightColumnOption);
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.preferences.set('theme', 'light') ;
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HighlightRuleComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(HighlightRuleComponent);
        component = fixture.componentInstance;

        component.highlightSettings = new HighlightSettings();
        component.validOperators = [];

        // set numeric data formatter
        const col = {columnTag: 'pct_mv'} as ColumnConfig;
        const columnDef = LibColumnUtils.getColumnDefinition(col);
        const columnFormat = columnDef.columnFormat as NumericColumnFormat;
        component.dataFormatter = new NumericDataFormatter(columnFormat, []);

        fixture.detectChanges();
    });

    describe('ngOnInit Tests', () => {
        it('should create an empty rule when a new rule is being created', () => {
            expect(component).toBeTruthy();
            expect(component.highlightSettings.comparisonType).toBeUndefined();
            expect(component.highlightSettings.comparisonRawValues.length).toBe(0);
            expect(component.highlightSettings.comparisonValues.length).toBe(0);

            // we set a default background color
            expect(component.highlightSettings.backGroundColors.length).toBe(2);
        });

        it('should initialize a saved rule', () => {
            // rule- highlight values between 4% and 50%
            const highlightSettings = new HighlightSettings();
            highlightSettings.comparisonType = HighlightComparisonType.BETWEEN;
            highlightSettings.comparisonRawValues = [0.04, 0.50];
            highlightSettings.backGroundColors[0] = 'rgb(255,0,0)';
            highlightSettings.foreGroundColors = undefined;
            component.highlightSettings = highlightSettings;

            component.validOperators = [HighlightComparisonType.BETWEEN];

            component.ngOnInit();

            const expectedScaledVals = ['4.0%', '50.0%'];
            expect(component.comparisonTypeOptions[0].values[0].displayValue).toBe('Between');
            expect(component.comparisonTypeOptions[0].values[0].value).toEqual(11);
            expect(component.isBetweenComparison).toBe(true);
            expect(component.isQuantileComparison).toBe(false);
            expect(component.highlightSettings.comparisonValues[0]).toBe(expectedScaledVals[0]);
            expect(component.highlightSettings.comparisonValues[1]).toBe(expectedScaledVals[1]);
            expect(component.highlightSettings.foreGroundColors).toBeUndefined();
            expect(component.selectedColorType).toBe('cellOnly');
            expect(component.backGroundColors).toBe(highlightSettings.backGroundColors);
            expect(component.foreGroundColors[0]).toBe('rgb(255,255,255)');
        });
        it('should initialize a saved rule text only', () => {
            // rule- highlight values between 4% and 50%
            const highlightSettings = new HighlightSettings();
            highlightSettings.comparisonType = HighlightComparisonType.BETWEEN;
            highlightSettings.comparisonRawValues = [0.04, 0.50];
            highlightSettings.backGroundColors = undefined;
            component.highlightSettings = highlightSettings;

            component.validOperators = [HighlightComparisonType.BETWEEN];

            component.ngOnInit();

            const expectedScaledVals = ['4.0%', '50.0%'];
            expect(component.comparisonTypeOptions[0].values[0].displayValue).toBe('Between');
            expect(component.comparisonTypeOptions[0].values[0].value).toEqual(11);
            expect(component.isBetweenComparison).toBe(true);
            expect(component.isQuantileComparison).toBe(false);
            expect(component.highlightSettings.comparisonValues[0]).toBe(expectedScaledVals[0]);
            expect(component.highlightSettings.comparisonValues[1]).toBe(expectedScaledVals[1]);
            expect(component.highlightSettings.backGroundColors).toBeUndefined();
            expect(component.selectedColorType).toBe('textOnly');
            expect(component.foreGroundColors).toBe(highlightSettings.foreGroundColors);
            expect(component.backGroundColors).toBeDefined();
        });
        it('should initialize a saved rule cell and text only', () => {
            // rule- highlight values between 4% and 50%
            const highlightSettings = new HighlightSettings();
            highlightSettings.comparisonType = HighlightComparisonType.BETWEEN;
            highlightSettings.comparisonRawValues = [0.04, 0.50];
            component.highlightSettings = highlightSettings;

            component.validOperators = [HighlightComparisonType.BETWEEN];

            component.ngOnInit();

            const expectedScaledVals = ['4.0%', '50.0%'];
            expect(component.comparisonTypeOptions[0].values[0].displayValue).toBe('Between');
            expect(component.comparisonTypeOptions[0].values[0].value).toEqual(11);
            expect(component.isBetweenComparison).toBe(true);
            expect(component.isQuantileComparison).toBe(false);
            expect(component.highlightSettings.comparisonValues[0]).toBe(expectedScaledVals[0]);
            expect(component.highlightSettings.comparisonValues[1]).toBe(expectedScaledVals[1]);
            expect(component.selectedColorType).toBe('cellAndText');
            expect(component.foreGroundColors).toBe(highlightSettings.foreGroundColors);
            expect(component.backGroundColors).toBe(highlightSettings.backGroundColors);
        });
    });

    it('should signal to parent to delete a rule', () => {
        jest.spyOn(component.deleteHighlightRule, 'emit');
        component.deleteRule();
        expect(component.deleteHighlightRule.emit).toHaveBeenCalledTimes(1);
    });

    it('should enable and disable a rule', () => {
        component.updateRuleEnabled({detail: {value: {checked: true}}} as CustomEvent);
        expect(component.highlightSettings.isEnabled).toBe(true);

        component.updateRuleEnabled({detail: {value: {checked: false}}} as CustomEvent);
        expect(component.highlightSettings.isEnabled).toBe(false);
    });

    it('should update the comparison type when option is changed in select', () => {
        const betweenComparison = new ExploreSelectOption(HighlightRuleFactory.getDisplayName(HighlightComparisonType.BETWEEN), HighlightComparisonType.BETWEEN);
        component.updateComparisonType({detail: {value: betweenComparison}} as CustomEvent);
        expect(component.highlightSettings.comparisonType).toBe(HighlightComparisonType.BETWEEN);
        expect(component.isBetweenComparison).toBe(true);
        expect(component.isQuantileComparison).toBe(false);

        const quantileComparison = new ExploreSelectOption(HighlightRuleFactory.getDisplayName(HighlightComparisonType.QUANTILE), HighlightComparisonType.QUANTILE);
        component.updateComparisonType({detail: {value: quantileComparison}} as CustomEvent);
        expect(component.highlightSettings.comparisonType).toBe(HighlightComparisonType.QUANTILE);
        expect(component.isBetweenComparison).toBe(false);
        expect(component.isQuantileComparison).toBe(true);
    });

    it('should update the comparison value as user types', () => {

        const input2 = 'xyz';
        component.updateCompareValue(1, {detail: {value: input2}} as CustomEvent);
        expect(component.highlightSettings.comparisonValues[1]).toBe(input2);

        const input1 = 'abc';
        component.updateCompareValue(0, {detail: {value: input1}} as CustomEvent);
        expect(component.highlightSettings.comparisonValues[0]).toBe(input1);

        const input2Next = 'test';
        component.updateCompareValue(1, {detail: {value: input2Next}} as CustomEvent);
        expect(component.highlightSettings.comparisonValues[1]).toBe(input2Next);
    });

    describe('validateComparisonValue Tests', () => {
        it('should update and format comparison value if it is proper data type', () => {
            jest.spyOn(component.dataFormatter, 'convertToRaw');

            component.highlightSettings.comparisonType = HighlightComparisonType.EQUALS;
            component.highlightSettings.comparisonValues[0] = '55';  // equivalent to 55%
            component.validateComparisonValue(0);
            expect(component.dataFormatter.convertToRaw).toHaveBeenCalledTimes(1);
            expect(component.highlightSettings.comparisonValues[0]).toBe('55');
            expect(component.highlightSettings.comparisonRawValues[0]).toBe(0.55);
        });

        it('should not update comparison value if input is not expected data format', () => {
            jest.spyOn(component.dataFormatter, 'convertToRaw');

            component.highlightSettings.comparisonType = HighlightComparisonType.EQUALS;
            component.highlightSettings.comparisonValues[0] = 'abc';
            component.validateComparisonValue(0);
            expect(component.dataFormatter.convertToRaw).toHaveBeenCalledTimes(1);
            expect(component.highlightSettings.comparisonValues[0]).toBeNull();
            expect(component.highlightSettings.comparisonRawValues[0]).toBeNull();
        });

        it('should not scale comparison value if aggregated type', () => {
            jest.spyOn(component.dataFormatter, 'convertToRaw');

            component.highlightSettings.comparisonType = HighlightComparisonType.TOP;
            component.highlightSettings.comparisonValues[0] = '10';  // equivalent to 55%
            component.validateComparisonValue(0);
            expect(component.dataFormatter.convertToRaw).toHaveBeenCalledTimes(0);
            expect(component.highlightSettings.comparisonValues[0]).toBe('10');
            expect(component.highlightSettings.comparisonRawValues[0]).toBe('10');
        });
    });
    describe('update color type Tests', () => {
        let fgColors;
        let bgColors;
        beforeEach(() => {
             fgColors = ['rgb(123,121,121)', 'rgb(123,121,121)'];
             bgColors = ['rgb(123,122,122)', 'rgb(123,122,122)'];
            component.foreGroundColors = ['rgb(0,0,0)', 'rgb(0,0,0)'];
            component.backGroundColors = ['rgb(211,211,211)', 'rgb(211,211,211)'];
        });
        it('cell only color type', () => {
            const cellOnly = new ExploreSelectOption('cell Only', 'cellOnly');
            component.highlightSettings.foreGroundColors = fgColors;
            component.highlightSettings.backGroundColors = undefined;
            component.updateColorType({detail: {value: cellOnly}} as CustomEvent);
            expect(component.highlightSettings.foreGroundColors).toBeUndefined();
            expect(component.highlightSettings.backGroundColors).toEqual(component.backGroundColors);
            expect(component.foreGroundColors).toEqual(fgColors);
        });
        it('text only color type', () => {
            const textOnly = new ExploreSelectOption('text Only', 'textOnly');
            component.highlightSettings.foreGroundColors = undefined;
            component.highlightSettings.backGroundColors = bgColors;
            component.updateColorType({detail: {value: textOnly}} as CustomEvent);
            expect(component.highlightSettings.backGroundColors).toBeUndefined();
            expect(component.highlightSettings.foreGroundColors).toEqual(component.foreGroundColors);
            expect(component.backGroundColors).toEqual(bgColors);
        });
        it('cellAndText color type', () => {
            const cellText = new ExploreSelectOption('cell and text', 'cellAndText');
            component.highlightSettings.foreGroundColors = undefined;
            component.highlightSettings.backGroundColors = undefined;
            component.updateColorType({detail: {value: cellText}} as CustomEvent);
            expect(component.highlightSettings.foreGroundColors).toEqual(component.foreGroundColors);
            expect(component.highlightSettings.backGroundColors).toEqual(component.backGroundColors);
        });

    });

});
