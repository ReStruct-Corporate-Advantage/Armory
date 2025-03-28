import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {
    AlertConstants,
    ColumnConfig,
    CoreCommonConstants,
    ExploreDialogParam,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    ModalDirective,
    TelemetryActionConstants,
    TelemetryFactorParameters,
    TelemetryService,
    TelemetryStressScenarioCreationConfigEventParameters,
} from '@blk/explore-ui-core';
import {StressScenario} from '../../../../../models/stress-scenario.model';
import {ScenarioTypeEnum} from '../../../../../enums/scenario-type.enum';
import { SpecifiedShockScenario } from '../../../../../models/scenario-types/specified-shock-scenario.model';
import {ShockSettingColumnOption} from '../../../../../models/column-option/shock-setting-column-option.model';
import {cloneDeep} from 'lodash';

@Component({
    selector: 'explore-extended-column-option-create-edit-scenario-modal',
    templateUrl: './create-edit-scenario-modal.component.html',
    styleUrls: ['./create-edit-scenario-modal.component.scss']
})
/**
 * This modal opens on top of widget settings modal, it is for creating/editing a scenario
 */
export class CreateEditScenarioModalComponent extends ModalDirective<boolean> implements OnInit {

    protected readonly ScenarioType = ScenarioTypeEnum;

    private readonly scenarioTypes = [
        { displayName: 'Implied Shocks', value: ScenarioTypeEnum.IMPLIED_SHOCK },
        { displayName: 'Specified Shocks', value: ScenarioTypeEnum.SPECIFIED_SHOCK },
        { displayName: 'Date Range', value: ScenarioTypeEnum.DATE_RANGE },
    ];

    @Input()
    isScenarioCreationDisabled: boolean;
    @Input()
    column: ColumnConfig;
    @Input()
    scenario: StressScenario;
    updatedScenario: StressScenario = new StressScenario();

    private oldScenario: StressScenario;

    modalHeader = 'Create Scenario';
    showSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    isApplyButtonDisabled = {value: 0};
    scenarioTypesData: ExploreSelectOptionGroup[];
    promptDialog$ = new BehaviorSubject<ExploreDialogParam>(null);

    validateScenario = false;

    openSaveScenarioModal = false;

    private saveClicked = false;
    viewAsSpecifiedClicked = false;

    scenarioType: ScenarioTypeEnum;

    constructor(private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        if (this.scenario.scenName) {
            this.modalHeader = this.scenario.scenName;
        }
        this.oldScenario = cloneDeep(this.scenario);
        this.setScenarioType();
        this.initializeScenarioTypes();
    }

    private initializeScenarioTypes(): void {
        const scenarioTypes = !this.isScenarioCreationDisabled ? this.scenarioTypes : [this.scenarioTypes[2]];

        this.scenarioTypesData = [new ExploreSelectOptionGroup(scenarioTypes.map(scenarioTypeObj => new ExploreSelectOption(
            scenarioTypeObj.displayName, scenarioTypeObj.value, scenarioTypeObj.value === this.scenarioType
        )))];
    }

    onScenarioTypeChanged(value: any): void {
        if (value === this.scenarioType) {
            return;
        }
        this.promptDialog$.next(
            new ExploreDialogParam(
                AlertConstants.TYPE.PROMPT,
                AlertConstants.HEADER.CONFIRM_TYPE_CHANGE,
                AlertConstants.BODY.CHANGE_SCENARIO_TYPE,
                AlertConstants.BTN.CONTINUE,
                AlertConstants.BTN.CANCEL,
                () => {
                    this.showSpinner$.next(false);
                    this.scenario.scenType = value;
                    this.scenario.resetParams();
                    this.setScenarioType();
                    this.changeDetectorRef.detectChanges();
                },
                () => {
                    this.initializeScenarioTypes();
                }
            ));
    }

    closeDialog(): void {
        this.promptDialog$.next(null);
    }

    onSaveAndAddClicked(): void {
        this.saveClicked = true;
        this.doValidateScenario();
    }

    onViewAsSpecifiedScenarioClicked(): void {
        this.viewAsSpecifiedClicked = true;
        this.doValidateScenario();
    }

    private doValidateScenario(): void {
        this.validateScenario = true;
        this.isApplyButtonDisabled.value++;
        this.changeDetectorRef.detectChanges();
    }

    validateScenarioHandler(isValid: boolean): void {
        this.validateScenario = false;
        this.isApplyButtonDisabled.value--;
        if (!isValid) {
            this.saveClicked = false;
            this.viewAsSpecifiedClicked = false;
            this.changeDetectorRef.detectChanges();
            return;
        }
        if (this.saveClicked) {
            this.saveClicked = false;
            if (this.scenario.scenType === ScenarioTypeEnum.DATE_RANGE) {
                this.trackCreateScenarioTelemetry();
                this.closeModal(true);
                return;
            }
            this.updatedScenario.copy(this.scenario);
            this.openSaveScenarioModal = true;
        } else if (this.viewAsSpecifiedClicked) {
            this.trackCreateScenarioTelemetry(true);
            this.viewAsSpecifiedClicked = false;
            this.scenario.convertToSpecifiedShock = true;
            this.scenario.convertFromScenario = this.scenario.scenType;
            this.scenario.specifiedShockScenario = new SpecifiedShockScenario();
            this.scenario.scenType = ScenarioTypeEnum.SPECIFIED_SHOCK;
            this.setScenarioType();
            this.initializeScenarioTypes();
        }
        this.changeDetectorRef.detectChanges();
    }

    closeSaveScenarioModal(scenarioSaved: boolean): void {
        if (scenarioSaved === true) {
            this.scenario.copy(this.updatedScenario);
            this.trackCreateScenarioTelemetry();
            this.closeModal(true);
        }
        this.openSaveScenarioModal = false;
        this.changeDetectorRef.detectChanges();
    }

    private setScenarioType(): void {
        this.scenarioType = this.scenario.scenType;
    }

    private trackCreateScenarioTelemetry(viewedAsSpecified?: boolean): void {
        const scenarioParams = new TelemetryStressScenarioCreationConfigEventParameters();
        scenarioParams.scenarioType = this.scenario.scenType;
        scenarioParams.viewedAsSpecifiedShock = viewedAsSpecified;

        if (this.scenario.scenType === ScenarioTypeEnum.IMPLIED_SHOCK) {
            this.setImpliedShockScenarioParams(scenarioParams);
        } else if (this.scenario.scenType === ScenarioTypeEnum.SPECIFIED_SHOCK) {
            this.setSpecifiedShockScenarioParams(scenarioParams);
        } else {
            this.setDateScenarioParams(scenarioParams);
        }

        TelemetryService.track(TelemetryActionConstants.COLUMN.STRESS_SCENARIO_CREATION, scenarioParams);
    }

    private setImpliedShockScenarioParams(scenarioParams: TelemetryStressScenarioCreationConfigEventParameters): void {
        scenarioParams.dxsShockUnit = this.scenario.impliedShockScenario.dxsShockUnit;
        scenarioParams.impliedShockUnit = this.scenario.impliedShockScenario.impliedShockUnit;
        scenarioParams.restrictImpliedShock = this.scenario.impliedShockScenario.restrictImpliedShocks.join(CoreCommonConstants.COMMA_SEPARATOR);
        scenarioParams.noiseDampening = this.scenario.impliedShockScenario.noiseDampening;
        scenarioParams.shockCorrelationsDateEnabled = this.scenario.impliedShockScenario.isShockCorrelationsDateEnabled;

        const oldColumns: Map<string, ColumnConfig> = new Map();
        if (this.oldScenario.scenType === ScenarioTypeEnum.IMPLIED_SHOCK) {
            this.oldScenario.impliedShockScenario.columns.columns.forEach(column => {
                oldColumns.set(column.columnTag, column);
            });
        }
        scenarioParams.factorColumnsList = this.scenario.impliedShockScenario.columns.columns.map(column => {
            const oldCol = oldColumns.get(column.columnTag);
            const shockColumnOption = column.optionValues.find(optionValue => optionValue.configType === ShockSettingColumnOption.CONFIG_TYPE) as ShockSettingColumnOption;
            const oldShockColumnOption = oldCol?.optionValues.find(optionValue => optionValue.configType === ShockSettingColumnOption.CONFIG_TYPE) as ShockSettingColumnOption;
            return new TelemetryFactorParameters({
                factorTag: column.columnTag,
                factorKey: column.columnKey,
                shockSettingsChanged: oldShockColumnOption ? !shockColumnOption.equals(oldShockColumnOption) : false,
            });
        });
    }

    private setSpecifiedShockScenarioParams(scenarioParams: TelemetryStressScenarioCreationConfigEventParameters): void {
        scenarioParams.dxsShockUnit = this.scenario.specifiedShockScenario.dxsShockUnit;
        scenarioParams.createNewSpecifiedScenario = this.scenario.isCreateNewSpecifiedScenarioFlow();
    }

    private setDateScenarioParams(scenarioParams: TelemetryStressScenarioCreationConfigEventParameters): void {
        scenarioParams.dxsShockUnit = this.scenario.dateScenario.dxsShockUnit;
        scenarioParams.startDate = this.scenario.dateScenario.fromDate.date;
        scenarioParams.endDate = this.scenario.dateScenario.toDate.date;
        scenarioParams.holdingPeriodOverride = this.scenario.dateScenario.holdingPeriodOverride;
    }


}
