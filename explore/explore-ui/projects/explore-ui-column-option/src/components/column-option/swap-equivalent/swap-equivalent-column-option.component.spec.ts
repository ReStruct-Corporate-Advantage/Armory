import {ColumnOptionTestBed} from '../../../test-utils';
import {SwapEquivalentColumnOptionComponent} from './swap-equivalent-column-option.component';
import {SwapEquivalentColumnOption} from '../../../models/column-option/swap-equivalent-column-option.model';

describe('Swap equivalent component', () => {
    let testBed: ColumnOptionTestBed<SwapEquivalentColumnOptionComponent, SwapEquivalentColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Additional Settings',
            columnOptionAttributes: [{
                title: 'Instrument Duration',
                key: 'swapDuration',
                dataType: 'N'
            }],
            columnOptionKey: 'swapEquivalentColumnOptions'
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<SwapEquivalentColumnOptionComponent, SwapEquivalentColumnOption>(SwapEquivalentColumnOptionComponent, new SwapEquivalentColumnOption(), mockedOption);
    });

    it('Validate init of the component', () => {
        // Should have the title defined.
        expect(testBed.component.title).toBe('Instrument Duration');

        // The control should have a aux-numeric-stepper component
        const compiled = testBed.fixture.debugElement.nativeElement;
        expect(compiled.querySelector('aux-numeric-stepper')).not.toBe(null);
    });

    it('When the spinner is changed the value in the model should update', () => {
        const event = new CustomEvent<number>('');
        event.initCustomEvent('', true, true, {value: 5});
        testBed.component.onValueChanged(event);
        expect(testBed.component.optionValue.value).toBe(5);
    });
});
