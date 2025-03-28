import {ChangeDetectorRef, Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {StressScenario} from '../../../../models/stress-scenario.model';
import {ScenarioColumnOption} from '@blk/explore-ui-column-option';
import {StressScenarioService} from '../../../../services/stress-scenario.service';
import {BehaviorSubject, finalize, takeUntil} from 'rxjs';
import {ColumnConfig, NamedScenario, NOTIFICATION_SERVICE_TOKEN, NotificationServiceInterface, SubscribableComponent} from '@blk/explore-ui-core';
import {ScenarioConstants} from '../../../../constants/scenario.constant';
import {ScenarioResponse} from '../../../../interfaces/scenario-response.interface';
import {ScenarioUtils} from '../../../../utils/scenario.utils';
import {cloneDeep} from 'lodash';
import {ScenarioCategoryEnum} from '../../../../enums/scenario-category.enum';
import {ScenarioTypeEnum} from '../../../../enums/scenario-type.enum';

/**
 * This component shows a summary list of selected scenarios and shows control buttons to manage scenarios individually or all at once.
 */
@Component({
    selector: 'explore-extended-column-option-stress-scenarios',
    templateUrl: './stress-scenario.component.html',
    styleUrls: ['./stress-scenario.component.scss']
})
export class StressScenarioComponent extends SubscribableComponent implements OnInit {

    constructor(private stressScenarioService: StressScenarioService, @Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationServiceInterface, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    isOpenAddScenarios = false;
    isOpenEditScenarioModal = false;

    @Input()
    column: ColumnConfig;
    @Input()
    optionValue: ScenarioColumnOption;
    @Input()
    allowNamedScenarioSingleSelection: boolean;
    @Input()
    showSpinnerOnScenarioColumnOption$: BehaviorSubject<boolean>;
    @Input()
    isScenarioCreationDisabled: boolean;
    @Input()
    disableCreateScenarioButton: boolean;

    showSpinnerOnAddScenarioModal$ = new BehaviorSubject<boolean>(false);
    selectedScenario: StressScenario;
    updatedOptionValue: ScenarioColumnOption;

    ngOnInit() {
        this.setScenarioCategories();
    }

    private setScenarioCategories(): void {
        const nameScenarios = this.optionValue.nameScenarios;

        if (nameScenarios.length === 0) {
            return;
        }

        this.showSpinnerOnScenarioColumnOption$.next(true);

        const scenarioCodes: string[] = nameScenarios.map(nameScenario => nameScenario.code);

        this.stressScenarioService.fetchScenarioCategories$(scenarioCodes)
            .pipe(
                takeUntil(this.ngUnsubscribe),
                finalize(() => {
                    this.showSpinnerOnScenarioColumnOption$.next(false);
                })
            )
            .subscribe({
                next: (scenarioCodeToCategoryMap: any) => {
                    nameScenarios.forEach(nameScenario => {
                        nameScenario.category = scenarioCodeToCategoryMap[nameScenario.code];
                    });
                },
                error: (err) => {
                    this.notificationService?.error(err);
                },
            });
    }

    openAddStressScenariosModal(): void {
        this.isOpenAddScenarios = true;
    }

    closeAddStressScenariosModal(): void {
        this.isOpenAddScenarios = false;
    }

    /**
     * Opens the CreateEditScenarioModal for editing a scenario
     * when Edit Pencil button is clicked on scenario from selected scenarios summary
     */
    openEditStressScenarioModal(scenarioIdx: number): void {
        this.updatedOptionValue = cloneDeep(this.optionValue);
        const namedScenario = this.updatedOptionValue.nameScenarios[scenarioIdx];
        this.editScenarioHandler(namedScenario, this.showSpinnerOnScenarioColumnOption$);
    }

    /**
     * Opens the CreateEditScenarioModal for editing a scenario
     * when Edit Scenario or Create Scenario is clicked from Manage Scenario Screen
     */
    onCreateOrEditScenarioModalFromManageScenarios(params: ScenarioResponse): void {
        this.updatedOptionValue = cloneDeep(this.optionValue);
        if (params) {
            // Edit Scenario
            const namedScenario = ScenarioUtils.createNamedScenarioFromScenarioResponse(params);
            this.editScenarioHandler(namedScenario, this.showSpinnerOnAddScenarioModal$);
        } else {
            // If disabled allow only date range scenarios to be created
            const scenarioType =  this.isScenarioCreationDisabled ? ScenarioTypeEnum.DATE_RANGE : ScenarioTypeEnum.IMPLIED_SHOCK;

            // Create Scenario
            this.selectedScenario = new StressScenario({scenType: scenarioType});

            this.closeAddStressScenariosModal();
            this.isOpenEditScenarioModal = true;
        }
    }

    /**
     * when CreateEditScenarioModal is closed, update the scenario optionValue
     */
    onCreateEditScenarioModalClosed(scenarioSaved: boolean): void {
        if (scenarioSaved === true) {
            if (this.selectedScenario.scenType !== ScenarioTypeEnum.DATE_RANGE) {
                const newScenario = ScenarioUtils.createNamedScenarioFromStressScenario(this.selectedScenario);
                const scenarioIdx = this.updatedOptionValue.nameScenarios.findIndex(value => value.code === newScenario.code);
                // Add the scenario only if it is not already present
                if (scenarioIdx === -1) {
                    this.updatedOptionValue.nameScenarios.push(newScenario);
                } else {
                    this.updatedOptionValue.nameScenarios[scenarioIdx] = newScenario;
                }
                this.optionValue.refreshRequired = true;
            } else {
                const dateScenario = this.selectedScenario.dateScenario;
                this.updatedOptionValue.dateScenarios.push(dateScenario);
            }
            this.optionValue.nameScenarios = [ ...this.updatedOptionValue.nameScenarios ];
            this.optionValue.dateScenarios = [ ...this.updatedOptionValue.dateScenarios ];
        }
        this.isOpenEditScenarioModal = false;
    }

    deleteNamedScenario(scenarioIdx: number): void {
        this.optionValue.nameScenarios.splice(scenarioIdx, 1);
    }

    /**
     * this method makes call to fetch the selected scenario and opens the CreateEditScenarioModal
     */
    private editScenarioHandler(namedScenario: NamedScenario, isLoading$: BehaviorSubject<boolean>): void {
        const params = {
            scenName: ScenarioUtils.getNamedScenarioName(namedScenario),
            scenPurpose: ScenarioUtils.getNamedScenarioPurpose(namedScenario),
            scenCategory: namedScenario.category,
        };

        isLoading$.next(true);

        this.stressScenarioService.fetchScenario$(params)
            .pipe(
                takeUntil(this.ngUnsubscribe),
                finalize(() => {
                    isLoading$.next(false);
                    this.changeDetectorRef.markForCheck();
                })
            )
            .subscribe({
                next: (scenario: StressScenario) => {
                    if (scenario === null) {
                        this.showFetchScenarioError();
                        return;
                    }
                    this.selectedScenario = scenario;
                    this.selectedScenario.scenDesc = namedScenario.description;
                    this.selectedScenario.scenCode = namedScenario.code;
                    this.selectedScenario.scenCategory = namedScenario.category as ScenarioCategoryEnum;
                    this.closeAddStressScenariosModal();
                    this.isOpenEditScenarioModal = true;
                },
                error: () => {
                    this.showFetchScenarioError();
                },
            });
    }

    private showFetchScenarioError(): void {
        this.notificationService?.error(ScenarioConstants.ERROR_WHILE_FETCHING_SCENARIO);
    }

    /**
     * Opens the CreateEditScenarioModal for editing date range scenario
     * when Edit Pencil button is clicked on scenario from selected scenarios summary
     */
    openEditStressScenarioModalForDateRange(scenarioIdx: number): void {
        this.updatedOptionValue = cloneDeep(this.optionValue);
        const dateScenario = this.updatedOptionValue.dateScenarios[scenarioIdx];
        this.updatedOptionValue.dateScenarios.splice(scenarioIdx, 1);
        this.selectedScenario = new StressScenario({
            scenName: dateScenario.name,
            scenType: ScenarioTypeEnum.DATE_RANGE
        });
        this.selectedScenario.dateScenario = dateScenario;
        this.isOpenEditScenarioModal = true;
    }


    deleteDateScenario(scenarioIdx: number): void {
        this.optionValue.dateScenarios.splice(scenarioIdx, 1);
    }

}
