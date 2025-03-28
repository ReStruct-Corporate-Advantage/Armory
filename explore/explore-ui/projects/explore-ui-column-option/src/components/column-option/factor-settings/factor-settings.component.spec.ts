import { TestBed } from '@angular/core/testing';

import { FactorSettingsComponent } from './factor-settings.component';
import {ColumnOptionTestBed} from '../../../test-utils';
import {FactorSettingsColumnOption} from '../../../models/column-option/factor-settings-column-option.model';
import {
    AuxNumericStepperValueChangedDetailInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';

describe('FactorSettingsComponent', () => {
    let testBed: ColumnOptionTestBed<FactorSettingsComponent, FactorSettingsColumnOption>

    beforeEach(() => {
        const optionValues = new FactorSettingsColumnOption();
        testBed = new ColumnOptionTestBed<FactorSettingsComponent, FactorSettingsColumnOption>(FactorSettingsComponent, optionValues, {})
    });

    it('should create', () => {
        expect(testBed.component).toBeTruthy();
        expect(testBed.component.optionValue.numberOfRiskFactors).toBeUndefined();
        expect(testBed.component.optionValue.additionalAnalytics).toBeUndefined();
    });

    describe('test onNumberOfRiskFactorChanged', () => {
        it('null value', () => {
            testBed.component.onNumberOfRiskFactorChanged({detail: {value: null}} as CustomEvent<AuxNumericStepperValueChangedDetailInterface>)
            expect(testBed.component.optionValue.numberOfRiskFactors).toBeUndefined();
        });
        it('Some value', () => {
            testBed.component.onNumberOfRiskFactorChanged({detail: {value: 3}} as CustomEvent<AuxNumericStepperValueChangedDetailInterface>)
            expect(testBed.component.optionValue.numberOfRiskFactors).toBe(3);
        });
    });

    describe('test onAdditionalAnalyticsChanged', () => {
        it('No value', () => {
            const optionValue = [] as AuxSelectOption[];
            testBed.component.onAdditionalAnalyticsChanged({detail: {value: optionValue}} as CustomEvent<AuxSelectSelectionChangedDetailInterface>)
            expect(testBed.component.optionValue.additionalAnalytics).toBeUndefined();
        });
        it('Some value', () => {
            const optionValue = [{value: 'R-Factor'}] as AuxSelectOption[];
            testBed.component.onAdditionalAnalyticsChanged({detail: {value: optionValue}} as CustomEvent<AuxSelectSelectionChangedDetailInterface>)
            expect(testBed.component.optionValue.additionalAnalytics).toStrictEqual(['R-Factor']);
        });
    });
});
