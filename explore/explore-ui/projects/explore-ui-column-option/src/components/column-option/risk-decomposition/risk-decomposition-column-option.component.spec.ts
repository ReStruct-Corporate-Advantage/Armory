import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {RiskDecompositionType} from '../../../enums/risk-decomposition-type.enum';
import {RiskDecompositionColumnOption} from '../../../models/column-option/risk-decomposition-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils/column-option-test-bed.testutil';
import {RiskDecompositionColumnOptionComponent} from './risk-decomposition-column-option.component';

describe('Risk decomposition column options component test', () => {
    let testBed: ColumnOptionTestBed<RiskDecompositionColumnOptionComponent, RiskDecompositionColumnOption>;

    beforeEach(() => {
        const option: any = {
            columnOptionAttributes: [{
                title: 'Risk decomposition',
                key: 'riskDecomposition',
                dataType: 'S',
                values: [
                    {label: 'XSR', value: true},
                    {label: 'XSR_SYS_RESID', value: false}
                ]
            }],
            columnOptionTitle: 'Risk decomposition',
            columnOptionKey: 'riskDecomposition',
            columnOptionConfigType: 'riskDecomposition'
        };

        const riskDecompositionColumnOption: RiskDecompositionColumnOption = new RiskDecompositionColumnOption();
        riskDecompositionColumnOption.initialize(option);

        testBed = new ColumnOptionTestBed<RiskDecompositionColumnOptionComponent, RiskDecompositionColumnOption>(RiskDecompositionColumnOptionComponent, riskDecompositionColumnOption, option);
    });

    it('should have aux-radio-group component', () => {
        const compiled: any = testBed.fixture.debugElement.nativeElement;

        const selectCtrl: any = compiled.querySelector('aux-radio-group');
        expect(selectCtrl).not.toBe(null);
    });

    it('should have decomposition types checked and disabled', () => {
        const component: RiskDecompositionColumnOptionComponent = testBed.component;

        const decompositionTypes: AuxRadioInterface[] = component.decompositionTypes;
        expect(decompositionTypes[0].checked).toBeTruthy();
        expect(decompositionTypes[0].disabled).toBeFalsy();
        expect(decompositionTypes[1].checked).toBeFalsy();
        expect(decompositionTypes[1].disabled).toBeTruthy();
    });

    it('should change option value decomposition type on decomposition type option changes', () => {
        const component: RiskDecompositionColumnOptionComponent = testBed.component;

        let event: any = {detail: {}};
        component.optionValue.decompositionType = RiskDecompositionType.XSR;
        component.onDecompositionTypeOptionChanged(event);
        expect(component.optionValue.decompositionType).toBe(RiskDecompositionType.XSR);

        event = {detail: {value: {eventData: RiskDecompositionType.XSR_SYS_RESID}}};
        component.optionValue.decompositionType = RiskDecompositionType.XSR;
        component.onDecompositionTypeOptionChanged(event);
        expect(component.optionValue.decompositionType).toBe(RiskDecompositionType.XSR_SYS_RESID);
    });
});
