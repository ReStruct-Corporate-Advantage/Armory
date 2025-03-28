import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {
    AuxCheckboxChangedDetailInterface,
    AuxSelectOption,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface,
    Validator
} from '@blk/aladdin-angular-components';
import {UntypedFormGroup} from '@angular/forms';
import {StressScenarioPortfolioObjective} from '@models/portfolio/objectives/stress-scenario-portfolio-objective.model';
import {DefinitionsStore} from '../../../../stores';
import {OptimizationConstants} from '@constants/optimization.constants';
import {ObjectivesFormItemType} from '../constants/objectives-settings-form-item-types';
import get from 'lodash/get';
import {ColumnConfig, SubscribableComponent, WidgetInput} from '@blk/explore-ui-core';
import {isEmpty, isNil} from 'lodash';
import {ColumnOptionUtils, ColumnSet} from '@blk/explore-ui-column-option';
import {AlphaScorePortfolioObjective} from '@models/portfolio/objectives/alpha-score-portfolio-objective.model';
import {NumberUtils} from '@utils/number.utils';
import {CommonConstants} from '@constants/common.constants';
import {CompositionConstants} from '@constants/composition.constants';
import {
    ConstraintOptionValueUpdate
} from "@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update";

@Component({
    selector: 'app-objective-settings-form',
    templateUrl: './objective-settings-form.component.html',
    styleUrls: ['./objective-settings-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObjectiveSettingsFormComponent extends SubscribableComponent implements OnInit {
    @Input() portfolioObjective: PortfolioObjective;

    @Input() isRiskParity = false;

    @Output() removeItem = new EventEmitter<number>();

    @Output() selectStressObjective = new EventEmitter<number>();

    @Output() selectStressObjectiveForCustomDate = new EventEmitter<number>();

    @Output() selectAlphaScoreObjective = new EventEmitter<number>();

    @Input() formGroup: UntypedFormGroup;

    @Input() index: number;

    allAvailableObjectives: AuxSelectOptionGroup[];

    completeColumnTitle: string;

    showObjectiveMeasures = false;

    showUploadList = false;

    customDateRangeModalOpen = false;

    objectiveMeasures: ColumnConfig[] = [];

    validator: Validator[];

    readonly maximizeAlphaStressScenario: string = OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO;

    readonly maximizeAlphaScore: string = OptimizationConstants.MAXIMIZE_ALPHA_SCORE;

    readonly maximizeStressScenarioDateRange: string = OptimizationConstants.STRESS_SCENARIO_DATE_RANGE;

    constructor(private cdRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.allAvailableObjectives = [
            {
                values: DefinitionsStore.optimizationObjective.filter(objectives => this.isRiskParity ? CompositionConstants.RISK_PARITY_OBJECTIVES.has(objectives.objectiveKey) : true)
                    .map((objectives) => ({
                        value: objectives.objectiveKey,
                        displayValue: this.isRiskParity ? CompositionConstants.RISK_PARITY_OBJECTIVES.get(objectives.objectiveKey) : objectives.objectiveDisplayValue,
                        isDisabled: this.isDisabled(objectives.objectiveKey),
                        isSelected: this.portfolioObjective.key === objectives.objectiveKey
                    }))
            }
        ];

        if (this.portfolioObjective instanceof AlphaScorePortfolioObjective && this.portfolioObjective.alphaScoreMeasure) {
            this.objectiveMeasures.push(this.portfolioObjective.alphaScoreMeasure);
        }

        this.formGroup
            .get(ObjectivesFormItemType.ENABLED)
            .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((value: boolean) => {
                this.portfolioObjective.enabled = value;
                this.cdRef.markForCheck();
            });

        this.formGroup
            .get(ObjectivesFormItemType.DISABLED_OBJECTIVES)
            .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((restrictedObjectives: string[]) => {
                this.allAvailableObjectives = [
                    {
                        values: [
                            ...this.allAvailableObjectives[0].values.map((selectOption: AuxSelectOption) => ({
                                value: selectOption.value,
                                displayValue: selectOption.displayValue,
                                isSelected: selectOption.isSelected,
                                isDisabled: restrictedObjectives.includes(selectOption.value)
                            }))
                        ]
                    }
                ];
                this.cdRef.markForCheck();
            });

        this.validator = [{
            validate: (value: string) => {
                return this.checkIfValidObjectiveWeight(value);
            },
            errorMessage: CommonConstants.INVALID_INPUT
        }];
        this.initializeColumnDisplayName();
    }

    /**
     * Initialize column display name to be showed on UI
     */
    initializeColumnDisplayName(): void {
        this.completeColumnTitle = this.objectiveMeasures?.[0]?.columnTitle;
        if (!isEmpty(this.objectiveMeasures)) {
            const customColumnTitle = ColumnOptionUtils.getCustomTitle(this.objectiveMeasures[0]);
            this.completeColumnTitle = !isEmpty(customColumnTitle) ? customColumnTitle : this.objectiveMeasures[0].columnTitle;
        }
    }

    private isDisabled(objectiveKey: string): boolean {
        const restrictedObjectives: string[] = this.formGroup.get(ObjectivesFormItemType.DISABLED_OBJECTIVES).value;
        return !!restrictedObjectives && restrictedObjectives.includes(objectiveKey);
    }

    onEnableObjective(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.portfolioObjective.enabled = event.detail.value.checked;
    }

    onObjectiveWeightChange(event: CustomEvent<AuxTextInputValueChangedDetailInterface>) {
        if (this.checkIfValidObjectiveWeight(event.detail.value)) {
            this.portfolioObjective.weight = Number(event.detail.value);
        }
    }

    onObjectiveChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        const value = get(event, 'detail.value') ? (event.detail.value as AuxSelectOption).value : '';
        if (value === this.portfolioObjective.key) {
            return;
        }
        if (value === OptimizationConstants.MAXIMIZE_ALPHA_STRESS_SCENARIO) {
            this.selectStressObjective.emit(this.index);
        } else if (value === OptimizationConstants.MAXIMIZE_ALPHA_SCORE) {
            this.selectAlphaScoreObjective.emit(this.index);
        } else if (value === this.maximizeStressScenarioDateRange) {
            this.selectStressObjectiveForCustomDate.emit(this.index);
        } else {
            this.portfolioObjective.key = value;
            this.formGroup.get(ObjectivesFormItemType.OBJECTIVE).setValue(value);
        }
    }

    public onUpdateStressScenario(event: ConstraintOptionValueUpdate<string>) {
        if (this.portfolioObjective instanceof StressScenarioPortfolioObjective) {
            this.portfolioObjective.stressScenario = event.value;
        }
    }

    onRemoveObjective() {
        this.removeItem.emit(this.index);
    }

    /**
     * Sets isOpen boolean to true
     */
    openObjectiveMeasuresModel(): void {
        this.showObjectiveMeasures = true;
    }

    openUploadAlphaModal(): void {
        this.showUploadList = !this.showUploadList;
    }

    /**
     * Sets customDateRangeModalOpen boolean to true
     */
    openCustomDateRangeModal(): void {
        this.customDateRangeModalOpen = true;
    }

    onUploadAlphaModalClosed() {
        if (this.portfolioObjective instanceof AlphaScorePortfolioObjective && isNil(this.portfolioObjective.alphaScoreMeasure)) {
            this.objectiveMeasures = [];
        }
        this.showUploadList = false;
    }

    /**
     * Sets customDateRangeModalOpen boolean to false
     */
    onEditDateRangeScenariosModalClosed() {
        this.customDateRangeModalOpen = false;
    }

    getUploadAlphaTitle() {
        return isEmpty((this.portfolioObjective as AlphaScorePortfolioObjective).uploadedAlpha) ? 'Upload Alpha' : 'Edit Alpha';
    }

    /**
     * Resets isOpen boolean and updates column measures
     */
    onCloseOfObjectiveMeasuresModal(inputs: Map<string, WidgetInput> | undefined): void {
        if (!isNil(inputs)) {
            this.objectiveMeasures = (Array.from(inputs.values())[0] as ColumnSet).columns;
            if (this.portfolioObjective instanceof AlphaScorePortfolioObjective && !isEmpty(this.objectiveMeasures)) {
                this.portfolioObjective.alphaScoreMeasure = this.objectiveMeasures[0];
                // Clear upload alpha details.
                this.portfolioObjective.isUploadAlpha = false;
                this.portfolioObjective.uploadedAlpha.clear();
            }
        }
        this.initializeColumnDisplayName();

        this.showObjectiveMeasures = false;
    }

    /**
     * Returns true if alpha is uploaded
     */
    checkIfAlphaIsUploaded(): boolean {
        return !isEmpty((this.portfolioObjective as AlphaScorePortfolioObjective).uploadedAlpha);
    }

    /**
     * Returns the title of the button for the description of added column
     */
    getAlphaScoreButtonTitle(): string {
        // if we don't have any added column, return 'Add Column' else get custom title or column title
        if (isEmpty(this.objectiveMeasures)) {
            return OptimizationConstants.ALPHA_SCORE_BUTTON_TITLE;
        }
        const customTitle = ColumnOptionUtils.getCustomTitle(this.objectiveMeasures[0]);
        return !isEmpty(customTitle) ? customTitle : this.objectiveMeasures[0].columnTitle;
    }

    private checkIfValidObjectiveWeight(value: string): boolean {
        const isValid = NumberUtils.validateIfStringIsNumber(value);
        return this.portfolioObjective.key === OptimizationConstants.MAXIMIZE_ALPHA_SCORE ? isValid : isValid && !value.startsWith(CommonConstants.DASH);
    }
}
