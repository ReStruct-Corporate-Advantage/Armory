import {ActiveCalculationColumnOption} from '../../../models/column-option/active-calculation-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils/column-option-test-bed.testutil';
import {ActiveCalculationColumnOptionComponent} from './active-calculation-column-option.component';

describe('ActiveCalculationComponent', () => {
    let testBed: ColumnOptionTestBed<ActiveCalculationColumnOptionComponent, ActiveCalculationColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Active Calculation',
            columnOptionConfigType: 'activeCalculationColumnOption',
            columnOptionAttributes: [{
                title: 'Type'
            }]
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<ActiveCalculationColumnOptionComponent, ActiveCalculationColumnOption>(ActiveCalculationColumnOptionComponent, new ActiveCalculationColumnOption(), mockedOption);
    });

    it('should have aux-select component', () => {
        const compiled = testBed.fixture.debugElement.nativeElement;
        expect(compiled.querySelector('aux-select')).not.toBe(null);
    });

    it('should set selectedValue', () => {
        const TYPE = 'RATIO_2TO1';
        testBed.component.setSelectedValue({
            value: TYPE,
            displayValue: 'Portfolio / Benchmark'
        });
        expect(testBed.component.optionValue.activeType).toBe(TYPE);
    });
});
