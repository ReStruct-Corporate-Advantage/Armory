import {Component} from '@angular/core';
import {StressScenario} from '../../../../../../models/stress-scenario.model';
import {CalendarDateUtils, ColumnType, DateFormatConstants, DateValue, ExploreSelectOption, ExploreSelectOptionGroup, RestrictedOptionInterface, WidgetConfigInput, WidgetInput} from '@blk/explore-ui-core';
import {ImpliedShockUnitEnum} from '../../../../../../enums/implied-shock-unit.enum';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {BaseScenarioTypeDirective} from '../base-scenario-type.directive';
import {isEmpty, isNil} from 'lodash';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {ShockSettingColumnOption} from '../../../../../../models/column-option/shock-setting-column-option.model';
import {ScenarioConstants} from '../../../../../../constants/scenario.constant';
import {ScenarioUtils} from '../../../../../../utils/scenario.utils';

@Component({
    selector: 'explore-extended-column-option-implied-shock-scenario',
    templateUrl: './implied-shock-scenario.component.html',
    styleUrls: ['./implied-shock-scenario.component.scss']
})
export class ImpliedShockScenarioComponent extends BaseScenarioTypeDirective {

    readonly DEFAULT_NOISE_DAMPENING = 'NONE';
    readonly columnType = ColumnType.COLUMNS;

    widgetConfigInput: WidgetConfigInput;
    restrictedColumnOptions: RestrictedOptionInterface;
    inputs: Map<string, WidgetInput>;

    impliedShockUnitModes: AuxRadioInterface[];
    noiseDampeningModes: ExploreSelectOptionGroup[];
    private noiseDampening: string;
    shockCorrelationsDateValue: DateValue;

    isDxsShockUnitReadOnly = false;

    isFactorDataColumnModalOpen = false;

    protected initializeComponent() {
        this.widgetConfigInput = {
            inputConfigType: 'columns',
            inputName: 'columns',
            inputTitle: 'columns',
            valueField: 'columnTag',
            default: {}
        };
        this.restrictedColumnOptions = {
            sections: [
                'customColumnTitle',
                'riskSettingsColumnSettings',
                'fxFactorOptionsColumnOption',
            ]
        };
        this.inputs = new Map();
        this.inputs.set(ColumnType.COLUMNS, this.scenario.impliedShockScenario.columns);
        this.inputs.set(StressScenario.STRESS_SCENARIO_SETTINGS, this.scenario);


        this.noiseDampening = this.scenario.impliedShockScenario.noiseDampening ? this.scenario.impliedShockScenario.noiseDampening : this.DEFAULT_NOISE_DAMPENING;
        this.initializeImpliedShockUnitModes();
        this.initializeNoiseDampeningModes();
        this.controlDxsShockUnit();

        if (this.scenario.impliedShockScenario.shockCorrelationsDate) {
            this.scenario.impliedShockScenario.shockCorrelationsDate = CalendarDateUtils.getDateInFormat(this.scenario.impliedShockScenario.shockCorrelationsDate, DateFormatConstants.MMDDYYYY_SLASH);
        }

        this.shockCorrelationsDateValue = DateValue.newDate(this.scenario.impliedShockScenario.shockCorrelationsDate);

    }


    private initializeImpliedShockUnitModes(): void {
        const impliedShockUnitTypes = [
            { displayName: 'Factor-specific shock units', value: ImpliedShockUnitEnum.FACTOR_SPECIFIC },
            { displayName: 'Number of standard deviations', value: ImpliedShockUnitEnum.NUMBER_OF_STD_DEVS },
            { displayName: 'Factor levels', value: ImpliedShockUnitEnum.FACTOR_LEVELS },
        ];
        this.impliedShockUnitModes = impliedShockUnitTypes.map(option => {
            return {
                label: option.displayName,
                eventData: option.value,
                checked: this.scenario.impliedShockScenario.impliedShockUnit === option.value,
            };
        });
    }

    private initializeNoiseDampeningModes(): void {
        const noiseDampeningTypes = [
            { displayName: 'None', value: 'NONE' },
            { displayName: 'Low', value: 'LOW' },
            { displayName: 'Medium', value: 'MEDIUM' },
            { displayName: 'High', value: 'HIGH' }
        ];
        this.noiseDampeningModes = [new ExploreSelectOptionGroup(
            noiseDampeningTypes.map(option => new ExploreSelectOption(option.displayName, option.value, this.noiseDampening === option.value))
        )];
    }

    onNoiseDampeningModeChanged(value: any): void {
        if (value === this.DEFAULT_NOISE_DAMPENING) {
            this.scenario.impliedShockScenario.noiseDampening = undefined;
        } else {
            this.scenario.impliedShockScenario.noiseDampening = value;
        }
    }

    onImpliedShockUnitChanged(value: any): void {
        this.scenario.impliedShockScenario.impliedShockUnit = value;
        if (this.scenario.impliedShockScenario.impliedShockUnit === ImpliedShockUnitEnum.FACTOR_SPECIFIC) {
            this.scenario.impliedShockScenario.dxsShockUnit = ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD;
        }
        this.controlDxsShockUnit();
        this.scenario.impliedShockScenario.globalSettingsUpdated$.next();
    }

    private controlDxsShockUnit(): void {
        this.isDxsShockUnitReadOnly = this.scenario.impliedShockScenario.impliedShockUnit !== ImpliedShockUnitEnum.FACTOR_SPECIFIC;
    }

    onRestrictImpliedShocksChanged(value: string[]): void {
        this.scenario.impliedShockScenario.restrictImpliedShocks = value;
    }

    onDxSFactorUnitChanged(): void {
        this.scenario.impliedShockScenario.globalSettingsUpdated$.next();
    }

    /**
     * Allow only absolute date for shockCorrelationsDate
     */
    onShockCorrelationDateValueChanged(dateObject: DateValue): void {
        this.shockCorrelationsDateValue = dateObject;
        this.scenario.impliedShockScenario.shockCorrelationsDate = !dateObject.dateString && !isEmpty(dateObject.date) ? dateObject.date : undefined;
    }

    /**
     * Enables or disables the shockCorrelationsDate element
     */
    onShockCorrelationsDateEnabledCheckboxChanged(): void {
        this.scenario.impliedShockScenario.isShockCorrelationsDateEnabled = !this.scenario.impliedShockScenario.isShockCorrelationsDateEnabled;
    }

    protected validateStressScenario() {
        let isValid;
        const columns = this.scenario.impliedShockScenario.columns.columns.filter(column => {
            const shockColumnOption = column.optionValues.find(optionValue => optionValue.configType === ShockSettingColumnOption.CONFIG_TYPE) as ShockSettingColumnOption;
            return isNil(shockColumnOption?.shock) || shockColumnOption.shock === 0 || isEmpty(ScenarioUtils.getColumnFactorTag(column));
        });
        if (this.scenario.impliedShockScenario.columns.columns.length === 0) {
            this.notificationService?.error(ScenarioConstants.ERROR_EMPTY_FACTORS);
            isValid = false;
        } else if (columns.length > 0) {
            this.notificationService?.error(ScenarioConstants.ERROR_IMPLIED_PROVIDE_INPUTS);
            isValid = false;
        } else {
            isValid = this.validateDuplicateAndStormFactors();
        }
        this.scenarioValidatedEmitter.emit(isValid);
    }

    private validateDuplicateAndStormFactors(): boolean {
        const columnTagSet = new Set<string>();
        for (const column of this.scenario.impliedShockScenario.columns.columns) {
            let colTag = column.columnTag;
            if (ScenarioUtils.isCustomFactorColumn(column.columnKey)) {
                // warning for the storm custom factors
                if (colTag.includes('@')) {
                    const errorMsg = this.viewAsSpecifiedClicked ? ScenarioConstants.ERROR_SCENARIO_CONVERSION_STORM_FACTORS : ScenarioConstants.ERROR_SCENARIO_SAVE_STORM_FACTORS;
                    this.notificationService?.warning(errorMsg);
                    return false;
                }
                colTag = colTag.charAt(0) === '[' ? colTag.slice(1) : colTag;
                colTag = colTag.charAt(colTag.length - 1) === ']' ? colTag.slice(0, -1) : colTag;
            }
            if (columnTagSet.has(colTag)) {
                this.notificationService?.error(ScenarioConstants.ERROR_DUPLICATE_FACTORS);
                return false;
            }
            columnTagSet.add(colTag);
        }
        return true;
    }

    onAddFactorsButtonClicked(): void {
        this.isFactorDataColumnModalOpen = true;
    }

    onFactorDataColumnModalClosed(doneClicked: boolean): void {
        this.isFactorDataColumnModalOpen = false;
        if (doneClicked === true) {
            this.scenario.impliedShockScenario.columns = this.inputs.get(ColumnType.COLUMNS) as ColumnSet;
            this.scenario.impliedShockScenario.factorsUpdated$.next();
        }
    }
}
