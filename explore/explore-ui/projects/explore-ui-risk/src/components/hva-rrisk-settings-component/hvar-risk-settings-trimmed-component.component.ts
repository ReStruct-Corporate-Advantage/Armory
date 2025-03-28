import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {
    AuxCheckboxGroupChangedDetailInterface,
    AuxNumericStepperValueChangedDetailInterface,
    AuxRadioInterface,
    AuxSelectOption,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface,
    AuxTextInput,
    AuxTextInputBlurDetailInterface,
    Validator
} from '@blk/aladdin-angular-components';
import {
    CoreDefinitionStore,
    DateValue,
    ExploreCheckbox,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    TokenConstants
} from '@blk/explore-ui-core';
import {cloneDeep, isNil, isUndefined} from 'lodash';
import {CoreRiskConstants} from '../../core-risk.constants';
import {HvarRiskSettingsModel} from '../../models/hvar-risk-settings/hvar-risk-settings.model';
import {Gaussian} from 'ts-gaussian';

@Component({
    selector: 'explore-risk-hvar-risk-settings-trimmed-component',
    templateUrl: './hvar-risk-settings-trimmed-component.component.html',
    styleUrls: ['./hvar-risk-settings-component.component.scss', '../../../styles/common-risk-styles.scss']
})
export class HvarRiskSettingsTrimmedComponentComponent implements OnInit {

    @Input() hvarRiskSettingsModel: HvarRiskSettingsModel;

    @Output() updateRiskSettingFlag: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild('decayfactor', {static: false}) decayfactorInput: AuxTextInput;
    @ViewChild('halflifeindays', {static: false}) halflifeindaysInput: AuxTextInput;

    returnHorizons: any[] = [];

    historicalReturnDecay: AuxRadioInterface[] = [];

    generalCheckBoxes: ExploreCheckbox[] = [];

    numberOfObservationOptions: AuxRadioInterface[] = [];

    validator: Validator[];

    factorScalingOptions: AuxSelectOptionGroup[];

    // UI control variables
    dateValueObject: DateValue;
    isNumberOfObservationsSelected: boolean;
    noOfObservations: number;
    historicalReturnDecaySelection: string;
    halfLifeInDays: number;
    decayFactor = 1;
    returnHorizonSelection: string;
    numberOfDays: number;
    linear: number;
    holdingPeriod: number;
    readonly propertyList = CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES;
    readonly LABEL = CoreRiskConstants.LABEL;
    private readonly INVALID_INPUT = 'Invalid input';

    public static computeConfidenceLevelSD(confidenceLevelPercentage: number): number {
        return +(new Gaussian(0, 1).ppf(confidenceLevelPercentage / 100)).toFixed(6);
    }

    public static computeHalfLife(decayFactor: number): number {
        return  Number((Math.log(0.5) / Math.log(decayFactor)).toFixed(0));
    }

    public static computeDecayFactor(halfLifeInDays): number {
        return Number((Math.exp(Math.log(0.5) / halfLifeInDays)).toFixed(8));
    }

    ngOnInit(): void {
        this._initReturnHorizon();
        this.historicalReturnDecaySelection = (isUndefined(this.hvarRiskSettingsModel.historicalReturnDecay) || this.hvarRiskSettingsModel.historicalReturnDecay === 1) ? 'ConstantWeighting' : 'HalfLife';
        CoreRiskConstants.HVAR_HISTORICAL_RETURN_DECAY.forEach(decay => {
            this.historicalReturnDecay.push({label: decay.label, checked: this.historicalReturnDecaySelection === decay.value, eventData: decay.value});
        });
        const fullRevaluation = !isUndefined(this.hvarRiskSettingsModel.fullRevaluation) ? this.hvarRiskSettingsModel.fullRevaluation : true;
        const includeTimeReturn = !isUndefined(this.hvarRiskSettingsModel.includeTimeReturn) ? this.hvarRiskSettingsModel.includeTimeReturn : true;

        this.generalCheckBoxes = [
            new ExploreCheckbox('Full Revaluation', fullRevaluation, false),
            new ExploreCheckbox('Include time return', includeTimeReturn, false)
        ];
        this._initHalfLifeSettings();

        this.validator = [{
            validate: (value: number) => {
                return !isNil(value) && !isNaN(value);
            },
            errorMessage: this.INVALID_INPUT
        }];
        this.dateValueObject = isUndefined(this.hvarRiskSettingsModel.startDate) ? new DateValue({dateString: true, dateStringValue: CoreDefinitionStore.tokens[TokenConstants.EXPLORE_HVAR_START_DATE]}) : cloneDeep(this.hvarRiskSettingsModel.startDate);
        this.noOfObservations = isUndefined(this.hvarRiskSettingsModel.numberOfObservations) ? 0 : this.hvarRiskSettingsModel.numberOfObservations;
        this.isNumberOfObservationsSelected = isUndefined(this.hvarRiskSettingsModel.isNumberOfObservationsSelected) ? false : this.hvarRiskSettingsModel.isNumberOfObservationsSelected;

        this.numberOfObservationOptions.push({label: 'Start date', checked: !this.isNumberOfObservationsSelected, eventData: 'START_DATE'});
        this.numberOfObservationOptions.push({label: 'Number of business days', checked: this.isNumberOfObservationsSelected, eventData: 'NUMBER_OF_OBSERVATIONS'});

        this.factorScalingOptions = [new ExploreSelectOptionGroup([])];
        CoreRiskConstants.FACTOR_SCALING_OPTIONS.forEach(option => this.factorScalingOptions[0].values.push(new ExploreSelectOption(option.label, option.value)));
        this.refreshFactorScalingOptions();

        this.hvarRiskSettingsModel.version = 'trimmed';
    }

    private _initReturnHorizon(): void {
        this.returnHorizonSelection = isUndefined(this.hvarRiskSettingsModel.returnHorizonSelection) ? 'days' : this.hvarRiskSettingsModel.returnHorizonSelection;
        CoreRiskConstants.HVAR_RETURN_HORIZON.forEach(horizon => {
            this.returnHorizons.push({label: horizon.label, checked: this.returnHorizonSelection === horizon.value, eventData: horizon.value});
        });
        this.numberOfDays = isUndefined(this.hvarRiskSettingsModel.numberOfDays) ? HvarRiskSettingsModel.DEFAULT_NUMBER_OF_DAYS  : this.hvarRiskSettingsModel.numberOfDays;
        this.linear = isUndefined(this.hvarRiskSettingsModel.linear) ? HvarRiskSettingsModel.DEFAULT_NON_LINEAR : this.hvarRiskSettingsModel.linear;
    }

    private _initHalfLifeSettings() {
        if (isUndefined(this.hvarRiskSettingsModel.historicalReturnDecay)) {
            this.halfLifeInDays = 14;
            this.decayFactor = HvarRiskSettingsTrimmedComponentComponent.computeDecayFactor(this.halfLifeInDays);
        } else {
            this.decayFactor = this.hvarRiskSettingsModel.historicalReturnDecay;
            this.halfLifeInDays = HvarRiskSettingsTrimmedComponentComponent.computeHalfLife(this.decayFactor);
        }
    }

    onReturnHorizonChanged(selectedReturnHorizon: string): void {
        this.returnHorizonSelection = selectedReturnHorizon;
        this.hvarRiskSettingsModel.returnHorizonSelection = selectedReturnHorizon;
        this.updateRiskSettingFlag.emit();
    }

    onHistoricalReturnDecayChanged(selectedReturnHorizon: string): void {
        this.historicalReturnDecaySelection = selectedReturnHorizon;
        if ('ConstantWeighting' === selectedReturnHorizon) {
            this.hvarRiskSettingsModel.historicalReturnDecay = 1;
        } else {
            // reset so that new settings can be reinitialized with default
            this.hvarRiskSettingsModel.historicalReturnDecay = undefined;
            this._initHalfLifeSettings();
        }
        this.updateRiskSettingFlag.emit();
    }

    onNumberOfDaysChanged(property: string, event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        if (!event || !event.detail) {
            return;
        }
        if ('linear' === property) {
            this.hvarRiskSettingsModel.linear = Number(event.detail.value);
        } else {
            this.hvarRiskSettingsModel.numberOfDays = Number(event.detail.value);
        }

        // Trigger the update of the settings.
        this.updateRiskSettingFlag.emit();
    }

    /**
     * Sets the date object for hvarRiskSettings
     */
    onStartDateChange(dateObject: DateValue): void {
        this.hvarRiskSettingsModel.startDate = dateObject;
        this.hvarRiskSettingsModel.isNumberOfObservationsSelected = false;
        this.updateRiskSettingFlag.emit();
    }

    onGeneralCheckboxChanged(event: CustomEvent<AuxCheckboxGroupChangedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }
        this.hvarRiskSettingsModel.fullRevaluation = event.detail.value[0].checked;
        this.hvarRiskSettingsModel.includeTimeReturn = event.detail.value[1].checked;
        this.updateRiskSettingFlag.emit();
    }

    /**
     * Half life changed handler
     */
    onHalfLifeChanged(ev: CustomEvent<AuxTextInputBlurDetailInterface>): void {
        if (this.validator[0].validate((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value)) {
            this.halfLifeInDays = Number((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value);
            if (this.halfLifeInDays <= 0) {
                this.halfLifeInDays = 14;
            }
            this.decayFactor = HvarRiskSettingsTrimmedComponentComponent.computeDecayFactor(this.halfLifeInDays);
            this.hvarRiskSettingsModel.historicalReturnDecay = this.decayFactor;
            this.decayfactorInput.setValue(String(this.decayFactor));
            this.updateRiskSettingFlag.emit();
        }
    }

    /**
     * Decay changed handler
     */
    onDecayChanged(ev: CustomEvent<AuxTextInputBlurDetailInterface>): void {
        if (this.validator[0].validate((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value)) {
            this.decayFactor = Number((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value);
            if (this.decayFactor <= 0 || this.decayFactor >= 1) {
                this.halfLifeInDays = 14;
                this.decayFactor = HvarRiskSettingsTrimmedComponentComponent.computeDecayFactor(this.halfLifeInDays);
            } else {
                this.halfLifeInDays = HvarRiskSettingsTrimmedComponentComponent.computeHalfLife(this.decayFactor);
            }
            this.hvarRiskSettingsModel.historicalReturnDecay = this.decayFactor;
            this.halflifeindaysInput.setValue(String(this.halfLifeInDays));
            this.updateRiskSettingFlag.emit();
        }
    }

    /**
     * On onNumberOfObservations Option changed
     */
    onNumberOfObservationsOptionChanges(eventType: any): void {
        this.isNumberOfObservationsSelected = eventType === 'NUMBER_OF_OBSERVATIONS';
        this.hvarRiskSettingsModel.isNumberOfObservationsSelected = this.isNumberOfObservationsSelected;
    }

    onNumberOfObservationChange(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        this.noOfObservations = Number(event.detail.value);
        this.hvarRiskSettingsModel.numberOfObservations = this.noOfObservations;
        this.hvarRiskSettingsModel.isNumberOfObservationsSelected = true;
    }

    onFactorScalingSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        if ((event.detail.value as AuxSelectOption).value) {
            this.hvarRiskSettingsModel.factorScaling = (event.detail.value as AuxSelectOption).value;
            this.updateRiskSettingFlag.emit();
        }
    }

    refreshFactorScalingOptions(): void {
        this.factorScalingOptions[0].values.forEach(factorScaling  => factorScaling.isSelected = false);
        const auxSelectOptions = this.factorScalingOptions[0].values.filter(factorScaling => factorScaling.value === this.hvarRiskSettingsModel.factorScaling);
        if (auxSelectOptions.length === 0) {
            this.factorScalingOptions[0].values[0].isSelected = true;
        } else {
            auxSelectOptions[0].isSelected = true;
        }
        this.factorScalingOptions = this.factorScalingOptions.map(factorScaling => factorScaling);
    }

    factorScalingReset(): void {
        this.hvarRiskSettingsModel.resetValue(this.propertyList.FACTOR_SCALING);
        this.refreshFactorScalingOptions();
    }
}
