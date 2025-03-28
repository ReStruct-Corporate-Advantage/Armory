import {ResearchAdditionalDisplayColumnOption} from '../../../models/column-option/research-additional-display-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils';
import {ResearchAdditionalDisplayColumnOptionComponent} from './research-additional-display-column-option.component';

describe('ResearchAdditionalDisplayColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<ResearchAdditionalDisplayColumnOptionComponent, ResearchAdditionalDisplayColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Additional Settings',
            columnOptionAttributes: [{
                title: 'Display',
                key: 'showMembership',
                defaultValue: {
                    value: false
                }
            }
            ],
            columnOptionConfigType: 'researchAdditionalDisplayOption'
        };
        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<ResearchAdditionalDisplayColumnOptionComponent, ResearchAdditionalDisplayColumnOption>(ResearchAdditionalDisplayColumnOptionComponent, new ResearchAdditionalDisplayColumnOption(), mockedOption);
    });

    it('should have aux-radio-group component', () => {
        const compiled = testBed.fixture.debugElement.nativeElement;

        // Make sure we get an aux-radio-group control.
        const selectCtrl = compiled.querySelector('aux-radio-group');
        expect(selectCtrl).not.toBe(null);
    });

    it('should set selectedValue', () => {
        testBed.component.optionValue.showMembership = false;
        testBed.component.displayOptions = [
            {label: 'Full List Name', checked: false, disabled: false},
            {label: 'Membership', checked: true, disabled: false}
        ];
        testBed.component.setSelectedValue();
        expect(testBed.component.optionValue.showMembership).toBeTruthy();
    });
});
