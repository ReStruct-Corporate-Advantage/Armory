import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {ObjectiveSettings} from '@models/portfolio/objectives/objective.settings.model';
import {AuxCheckboxChangedDetailInterface, AuxRadioGroupChangedDetailInterface, AuxRadioInterface} from '@blk/aladdin-angular-components';
import {OptimizationConstants} from '@constants/optimization.constants';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {DefinitionsStore} from '../../../../stores';
import {Objectives} from '@models/definitions/optimization/objectives.model';
import {StressScenarioPortfolioObjective} from '@models/portfolio/objectives/stress-scenario-portfolio-objective.model';
import {ObjectivesFormItemType} from '../constants/objectives-settings-form-item-types';
import {SubscribableComponent} from '@blk/explore-ui-core';
import {AlphaScorePortfolioObjective} from '@models/portfolio/objectives/alpha-score-portfolio-objective.model';
import {StressScenarioDateRangeObjective} from '@models/portfolio/objectives/stress-scenario-date-range-objective.model';

@Component({
    selector: 'app-objectives-settings',
    templateUrl: './objectives-settings.component.html',
    styleUrls: ['./objectives-settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObjectivesSettingsComponent extends SubscribableComponent implements OnInit {
    @Input() objectiveSettings: ObjectiveSettings;

    displayAssetTypes: AuxRadioInterface[];

    objectiveForm: UntypedFormGroup;

    constructor(private fb: UntypedFormBuilder, private cdRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        const isActive = this.objectiveSettings.objectivesType === OptimizationConstants.ACTIVE_OBJECTIVE_TYPE;

        this.displayAssetTypes = [
            {label: OptimizationConstants.ABSOLUTE_OBJECTIVE_TYPE, checked: !isActive},
            {label: OptimizationConstants.ACTIVE_OBJECTIVE_TYPE, checked: isActive}
        ];

        this.initializeObjectiveForm();
    }

    private initializeObjectiveForm() {
        this.objectiveForm = this.fb.group({
            forms: this.fb.array([])
        });
        this.subscribeToValueChanges();
        this.objectiveSettings.portfolioObjectives.forEach((objective) => {
            this.forms.push(this.createObjectiveForm(objective));
        });
    }
    /**
     * This method is used to subscribe for changes in the reactive form, which enables the communication from child -> parent ->
     * other children components. The selection of a specific objective in the Objective dropdown in one row will
     * decide what all objectives are enabled/disabled in other rows.
     * The selection criteria is defined by the  getRestrictedObjectives method which works as follows:
     * 1. A selected objective and
     * 2. All the restricted objectives corresponding to the selected objective.
     * will be disabled in other objective dropdowns.
     */
    private subscribeToValueChanges() {
        this.objectiveForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: any) => {
            let objectivesToDisable: string[];
            for (let i = 0; i < value.forms.length; i++) {
                objectivesToDisable = [];
                for (let j = 0; j < value.forms.length; j++) {
                    if (i === j) {
                        continue;
                    }
                    objectivesToDisable = [
                        ...objectivesToDisable,
                        ...this.getRestrictedObjectives(value.forms[j][ObjectivesFormItemType.OBJECTIVE])
                    ];
                }
                this.forms.controls[i].get(ObjectivesFormItemType.DISABLED_OBJECTIVES).setValue(objectivesToDisable, {onlySelf: true});
            }
        });
    }

    private getRestrictedObjectives(value: string): string[] {
        if (!value) {
            return [];
        }
        const objectives: Objectives = DefinitionsStore.optimizationObjective.find((objective) => objective.objectiveKey === value);

        const restrictedObjectives: string[] = objectives ? objectives.restrictedObjectives : [];

        return [...restrictedObjectives, value];
    }

    onObjectiveTypeChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>) {
        this.objectiveSettings.objectivesType = event.detail.value.label;
    }

    onAddObjective() {
        const portfolioObjective: PortfolioObjective = new PortfolioObjective();
        this.objectiveSettings.portfolioObjectives.push(portfolioObjective);
        this.forms.push(this.createObjectiveForm(portfolioObjective));
    }

    onEnableAllObjectives(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        for (const control of this.forms.controls) {
            control.get(ObjectivesFormItemType.ENABLED).setValue(event.detail.value.checked, {onlySelf: true});
        }
    }

    onRemoveObjective(index: number) {
        this.forms.removeAt(index);
        this.objectiveSettings.portfolioObjectives.splice(index, 1);
    }

    /**
     * Update forms based on objective
     */
    onObjectiveChanged(index: number, objective: PortfolioObjective, key: string, formItemType: ObjectivesFormItemType): void {
        const isEnable: boolean = this.objectiveSettings.portfolioObjectives[index].enabled;
        objective.key = key;
        this.objectiveSettings.portfolioObjectives.splice(index, 1, objective);
        this.forms.controls[index].patchValue({
            [ObjectivesFormItemType.ENABLED]: isEnable,
            [ObjectivesFormItemType.OBJECTIVE]: objective.key,
            [formItemType]: true,
            [formItemType]: []
        });
        this.cdRef.markForCheck();
    }

    /**
     * on Objective changed
     */
    onChangeObjective(index: number): void {
        this.onObjectiveChanged(index, new StressScenarioPortfolioObjective(this.objectiveSettings.portfolioObjectives[index]), OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO, ObjectivesFormItemType.ENABLE_STRESS_SCENARIO);
    }

    /**
     * on Alpha Score objective selected
     */
    onSelectAlphaScoreObjective(index: number): void {
        this.onObjectiveChanged(index, new AlphaScorePortfolioObjective(this.objectiveSettings.portfolioObjectives[index]), OptimizationConstants.MAXIMIZE_ALPHA_SCORE, ObjectivesFormItemType.ENABLE_ALPHA_SCORE);
    }

    /**
     * on date range stress scenario selected
     */
    onSelectStressScenarioForCustomDateRange(index: number): void {
        this.onObjectiveChanged(index, new StressScenarioDateRangeObjective(this.objectiveSettings.portfolioObjectives[index]), OptimizationConstants.STRESS_SCENARIO_DATE_RANGE, ObjectivesFormItemType.ENABLE_STRESS_SCENARIO_FOR_CUSTOM_DATE_RANGE);
    }

    createObjectiveForm(objective?: PortfolioObjective): UntypedFormGroup {
        return this.fb.group({
            enabled: objective.enabled,
            objective: objective.key,
            enableStressScenarios: objective instanceof StressScenarioPortfolioObjective,
            disabledObjectives: []
        });
    }

    get forms(): UntypedFormArray {
        return this.objectiveForm.controls.forms as UntypedFormArray;
    }
}
