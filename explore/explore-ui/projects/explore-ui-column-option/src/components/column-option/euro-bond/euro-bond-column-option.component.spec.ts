import {ColumnOptionTestBed} from '../../../test-utils';
import {EuroBondColumnOptionComponent} from './euro-bond-column-option.component';
import {EuroBondColumnOption} from '../../../models/column-option/euro-bond-column-option.model';

describe('EuroBondColumnOptionsComponent', () => {
    let testBed: ColumnOptionTestBed<EuroBondColumnOptionComponent, EuroBondColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Additional Settings',
            columnOptionAttributes: [
                {
                    key: 'useDurationForEuroGovtBonds',
                    title: 'Use duration for EUR denominated government bonds'
                }
            ],
            columnOptionConfigType: 'DurationForEuroBond'
        };
        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<EuroBondColumnOptionComponent, EuroBondColumnOption>(
            EuroBondColumnOptionComponent,
            new EuroBondColumnOption(),
            mockedOption
        );
    });

    it('Validate init of the component', () => {
        // Should have the title defined.
        expect(testBed.component.useDurationForEurGovBondTitle).toBe('Use duration for EUR denominated government bonds');

        // The control should have an aux-checkbox component
        const compiled = testBed.fixture.debugElement.nativeElement;
        expect(compiled.querySelector('aux-checkbox')).not.toBe(null);
    });

    it('should update checkbox value', () => {
        testBed.component.optionValue.useDurationForEuroGovtBonds = false;
        const event = {detail: {value: {checked: true}}};
        testBed.component.updateEuroBondColumnOptionsCheckbox(event as CustomEvent);
        expect(testBed.component.optionValue.useDurationForEuroGovtBonds).toBeTruthy();
    });
});
