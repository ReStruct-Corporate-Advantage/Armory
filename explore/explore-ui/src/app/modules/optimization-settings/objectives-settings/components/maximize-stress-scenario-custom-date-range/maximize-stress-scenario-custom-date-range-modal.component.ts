import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {DateScenario, DateValue, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import {StressScenarioDateRangeObjective} from '@models/portfolio/objectives/stress-scenario-date-range-objective.model';
import {cloneDeep, isEmpty} from 'lodash';
import {ScenarioTypeEnum, StressScenario} from '@blk/explore-ui-extended-column-option';
import {BehaviorSubject} from 'rxjs';

/**
 * Modal component for upload Alpha
 */
@Component({
    selector: 'app-maximize-stress-scenario-custom-date-range-modal',
    templateUrl: './maximize-stress-scenario-custom-date-range.component.html',
    styleUrls: ['./maximize-stress-scenario-custom-date-range-modal.component.scss']
})
export class MaximizeStressScenarioCustomDateRangeModalComponent implements OnInit {
    @Input() isOpen: boolean;

    @Input() portfolioObjective: PortfolioObjective;

    @Output() modalClosed = new EventEmitter<any>();

    dateRangeScenarios: DateScenario[];

    /**
     * Flag to enable the new Scenarios PRT migration work
     */
    isNewStressScenarioEnabled = false;

    stressScenario: StressScenario;
    validateStressScenario = false;
    isApplyButtonDisabled = {value: 0};
    showSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private changeDetectorRef: ChangeDetectorRef) {}

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        if (this.portfolioObjective instanceof StressScenarioDateRangeObjective && isEmpty(this.portfolioObjective.dateRangeScenarios)) {
            const newScenario = new DateScenario();
            newScenario.fromDate = DateValue.newRelativeDate('T-2');
            newScenario.toDate = DateValue.newRelativeDate('T-1');
            this.portfolioObjective.dateRangeScenarios = [newScenario];
        }
        this.dateRangeScenarios = (this.portfolioObjective as StressScenarioDateRangeObjective).dateRangeScenarios;

        this.isNewStressScenarioEnabled = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_NEW_STRESS_SCENARIOS);

        if (this.isNewStressScenarioEnabled) {
            this.stressScenario = new StressScenario({
                scenType: ScenarioTypeEnum.DATE_RANGE,
            });
            if (this.dateRangeScenarios.length > 0) {
                this.stressScenario.dateScenario = cloneDeep(this.dateRangeScenarios[0]);
            }
        }
    }

    /**
     * Called upon close of modal
     */
    onClosed(isSave: boolean) {
        if (isSave) {
            if (this.isNewStressScenarioEnabled) {
                this.validateStressScenario = true;
                this.isApplyButtonDisabled.value++;
                this.changeDetectorRef.detectChanges();
                return;
            } else {
                (this.portfolioObjective as StressScenarioDateRangeObjective).dateRangeScenarios = this.dateRangeScenarios;
            }
        }
        this.closeModal();
    }

    validateStressScenarioHandler(isValid: boolean): void {
        this.validateStressScenario = false;
        this.isApplyButtonDisabled.value--;
        this.changeDetectorRef.detectChanges();
        if (!isValid) {
            return;
        }
        (this.portfolioObjective as StressScenarioDateRangeObjective).dateRangeScenarios = [ this.stressScenario.dateScenario ];
        this.closeModal();
    }

    private closeModal(): void {
        this.isOpen = false;
        this.modalClosed.emit();
    }
}
