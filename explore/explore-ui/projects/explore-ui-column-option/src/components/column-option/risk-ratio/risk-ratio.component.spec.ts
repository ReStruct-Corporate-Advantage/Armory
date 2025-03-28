import { RiskRatioComponent } from './risk-ratio.component';
import {ColumnOptionTestBed} from '../../../test-utils/column-option-test-bed.testutil';
import {RiskRatioSettings} from '@blk/explore-ui-risk';

describe('RiskRatioComponent', () => {
    let testBed: ColumnOptionTestBed<RiskRatioComponent, RiskRatioSettings>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Risk Ratio settings',
            columnOptionConfigType: 'riskRatioSettings'
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<RiskRatioComponent, RiskRatioSettings>(
            RiskRatioComponent,
            new RiskRatioSettings(),
            mockedOption,
            [],
            'ras_risk_ratio_hvar',
            'PORT'
        );
    });

    it('should have aux-text-input component', () => {
        const compiled = testBed.fixture.debugElement.nativeElement;
        expect(compiled.querySelector('aux-select')).not.toBe(null);
    });

    it('Check that first available denominator should be selected by default', () => {
        const riskRatioComponent: RiskRatioComponent = testBed.component;
        expect(riskRatioComponent.optionValue.denominator).toBe('BENCH');
        expect(riskRatioComponent.availableDenominators[0].values[0].isSelected).toBeTruthy();
    });

    it('When aux-select changes it must change the value of risk settings', () => {
        const event = {detail: {value: {value : 'BENCH'} }};
        testBed.component.onDenominatorChanged(event as CustomEvent);
        expect(testBed.component.optionValue.denominator).toBe('BENCH');
        event.detail.value.value = 'PORT';
        testBed.component.onDenominatorChanged(event as CustomEvent);
        expect(testBed.component.optionValue.denominator).toBe('PORT');
    });
});
