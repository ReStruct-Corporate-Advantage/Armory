import {CustomTitleColumnOption} from '../../../models/column-option/custom-title-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils';
import {CustomTitleColumnOptionComponent} from './custom-title-column-option.component';
import {ColumnConstants} from '@blk/explore-ui-core';

describe('CustomTitleColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<CustomTitleColumnOptionComponent, CustomTitleColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Column title',
            columnOptionConfigType: 'customColumnTitle'
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<CustomTitleColumnOptionComponent, CustomTitleColumnOption>(
            CustomTitleColumnOptionComponent,
            new CustomTitleColumnOption(),
            mockedOption,
            [],
            'pct_mv',
            'PORT'
        );
    });

    it('should have aux-text-input component', () => {
        const compiled = testBed.fixture.debugElement.nativeElement;
        expect(compiled.querySelector('aux-text-input')).not.toBe(null);

        // test value for unmodified title
        testBed.component.column.columnTitle = 'Market Value %';
        testBed.component.ngOnInit();
        expect(testBed.component.value).toBeUndefined();

        // test value for modified title but the title is not from the customTitle
        testBed.component.column.columnTitle = 'Market Value % 1';
        testBed.component.ngOnInit();
        expect(testBed.component.value).toBeUndefined();

        testBed.component.optionValue.customTitle = 'Market Value % 1';
        testBed.component.ngOnInit();
        expect(testBed.component.value).toEqual('Market Value % 1');
    });

    it('When the text input value is changed the value in the model should update', () => {
        const event = {detail: {value: 'mv'}};
        testBed.component.onColumnTitleValueChanged(event as CustomEvent);
        expect(testBed.component.optionValue.customTitle).toBe('mv');
        expect(testBed.component.value).toBe('mv');
    });


    describe('onColumnTitleValueChanged Test', () => {
        it('should not update columnTitle in column', () => {
            testBed.component.column.columnTitle = 'Market Value %';

            const event: any = {detail: {value: 'custom title'}};
            testBed.component.onColumnTitleValueChanged(event);
            expect(testBed.component.value).toBe('custom title');
            expect((testBed.component.column.optionValues.find(option => option instanceof CustomTitleColumnOption) as CustomTitleColumnOption).customTitle).toBe('custom title');
            expect(testBed.component.column.columnTitle).toBe('Market Value %');
        });
    });

    it('test label', () => {
        testBed.component.colType = undefined;
        testBed.component.ngOnInit();
        expect(testBed.component.label).toBe('Column title');

        testBed.component.colType = 'Constraint';
        testBed.component.ngOnInit();
        expect(testBed.component.label).toBe('Constraint title');

        testBed.component.column.positionColumnType = ColumnConstants.FACTOR_MODEL;
        testBed.component.ngOnInit();
        expect(testBed.component.label).toBe('Factor Name');
    });

    describe('Factor Data Widget Custom Title Column Option Test', () => {
        it('on ngOnInit without customTitle', () => {
            testBed.component.column.positionColumnType = ColumnConstants.FACTOR_MODEL;
            testBed.component.column.columnTitle = 'FX_USD';
            testBed.component.ngOnInit();
            expect(testBed.component.placeholder).toBe('FX_USD');
            expect(testBed.component.value).toBeUndefined();
            expect(testBed.component.label).toBe('Factor Name');
            const compiled = testBed.fixture.debugElement.nativeElement;
            expect(compiled.querySelector('aux-text-input')).not.toBe(null);
        });

        it('test ngOnInit with customTitle', () => {
            testBed.component.column.positionColumnType = ColumnConstants.FACTOR_MODEL;
            testBed.component.column.columnTitle = 'FX_USD';
            testBed.component.optionValue.customTitle = 'Custom Factor Name';
            testBed.component.ngOnInit();
            expect(testBed.component.placeholder).toBe('FX_USD');
            expect(testBed.component.value).toEqual('Custom Factor Name');
            expect(testBed.component.label).toBe('Factor Name');
            expect((testBed.component.column.optionValues.find(option => option instanceof CustomTitleColumnOption) as CustomTitleColumnOption).customTitle).toBe('Custom Factor Name');
        });
    });
});
