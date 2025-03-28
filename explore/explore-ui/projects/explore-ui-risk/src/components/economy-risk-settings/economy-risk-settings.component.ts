import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {
    AuxNumericStepperValueChangedDetailInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface,
    AuxTextInput,
    AuxTextInputBlurDetailInterface,
    Validator
} from '@blk/aladdin-angular-components';
import {
    CoreDefinitionStore,
    DateValue,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    RiskParameter,
    SubscribableComponent
} from '@blk/explore-ui-core';
import {cloneDeep, isNil, isUndefined} from 'lodash';
import {CoreRiskConstants} from '../../core-risk.constants';
import {EconomySettings} from '../../models/economy-settings/economy-settings.model';

/**
 * Economy Risk Settings Component
 *
 * @example
 *  <div *ngIf="dependsOnEconomy" style="min-height: 49vh;">
 *      <explore-risk-economy-risk-settings #economyRiskSettingsComponent
 *                                 [economyRiskSettings]="riskSettings.economyRiskSettings">
 *      </explore-risk-economy-risk-settings>
 *  </div>
 */
@Component({
    selector: 'explore-risk-economy-risk-settings',
    templateUrl: './economy-risk-settings.component.html',
    styleUrls: ['./economy-risk-settings.component.scss']
})
export class EconomyRiskSettingsComponent extends SubscribableComponent implements OnInit {
    @Input() economyRiskSettings: EconomySettings;
    @Output() updateRiskSettingFlag: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild('periodSelectionList', {static: false}) periodSelectionList: any;
    @ViewChild('sigmaValue', {static: false}) sigmaValue: AuxTextInput;
    @ViewChild('confidenceLevelPercent', {static: false}) confidenceLevelPercent: AuxTextInput;
    @ViewChild('halflifeindays', {static: false}) halfLifeInDays: AuxTextInput;
    @ViewChild('decayfactor', {static: false}) decayFactor: AuxTextInput;

    weightingSchemeList: ExploreSelectOptionGroup[];
    periodList: ExploreSelectOptionGroup[];
    riskHorizonList: ExploreSelectOptionGroup[];
    riskHorizons: RiskParameter[] = [];
    availablePeriods: string[] = [];

    calledAfterWeightingSchemeReset: boolean;
    calledAfterPeriodReset: boolean;
    calledAfterOverlapReset: boolean;
    weightingSchemeExpanded = false;
    isOverlapEnabled = false;

    dateValueObject: DateValue;
    validator: Validator[];

    readonly LABEL = CoreRiskConstants.LABEL;
    readonly propertyList = CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES;
    readonly overlapEnabledWeighingSchemes: string[] = ['DLY', 'DLO', 'MKT', 'REG'];
    private readonly INVALID_INPUT = 'Invalid input';

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.availablePeriods = cloneDeep(CoreRiskConstants.RISK_SETTING_DEFAULTS.AVAILABLE_PERIODS);

        this.riskHorizons = CoreDefinitionStore.riskHorizon.map(riskHorizonObj => new RiskParameter({
            value: riskHorizonObj.value,
            text: riskHorizonObj.text
        }));

        if (this.economyRiskSettings) {
            this.economyRiskSettings.initWeightingSchemes();
            this.economyRiskSettings.addWeightingSchemeIfItDoesntExist();
            this.economyRiskSettings.setDefaultOverlap();
            this.economyRiskSettings.resetHalfLife();
            this.economyRiskSettings.setDefaultPeriod();
            this.economyRiskSettings.createCustomBasedOnHalfLife();
            this.economyRiskSettings.confidenceLevelPercentage = CoreRiskConstants.RISK_SETTING_DEFAULTS.DEFAULT_CONFIDENCE_LEVEL_IN_PERCENTAGE;
            this.economyRiskSettings.computeConfidenceLevelInPercentage();
            this.economyRiskSettings.riskHorizons = this.riskHorizons;
            this.economyRiskSettings.availablePeriods = this.availablePeriods;
        }

        this.periodList = [new ExploreSelectOptionGroup(this.availablePeriods.map(availablePeriod => new ExploreSelectOption(
            availablePeriod, availablePeriod, availablePeriod === this.economyRiskSettings.selectedPeriod
        )))];
        this.weightingSchemeList = [new ExploreSelectOptionGroup(this.economyRiskSettings.availableWeightingSchemes.map(weightingScheme => new ExploreSelectOption(
            weightingScheme.displayName, weightingScheme.value, weightingScheme.value === this.economyRiskSettings.weightingScheme
        )))];
        this.weightingSchemeList = this.refreshSelectOptionList(this.weightingSchemeList, this.propertyList.WEIGHTING_SCHEME, true);

        this.riskHorizonList = [new ExploreSelectOptionGroup(this.riskHorizons.map(riskHorizonObj => new ExploreSelectOption(riskHorizonObj.text, riskHorizonObj.value)))];
        const riskHorizon = this.riskHorizonList[0].values.find(riskHorizonObj => riskHorizonObj.value === this.economyRiskSettings.riskHorizon);
        if (!isNil(riskHorizon)) {
            riskHorizon.isSelected = true;
        }
    // These changes are done for risk radar, where economy date are undefined by default.
        this.dateValueObject = isUndefined(this.economyRiskSettings.dateObject) ? DateValue.newRelativeDate('T-1') : cloneDeep(this.economyRiskSettings.dateObject);
        this.setIsOverlapEnabled();

        this.validator = [{
            validate: (value: number) => {
                return !isNil(value) && !isNaN(value);
            },
            errorMessage: this.INVALID_INPUT
        }];

        this.initializeComponent();
    }

    protected initializeComponent(): void {
        // This is intentional to override by child component
    }

    /**
     * Sets the date object for economyRiskSettings
     */
    onEconomyDateChange(dateObject: DateValue): void {
        this.economyRiskSettings.dateObject = dateObject;
        this.updateRiskSettingFlag.emit();
    }

    /**
     * Weighting scheme selection changed handler
     */
    onWeightingSchemeSelectionChanged(ev: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.economyRiskSettings.weightingScheme = (ev.detail.value as AuxSelectOption).value;
        this.economyRiskSettings.resetValue(this.propertyList.DECAY_FACTOR);
        this.economyRiskSettings.resetHalfLife();
        this.periodReset();
        this.overlapReset();
        this.setIsOverlapEnabled();
        // now update the riskSettingFlag as per the selection
        this.updateRiskSettingFlag.emit();
    }

    updatePeriodList(): void {
        const selectedPeriod: string = this.economyRiskSettings.selectedPeriod;
        this.periodList[0].values.forEach((period: ExploreSelectOption) => {
            period.isSelected = (period.value === selectedPeriod) ;
        });
        this.periodList = [this.periodList[0]];
    }

    /**
     * Period list selection changed handler
     */
    onPeriodListSelectionChanged(ev: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.economyRiskSettings.selectedPeriod = (ev.detail.value as AuxSelectOption).value;
        this.economyRiskSettings.computePeriodInText();
        this.handleChangeInSchemeAndReassignList();
        this.updateRiskSettingFlag.emit();
    }

    /**
     * Period value changed handler
     */
    onPeriodChanged(ev: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        this.economyRiskSettings.period = Number(ev.detail.value);
        this.economyRiskSettings.computePeriod();
        this.updatePeriodList();
        this.handleChangeInSchemeAndReassignList();
        this.updateRiskSettingFlag.emit();
    }

    /**
     * Risk horizon selection changed handler
     */
    onRiskHorizonSelectionChanged(ev: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.economyRiskSettings.riskHorizon = (ev.detail.value as AuxSelectOption).value;
        this.updateRiskSettingFlag.emit();
    }

    /**
     * Confidence level % changed handler
     */
    onConfidenceLevelPercentChanged(ev: CustomEvent<AuxTextInputBlurDetailInterface>): void {
        if (this.validator[0].validate((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value)) {
            this.economyRiskSettings.confidenceLevelPercentage = Number((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value);
            this.economyRiskSettings.computeConfidenceLevelInStdDeviation();
            this.confidenceLevelPercent.setValue(String(this.economyRiskSettings.confidenceLevelPercentage));
            this.updateRiskSettingFlag.emit();
        }
    }

    /**
     * Confidence level SD changed handler
     */
    onConfidenceLevelSDChanged(ev: CustomEvent<AuxTextInputBlurDetailInterface>): void {
        if (this.validator[0].validate((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value)) {
            this.economyRiskSettings.confidenceLevelSD = Number((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value);
            this.economyRiskSettings.computeConfidenceLevelInPercentage();
            this.sigmaValue.setValue(String(this.economyRiskSettings.confidenceLevelSD));
            this.updateRiskSettingFlag.emit();
        }
    }

    /**
     * Half life changed handler
     */
    onHalfLifeChanged(ev: CustomEvent<AuxTextInputBlurDetailInterface>): void {
        if (this.validator[0].validate((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value)) {
            this.economyRiskSettings.halfLifeInDays = Number((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value);
            this.economyRiskSettings.computeHalfLifeDecay();
            this.handleChangeInSchemeAndReassignList();
            this.updateRiskSettingFlag.emit();
        }
    }

    /**
     * Decay changed handler
     */
    onDecayChanged(ev: CustomEvent<AuxTextInputBlurDetailInterface>): void {
        if (this.validator[0].validate((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value)) {
            this.economyRiskSettings.decayFactor = Number((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value);
            this.economyRiskSettings.computeHalfLifeInDays();
            this.handleChangeInSchemeAndReassignList();
            this.updateRiskSettingFlag.emit();
        }
    }


    /******* Resets *******/

    economyDateReset(): void {
        this.economyRiskSettings.resetValue(this.propertyList.DATE_OBJECT);
        this.dateValueObject = this.economyRiskSettings.dateObject;
        this.updateRiskSettingFlag.emit();
    }

    weightingSchemeReset(): void {
        const weightingScheme = this.economyRiskSettings.weightingScheme;
        this.economyRiskSettings.resetValue(this.propertyList.WEIGHTING_SCHEME);
        this.calledAfterWeightingSchemeReset = weightingScheme !== this.economyRiskSettings.weightingScheme && !this.economyRiskSettings.addWeightingSchemeIfItDoesntExist();
        this.decayFactorReset();
        this.periodReset();
        this.overlapReset();
        this.refreshWeightingList();
        this.setIsOverlapEnabled();
        this.updateRiskSettingFlag.emit();
    }

    periodReset(): void {
        this.economyRiskSettings.resetValue(this.propertyList.PERIOD);
        this.calledAfterPeriodReset = this.economyRiskSettings.setDefaultPeriod();
        this.updatePeriodList();
        this.refreshWeightingList();
        this.updateRiskSettingFlag.emit();
    }

    confidenceLevelReset(): void {
        this.economyRiskSettings.resetValue(this.propertyList.CONFIDENCE_LEVEL_SD);
        this.economyRiskSettings.computeConfidenceLevelInPercentage();
        this.confidenceLevelPercent.validate();
        this.sigmaValue.validate();
        this.updateRiskSettingFlag.emit();
    }

    riskHorizonReset(): void {
        this.economyRiskSettings.resetValue(this.propertyList.RISK_HORIZON);
        this.riskHorizonList = this.refreshSelectOptionList(this.riskHorizonList, this.propertyList.RISK_HORIZON);
        this.updateRiskSettingFlag.emit();
    }

    decayFactorReset(): void {
        this.economyRiskSettings.resetValue(this.propertyList.DECAY_FACTOR);
        this.economyRiskSettings.resetHalfLife();
        this.economyRiskSettings.computeHalfLifeInDays();
        this.decayFactor?.validate();
        this.halfLifeInDays?.validate();
        this.updateRiskSettingFlag.emit();
    }

    overlapReset(): void {
        this.economyRiskSettings.resetValue(this.propertyList.OVERLAP);
        this.calledAfterOverlapReset = this.economyRiskSettings.setDefaultOverlap();
        this.updateRiskSettingFlag.emit();
    }

    /**
     * OVerlap chang handler
     */
    onOverlapChanged(ev: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        this.economyRiskSettings.overlap = Number(ev.detail.value);
        this.economyRiskSettings.selectedOverlap = Number(ev.detail.value);
        this.handleChangeInSchemeAndReassignList();
        this.updateRiskSettingFlag.emit();
    }


    setIsOverlapEnabled(): void {
        this.isOverlapEnabled = this.overlapEnabledWeighingSchemes.includes(this.economyRiskSettings.weightingScheme);
    }


    /******* Common Routines *******/

    private handleChangeInSchemeAndReassignList(): void {
        this.economyRiskSettings.handleChangeInWeightingSchemeDependents();
        this.refreshWeightingList();
    }

    private refreshSelectOptionList(selectList: ExploreSelectOptionGroup[], key: string, refreshFromDependent?: boolean): ExploreSelectOptionGroup[] {
        selectList[0].values.forEach(weightingScheme => weightingScheme.isSelected = false);
        const filteredSelectList = selectList[0].values.filter(weightingScheme => weightingScheme.value === this.economyRiskSettings[key]
            || weightingScheme.displayValue === this.economyRiskSettings[key]);
        if (filteredSelectList.length) {
            filteredSelectList[refreshFromDependent ? filteredSelectList.length - 1 : 0].isSelected = true;
        }
        return selectList.map(selectOption => selectOption);
    }

    refreshWeightingList(): void {
        this.weightingSchemeList = [new ExploreSelectOptionGroup(this.economyRiskSettings.availableWeightingSchemes.map(weightingScheme => new ExploreSelectOption(weightingScheme.displayName, weightingScheme.value)))];
        this.weightingSchemeList = this.refreshSelectOptionList(this.weightingSchemeList, this.propertyList.WEIGHTING_SCHEME, true);
    }

    refreshRiskHorizonList(): void {
        this.riskHorizonList = this.refreshSelectOptionList(this.riskHorizonList, this.propertyList.RISK_HORIZON);
    }
}
