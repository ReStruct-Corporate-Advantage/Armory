import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiversificationScoreFactorSettingsComponent } from './diversification-score-factor-settings.component';
import {RiskSettings} from "../../../../../../projects/explore-ui-risk/src/models/risk-settings/risk-settings.model";
import {
    DiversificationScoreFactorSettings
} from "../../../../models/widget/inputs/chart-settings/diversification-score-factor-settings";
import {
    AuxNumericStepperValueChangedDetailInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from "@blk/aladdin-angular-components";

describe('DiversificationScoreFactorSettingsComponent', () => {
    let component: DiversificationScoreFactorSettingsComponent;
    let fixture: ComponentFixture<DiversificationScoreFactorSettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
          declarations: [DiversificationScoreFactorSettingsComponent]
        });
        fixture = TestBed.createComponent(DiversificationScoreFactorSettingsComponent);
        component = fixture.componentInstance;
        component.widgetConfigInput = {
            inputConfigType: 'diversificationScoreFactorSettings',
            inputName: 'diversificationScoreFactorSettings',
            inputTitle: 'Factor Settings',
        };
        component.inputs = new Map();
        component.inputs.set('diversificationScoreFactorSettings', new DiversificationScoreFactorSettings());
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.availableAdditionalAnalytics.length).toBe(1);
        expect(component.availableAdditionalAnalytics[0].values.length).toBe(4);
        expect(component.widgetInput.numberOfRiskFactors).toBeUndefined();
        expect(component.widgetInput.additionalAnalytics).toBeUndefined();
    });

    describe('test onNumberOfRiskFactorChanged', () => {
        it('test with real number', () => {
            const event = {detail : {value: 7}} as CustomEvent<AuxNumericStepperValueChangedDetailInterface>;
            component.onNumberOfRiskFactorChanged(event);
            expect(component.widgetInput.numberOfRiskFactors).toBe(7);
        });

        it('test with undefined number', () => {
            const event = {detail : {value: undefined}} as CustomEvent<AuxNumericStepperValueChangedDetailInterface>;
            component.onNumberOfRiskFactorChanged(event);
            expect(component.widgetInput.numberOfRiskFactors).toBeUndefined();
        });
    });

    describe('test onAdditionalAnalyticsChanged',  () => {
        it('test with non empty', () => {
            const event = {detail : {value: [{value: 'A'} as AuxSelectOption, {value: 'B'} as AuxSelectOption]}} as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
            component.onAdditionalAnalyticsChanged(event);
            expect(component.widgetInput.additionalAnalytics.length).toBe(2);
        });
        it('test with empty', () => {
            const event = {detail : {value: []}} as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
            component.onAdditionalAnalyticsChanged(event);
            expect(component.widgetInput.additionalAnalytics).toBeUndefined();
        });
    });
});
