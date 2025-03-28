import {CustomCalculationConstants} from '../../../constants';
import {CustomCalculationMeasureNodeColumnOption} from '../../../models/column-option/custom-calculation-measure-node-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils/column-option-test-bed.testutil';
import {CustomCalculationMeasureNodeColumnOptionComponent} from './custom-calculation-measure-node-column-option.component';

describe('CustomCalculationMeasureNodeComponent', () => {
    let testBed: ColumnOptionTestBed<CustomCalculationMeasureNodeColumnOptionComponent, CustomCalculationMeasureNodeColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionKey: 'customCalculationNodeType',
            columnOptionTitle: 'Custom Calculation Measure Node',
            columnOptionConfigType: 'customCalculationNodeType',
            columnOptionAttributes: [{
                title: 'Type'
            }]
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<CustomCalculationMeasureNodeColumnOptionComponent, CustomCalculationMeasureNodeColumnOption>(CustomCalculationMeasureNodeColumnOptionComponent, new CustomCalculationMeasureNodeColumnOption({measureNode: CustomCalculationConstants.SECURITY}), mockedOption);
    });

    it('should have aux-select component', () => {
        const compiled = testBed.fixture.debugElement.nativeElement;
        expect(compiled.querySelector('aux-select')).not.toBe(null);
    });
});
