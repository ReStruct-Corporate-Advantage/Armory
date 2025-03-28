import {ColumnOptionFactory, CoreDefinitionStore, CoreTestUtils} from '@blk/explore-ui-core';
import {BookColumnOption} from '../../../models/column-option/book-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils';
import {BookColumnOptionComponent} from './book-column-option.component';

describe('BookColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<BookColumnOptionComponent, BookColumnOption>;
    /**
     * Performs required initialisation before any test is run
     */
    beforeAll(() => {
        CoreTestUtils.initDefinitions();
        ColumnOptionFactory.registerOptionType(BookColumnOption.CONFIG_TYPE, BookColumnOption);
    });

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Book Column Settings',
            columnOptionConfigType: 'bookColumnOptions',
            columnOptionAttributes: [{
                title: 'Book Type'
            }, {
                title: 'Enable BookFX Conversion'
            }]
        };

        // mock data for accounting conventions
        CoreDefinitionStore.accountingConventions = ['GAAP', 'STAT', 'TAX'];

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<BookColumnOptionComponent, BookColumnOption>(BookColumnOptionComponent, new BookColumnOption(), mockedOption, [], 'book_value', 'PORT');
    });

    it('Validate init of the component', () => {
        // Should have the displayTitle defined.
        expect(testBed.component.displayTitle).toBe('Book Type');

        // The control should have a aux-select and aux-checkbox component
        let compiled = testBed.fixture.debugElement.nativeElement;

        // Make sure we get an aux-select control.
        const selectCtrl = compiled.querySelector('aux-select');
        expect(selectCtrl).not.toBe(null);

        // Also ensure that it has 3 elements in it.
        expect(selectCtrl.data[0].values.length).toBe(3);
        // expect(compiled.querySelector('aux-select')).not.toBe(null);

        // Make sure we get an aux-checkbox control.
        expect(compiled.querySelector('aux-checkbox')).not.toBe(null);

        // test to check The control should have only aux-select component
        testBed.component.option.columnOptionAttributes = [{title: 'Book Type', key: 'bookTyoe', dataType: 'S'}];
        testBed.fixture.detectChanges();
        compiled = testBed.fixture.debugElement.nativeElement;
        expect(compiled.querySelector('aux-checkbox')).toBe(null);
    });

    it('should sets the accounting convention to the selected value from dropdown and update Column title', () => {
        const event = {detail: {value: {displayValue: 'STAT'}}};
        testBed.component.column.columnTitle = 'Book Value';
        testBed.component.onDropdownSelectionChanged(event as CustomEvent);
        expect(testBed.component.optionValue.accountingConvention).toEqual('STAT');
        expect(testBed.component.column.columnTitle).toEqual('Book Value (STAT)');
    });

    it('should update the value on Book FX Conversion change', () => {
        testBed.component.optionValue.bookFxConversion = true;
        const event = {detail: {value: {checked: false}}};
        testBed.component.onBookFxConversionChanged(event as CustomEvent);
        expect(testBed.component.optionValue.bookFxConversion).toBe(false);
    });
});
