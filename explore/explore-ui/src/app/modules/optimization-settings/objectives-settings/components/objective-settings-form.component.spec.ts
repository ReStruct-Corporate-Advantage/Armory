import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {UntypedFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {ColumnSet, CustomTitleColumnOption} from '@blk/explore-ui-column-option';
import {ColumnConfig, CoreDefinitionStore, NamedScenario, WidgetInput} from '@blk/explore-ui-core';
import {Objectives} from '@models/definitions/optimization/objectives.model';
import {AlphaScorePortfolioObjective} from '@models/portfolio/objectives/alpha-score-portfolio-objective.model';
import {OptimizationConstants} from '@constants/optimization.constants';
import {DefinitionsStore} from '../../../../stores';
import {getPortfolioObjectiveTestData, getStressPortfolioObjectiveTestData} from '../../constants/test-data.testutils';

import {ObjectiveSettingsFormComponent} from './objective-settings-form.component';
import {
    ConstraintOptionValueUpdate
} from "@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update";
import {StressScenarioPortfolioObjective} from "@models/portfolio/objectives/stress-scenario-portfolio-objective.model";

describe('ObjectiveSettingsFormComponent', () => {
    let component: ObjectiveSettingsFormComponent;
    let fixture: ComponentFixture<ObjectiveSettingsFormComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [ReactiveFormsModule],
            declarations: [ObjectiveSettingsFormComponent]
        });

        fixture = TestBed.createComponent(ObjectiveSettingsFormComponent);
        component = fixture.componentInstance;
        component.index = 1;
        const fb: UntypedFormBuilder = TestBed.inject(UntypedFormBuilder);
        component.portfolioObjective = getPortfolioObjectiveTestData();
        component.formGroup = fb.group({
            enabled: true,
            objective: component.portfolioObjective.key,
            enableStressScenarios: false,
            disabledObjectives: []
        });
        DefinitionsStore.optimizationObjective = [
            new Objectives({
                objectiveKey: 'key',
                objectiveDisplayValue: 'val'
            })
        ];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update columnDisplayName on init', () => {
        const spyForColumnNameUpdate = jest.spyOn(component, 'initializeColumnDisplayName');
        component.ngOnInit();
        expect(spyForColumnNameUpdate).toHaveBeenCalled();
    });

    it('should enable objective', () => {
        expect(component.portfolioObjective.enabled).toEqual(true);
        component.onEnableObjective({
            detail: {
                value: {
                    checked: false
                }
            }
        } as CustomEvent);
        expect(component.portfolioObjective.enabled).toEqual(false);
    });

    it('onObjectiveWeightChange', () => {
        expect(component.portfolioObjective.weight).toEqual(0.5);
        component.onObjectiveWeightChange({
            detail: {value: '1'}
        } as CustomEvent);
        expect(component.portfolioObjective.weight).toEqual(1);
    });

    it('onObjectiveWeightChange-negativeValue', () => {
        component.onObjectiveWeightChange({
            detail: {value: '-1'}
        } as CustomEvent);
        expect(component.portfolioObjective.weight).toEqual(0.5);
    });

    it('onChangeObjective Select none', () => {
        expect(component.portfolioObjective.key).toEqual('TestKey');
        component.onObjectiveChange({} as CustomEvent);
        expect(component.portfolioObjective.key).toEqual('');
    });

    it('onChangeObjective already selected value click', () => {
        expect(component.portfolioObjective.key).toEqual('TestKey');
        const spyOnFormSetValue = jest.spyOn(component.formGroup, 'setValue');
        component.onObjectiveChange({
            detail: {
                value: {
                    value: 'TestKey'
                }
            }
        } as CustomEvent);
        expect(component.portfolioObjective.key).toEqual('TestKey');
        expect(spyOnFormSetValue).toHaveBeenCalledTimes(0);
    });

    it('onChangeObjective on Stress scenario', () => {
        const spyForEmit = jest.spyOn(component.selectStressObjective, 'emit');
        component.onObjectiveChange({
            detail: {
                value: {
                    value: OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO
                }
            }
        } as CustomEvent);
        expect(spyForEmit).toHaveBeenCalledWith(1);
    });

    it('onChangeObjective on Alpha score', () => {
        const spyForEmit = jest.spyOn(component.selectAlphaScoreObjective, 'emit');
        component.onObjectiveChange({
            detail: {
                value: {
                    value: OptimizationConstants.MAXIMIZE_ALPHA_SCORE
                }
            }
        } as CustomEvent);
        expect(spyForEmit).toHaveBeenCalledWith(1);
    });

    it('onUpdateStressScenario', () => {
        component.portfolioObjective = getStressPortfolioObjectiveTestData();
        component.onUpdateStressScenario({
            value: 'TestScenario'
        } as ConstraintOptionValueUpdate<string>);
        expect((component.portfolioObjective as StressScenarioPortfolioObjective).stressScenario).toEqual('TestScenario');
    });

    it('should disable on form group disable all', () => {
        expect(component.portfolioObjective.enabled).toEqual(true);
        component.formGroup.patchValue({enabled: false});
        expect(component.portfolioObjective.enabled).toEqual(false);
    });

    it('test getAlphaScoreButtonTitle', () => {
        expect(component.getAlphaScoreButtonTitle()).toEqual(OptimizationConstants.ALPHA_SCORE_BUTTON_TITLE);
        const measure: ColumnConfig = new ColumnConfig({columnTag: 'xy', optionValues: []});
        measure.columnTitle = 'x';
        component.objectiveMeasures.push(measure);
        expect(component.getAlphaScoreButtonTitle()).toEqual('x');
        measure.optionValues.push(new CustomTitleColumnOption({customTitle: 'xyz'}));
        expect(component.getAlphaScoreButtonTitle()).toEqual('xyz');
    });

    it('test getUploadAlphaTitle', () => {
        const alphaConstraint = new AlphaScorePortfolioObjective();
        component.portfolioObjective = alphaConstraint;
        expect(component.getUploadAlphaTitle()).toEqual('Upload Alpha');
        alphaConstraint.uploadedAlpha.set('abc', 2.0);
        expect(component.getUploadAlphaTitle()).toEqual('Edit Alpha');
    });

    it('test onUploadAlphaModalClosed', () => {
        component.portfolioObjective = new AlphaScorePortfolioObjective();
        component.objectiveMeasures = [new ColumnConfig({columnTitle: 'x', columnTag: 'x'})];
        component.onUploadAlphaModalClosed();
        expect(component.objectiveMeasures.length).toBe(0);
        expect(component.showUploadList).toBeFalsy();
    });

    it('test openUploadAlphaModal', () => {
        component.showUploadList = false;
        component.openUploadAlphaModal();
        expect(component.showUploadList).toBeTruthy();
    });

    it('test checkIfAlphaIsUploaded', () => {
        component.portfolioObjective = new AlphaScorePortfolioObjective();
        (component.portfolioObjective as AlphaScorePortfolioObjective).uploadedAlpha = new Map<string, number>();
        (component.portfolioObjective as AlphaScorePortfolioObjective).uploadedAlpha.set('abcd', 5);
        expect(component.checkIfAlphaIsUploaded()).toBeTruthy();
    });

    it('test onCloseOfObjectiveMeasuresModal', () => {
        component.onCloseOfObjectiveMeasuresModal(undefined);
        expect(component.showObjectiveMeasures).toBeFalsy();
        component.portfolioObjective = new AlphaScorePortfolioObjective();
        const widgetInputs = new Map<string, WidgetInput>();
        const columnSet = new ColumnSet();
        const measure: ColumnConfig = new ColumnConfig({columnTag: 'xy'});
        columnSet.columns.push(measure);
        widgetInputs.set('columns', columnSet);
        component.onCloseOfObjectiveMeasuresModal(widgetInputs);
        expect((component.portfolioObjective as AlphaScorePortfolioObjective).alphaScoreMeasure).toEqual(measure);
    });
});
