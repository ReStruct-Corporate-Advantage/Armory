import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ObjectivesSettingsComponent} from './objectives-settings.component';
import {CommonModule} from '@angular/common';
import {UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule} from '@angular/forms';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {getObjectiveSettingsTestData} from '../../constants/test-data.testutils';
import {OptimizationConstants} from '../../../../constants/optimization.constants';
import {PortfolioObjective} from '../../../../models/portfolio/objectives/portfolio-objective.model';
import {StressScenarioPortfolioObjective} from '../../../../models/portfolio/objectives/stress-scenario-portfolio-objective.model';
import {ObjectivesFormItemType} from '../constants/objectives-settings-form-item-types';

describe('ObjectivesSettingsComponent', () => {
    let component: ObjectivesSettingsComponent;
    let fixture: ComponentFixture<ObjectivesSettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [CommonModule, ReactiveFormsModule],
            declarations: [ObjectivesSettingsComponent]
        });

        fixture = TestBed.createComponent(ObjectivesSettingsComponent);
        component = fixture.componentInstance;
        const fb: UntypedFormBuilder = TestBed.inject(UntypedFormBuilder);
        component.objectiveForm = fb.group({
            forms: fb.array([])
        });
        component.objectiveSettings = getObjectiveSettingsTestData();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change objective type', () => {
        expect(component.objectiveSettings.objectivesType).toBe(OptimizationConstants.ACTIVE_OBJECTIVE_TYPE);
        component.onObjectiveTypeChanged({
            detail: {
                value: {label:OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE}
            }
        } as CustomEvent);
        expect(component.objectiveSettings.objectivesType).toBe(OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE);
    });

    test('onAddObjective', () => {
        const countOfPortfolioObjectives: number = component.objectiveSettings.portfolioObjectives.length;
        component.onAddObjective();
        expect(component.objectiveSettings.portfolioObjectives.length).toEqual(countOfPortfolioObjectives + 1);
        expect(component.forms.length).toEqual(countOfPortfolioObjectives + 1);
    });

    test('onEnableAllObjectives', () => {
        expect(areAllItemsChecked()).toEqual(false);
        component.onEnableAllObjectives({
            detail: {
                value: {
                    checked: true
                }
            }
        } as CustomEvent);
        expect(areAllItemsChecked()).toBe(true);
    });

    function areAllItemsChecked() {
        return component.forms.controls.every((control: UntypedFormGroup) => {
            return control.get(ObjectivesFormItemType.ENABLED).value === true;
        });
    }

    it('should removeFromUniverse', () => {
        const countOfPortfolioObjectives: number = component.objectiveSettings.portfolioObjectives.length;
        component.onRemoveObjective(1);
        expect(component.objectiveSettings.portfolioObjectives.length).toEqual(countOfPortfolioObjectives - 1);
        expect(component.forms.length).toEqual(countOfPortfolioObjectives - 1);
    });

    test('onChangeObjective', () => {
        let portfolioObjective: PortfolioObjective = component.objectiveSettings.portfolioObjectives[1];
        expect(portfolioObjective instanceof StressScenarioPortfolioObjective).toEqual(false);
        expect(component.forms.controls[1].get(ObjectivesFormItemType.ENABLE_STRESS_SCENARIO).value).toEqual(false);
        const formControlPatchValue = jest.spyOn(component.forms.controls[1], 'patchValue');
        component.onChangeObjective(1);
        portfolioObjective = component.objectiveSettings.portfolioObjectives[1];
        expect(portfolioObjective instanceof StressScenarioPortfolioObjective).toEqual(true);
        expect(formControlPatchValue).toHaveBeenCalled();
    });
});
