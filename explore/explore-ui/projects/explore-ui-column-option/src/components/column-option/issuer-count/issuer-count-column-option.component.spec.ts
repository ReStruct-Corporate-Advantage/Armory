import {ColumnOptionTestBed} from '../../../test-utils';
import {IssuerCountColumnOptionComponent} from './issuer-count-column-option.component';
import {IssuerCountColumnOption} from '../../../models/column-option/issuer-count-column-option.model';

describe('Security description column option component', () => {
    let testBed: ColumnOptionTestBed<IssuerCountColumnOptionComponent, IssuerCountColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionAttributes: [{
                'title': 'Issuer Type',
                'key': 'issuerType',
                'dataType': 'B'
            }],
            columnOptionTitle: 'Additional Settings',
            columnOptionKey: 'issuercountColumnOptions'
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<IssuerCountColumnOptionComponent, IssuerCountColumnOption>(IssuerCountColumnOptionComponent, new IssuerCountColumnOption(), mockedOption);
    });

    it('should have aux-radio-group component', () => {
        const compiled = testBed.fixture.debugElement.nativeElement;

        // Make sure we get an aux-radio-group control.
        const selectCtrl = compiled.querySelector('aux-radio-group');
        expect(selectCtrl).not.toBe(null);
    });

    it('should set selectedValue', () => {
        const newValue = false;

        // Make sure the initial value is the opposite of what we are setting.
        testBed.component.optionValue.value = !newValue;

        // Fire the event.
        const event = {
            detail: {
                    value: {
                        eventData: newValue
                    }
            }
        };
        testBed.component.setSelectedValue(event as CustomEvent);
        expect(testBed.component.optionValue.value).toBe(newValue);
    });
});
