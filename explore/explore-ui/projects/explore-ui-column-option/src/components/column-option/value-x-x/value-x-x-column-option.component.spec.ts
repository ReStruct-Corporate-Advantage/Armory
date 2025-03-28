import {CoreColumnUtils} from '@blk/explore-ui-core';
import {ValueXXColumnOption} from '../../../models/column-option/value-x-x-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils';
import {ValueXXColumnOptionComponent} from './value-x-x-column-option.component';

describe('ValueXXComponent', () => {
    let testBed: ColumnOptionTestBed<ValueXXColumnOptionComponent, ValueXXColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Additional Settings',
            columnOptionAttributes: [{
                title: 'Shock Size (bp)',
                key: 'shockValue',
                defaultValue: {
                    'value': 1,
                    'label': ''
                },
                dataType: 'N'
            }],
            columnOptionConfigType: 'valueXXColumnOptions'
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<ValueXXColumnOptionComponent, ValueXXColumnOption>(ValueXXColumnOptionComponent, new ValueXXColumnOption(), mockedOption);
    });

    it('Validate init of the component', () => {
        // Should have the title defined.
        expect(testBed.component.title).toBe('Shock Size (bp)');

        // The control should have a aux-numeric-stepper component
        const compiled = testBed.fixture.debugElement.nativeElement;
        expect(compiled.querySelector('aux-numeric-stepper')).not.toBe(null);
    });

    it('When the spinner is changed the value in the model should update', () => {
        jest.spyOn(CoreColumnUtils, 'getOriginalColumnTitle').mockReturnValue('CVxx');
        const event = new CustomEvent<number>('');
        event.initCustomEvent('', true, true, {value: 5});
        testBed.component.onValueChanged(event);
        expect(testBed.component.optionValue.value).toBe(5);
        expect(testBed.component.column.columnTitle).toEqual('CV5');
    });
});
