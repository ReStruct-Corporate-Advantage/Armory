import {ChangeDetectorRef, Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {AuxTextInputBlurDetailInterface, Validator} from '@blk/aladdin-angular-components';
import {isEmpty, isNil} from 'lodash';
import {StressScenario} from '../../../../../../models/stress-scenario.model';
import {
    AlertConstants,
    CoreUserMetaDataStore,
    ExploreDialogParam,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    ModalDirective,
    NOTIFICATION_SERVICE_TOKEN,
    NotificationServiceInterface
} from '@blk/explore-ui-core';
import {ScenarioCategoryEnum} from '../../../../../../enums/scenario-category.enum';
import {StressScenarioService} from '../../../../../../services/stress-scenario.service';
import {BehaviorSubject, takeUntil} from 'rxjs';
import {ScenarioConstants} from '../../../../../../constants/scenario.constant';

@Component({
    selector: 'explore-extended-column-option-save-scenario-modal',
    templateUrl: './save-scenario-modal.component.html',
    styleUrls: ['./save-scenario-modal.component.scss']
})
/**
 * This modal opens on top of CreateEditScenarioModalComponent, allows users to save the modified scenario
 */
export class SaveScenarioModalComponent extends ModalDirective<boolean> implements OnInit {

    /**
     * Regex to validate the scenario name -> supports max length of 10 and chars supported are -> [a-z A-Z 0-9 - . _ space ]
     */
    private static SCENARIO_NAME_REGEX = new RegExp(/^([a-zA-Z0-9-._\s]){1,10}$/);

    /**
     * Regex to validate string with no whitespace at start or end
     */
    private static REGEX_NO_SPACE_AT_ENDS = new RegExp(/^\S.*\S$/);

    @Input()
    scenario: StressScenario;

    scenarioName: string;
    scenarioDesc: string;
    type: string;

    validator: Validator[];
    selections: ExploreSelectOptionGroup[];
    promptDialog$ = new BehaviorSubject<ExploreDialogParam>(null);
    isSaveButtonDisabledBasedOnCategory = false;
    isSaveButtonDisabled = false;
    isLoading = false;

    constructor(private stressScenarioService: StressScenarioService, @Optional() @Inject(NOTIFICATION_SERVICE_TOKEN) protected notificationService: NotificationServiceInterface, protected changeDetectorRef: ChangeDetectorRef) {
        super();
    }


    ngOnInit(): void {
        this.scenarioName = this.scenario.scenName;
        this.scenarioDesc = this.scenario.scenDesc;

        this.validator = [{
            validate: (value: string) => {
                return !isNil(value) && SaveScenarioModalComponent.SCENARIO_NAME_REGEX.test(value) && SaveScenarioModalComponent.REGEX_NO_SPACE_AT_ENDS.test(value);
            },
        }];

        this.initializeTypes();

        // Call after type is initialized
        this.setIsSaveButtonDisabledBasedOnCategory();
    }

    private initializeTypes(): void {
        const showSharedOption = CoreUserMetaDataStore.userMetaData.sharedFavPerms;

        const options = [
            new ExploreSelectOption('Personal', ScenarioConstants.SCENARIO_VISIBILITY.PRIVATE, true),
            new ExploreSelectOption('Shared', ScenarioConstants.SCENARIO_VISIBILITY.SHARED, false, !showSharedOption)
        ];
        this.selections = [new ExploreSelectOptionGroup(options)];

        this.type = ScenarioConstants.SCENARIO_VISIBILITY.PRIVATE;
    }

    private setIsSaveButtonDisabledBasedOnCategory(): void {
        if (this.scenario.convertToSpecifiedShock) {
            this.isSaveButtonDisabledBasedOnCategory = true;
            return;
        }
        switch (this.scenario.scenCategory) {
            case ScenarioCategoryEnum.ALADDIN_SCENARIOS:
            case ScenarioCategoryEnum.TEAM_SCENARIOS: {
                this.isSaveButtonDisabledBasedOnCategory = true;
            }
                break;
            case ScenarioCategoryEnum.MY_SCENARIOS: {
                this.isSaveButtonDisabledBasedOnCategory = this.type === ScenarioConstants.SCENARIO_VISIBILITY.SHARED;
            }
                break;
            case ScenarioCategoryEnum.ENTERPRISE_SCENARIOS: {
                this.isSaveButtonDisabledBasedOnCategory = this.type === ScenarioConstants.SCENARIO_VISIBILITY.PRIVATE;
            }
                break;
            default: {
                this.isSaveButtonDisabledBasedOnCategory = false;
            }
        }
    }

    onScenarioNameChanged(ev: CustomEvent<AuxTextInputBlurDetailInterface>): void {
        this.scenarioName = (ev.detail.srcEvent.target as HTMLAuxTextInputElement).value;

        // When creating scenario from scratch always show save button and when scenarioName does not match with current name hide save button
        this.isSaveButtonDisabled = !isEmpty(this.scenario.scenName) && this.scenarioName !== this.scenario.scenName;
    }

    onScenarioDescChanged(ev: CustomEvent<AuxTextInputBlurDetailInterface>): void {
        this.scenarioDesc = (ev.detail.srcEvent.target as HTMLAuxTextInputElement).value;
    }

    onTypeChanged(selectedType: ExploreSelectOption) {
        this.type = selectedType.value;
        this.setIsSaveButtonDisabledBasedOnCategory();
    }

    onSaveButtonClicked(saveAs?: boolean): void {
        if (!this.validator[0].validate(this.scenarioName)) {
            return;
        }
        if (saveAs) {
            this.verifyAndSaveScenario();
        } else {
            this.saveScenario();
        }
    }


    private verifyAndSaveScenario(): void {
        const params: any = {
            scenName: this.scenarioName,
            scenCategory: this.getScenarioCategory(),
        };

        this.isLoading = true;
        this.changeDetectorRef.markForCheck();

        this.stressScenarioService.fetchScenario$(params)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (stressScenario: StressScenario) => {
                    this.isLoading = false;
                    this.changeDetectorRef.markForCheck();

                    if (stressScenario !== null) {
                        // scenario exists -> ask for overwrite
                        this.promptDialog$.next(
                            new ExploreDialogParam(
                                AlertConstants.TYPE.PROMPT,
                                AlertConstants.HEADER.CONFIRM,
                                AlertConstants.BODY.SCENARIO_WITH_SAME_NAME,
                                AlertConstants.BTN.OK,
                                AlertConstants.BTN.CANCEL,
                                this.saveScenario
                            ));
                    } else {
                        // directly save
                        this.saveScenario();
                    }
                },
                error: () => {
                    this.isLoading = false;
                    this.changeDetectorRef.markForCheck();
                    this.notificationService?.error(ScenarioConstants.ERROR_WHILE_FETCHING_SCENARIO);
                },
            });
    }

    private saveScenario = (): void => {
        this.isLoading = true;
        this.changeDetectorRef.markForCheck();

        const params: any = {};
        this.scenario.addRequestParamsForSaveScenario(params);
        params.scenName = this.scenarioName;
        params.scenCategory = this.getScenarioCategory();
        params.scenDesc = this.scenarioDesc;
        params.scenVis = this.type;

        this.stressScenarioService.saveScenario$(params)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (responseData: any) => {
                    this.scenario.scenName = params.scenName;
                    this.scenario.scenCategory = params.scenCategory;
                    this.scenario.scenDesc = params.scenDesc;
                    this.scenario.scenVis = params.scenVis;
                    this.scenario.scenCode = responseData.scenCode;
                    this.notificationService?.success(ScenarioConstants.SUCCESS_SAVING_SCENARIO);
                    this.closeModal(true);
                },
                error: () => {
                    this.isLoading = false;
                    this.changeDetectorRef.markForCheck();
                    this.notificationService?.error(ScenarioConstants.ERROR_WHILE_SAVING_SCENARIO);
                },
            });
    };

    private getScenarioCategory(): ScenarioCategoryEnum {
        return this.type === ScenarioConstants.SCENARIO_VISIBILITY.PRIVATE ? ScenarioCategoryEnum.MY_SCENARIOS : ScenarioCategoryEnum.ENTERPRISE_SCENARIOS;
    }

    closeDialog(): void {
        this.promptDialog$.next(null);
    }

}
