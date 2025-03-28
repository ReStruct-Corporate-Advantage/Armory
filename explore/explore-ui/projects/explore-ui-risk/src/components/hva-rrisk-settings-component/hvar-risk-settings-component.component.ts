import {Component, Input, OnInit} from '@angular/core';
import {HvarRiskSettingsModel} from '../../models/hvar-risk-settings/hvar-risk-settings.model';
import {
    AuxCheckboxChangedDetailInterface,
    AuxNumericStepperValueChangedDetailInterface, AuxSelectOption, AuxSelectSelectionChangedDetailInterface,
    AuxTextInputBlurDetailInterface,
} from '@blk/aladdin-angular-components';
import {isNumber, isUndefined} from 'lodash';
import {CoreRiskConstants} from '../../core-risk.constants';
import {Gaussian} from 'ts-gaussian';
import {AdvancedHvarRiskSettingsModel} from '../../models/advance-hvar-risk-settings/advanced-hvar-risk-settings.model';
import {HvarRiskSettingsTrimmedComponentComponent} from './hvar-risk-settings-trimmed-component.component';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';

@Component({
    selector: 'explore-risk-hvar-risk-settings-component',
    templateUrl: './hvar-risk-settings-component.component.html',
    styleUrls: ['./hvar-risk-settings-component.component.scss', '../../../styles/common-risk-styles.scss']
})
export class HvarRiskSettingsComponentComponent extends HvarRiskSettingsTrimmedComponentComponent implements OnInit {

    @Input() hvarRiskSettingsModel: HvarRiskSettingsModel;

    confidenceLevelPercentage: number;
    confidenceLevelSD: number;
    dailyOverlappingObservation: boolean;
    selectedConfidenceIntervalScaling: number;
    riskHorizons: ExploreSelectOptionGroup[];
    isOtherRiskHorizonSelected: boolean;
    otherRiskHorizonValue: number;

    ngOnInit(): void {
        super.ngOnInit();
        const defaultConfidenceLevelPercent = isUndefined(this.hvarRiskSettingsModel.confidenceLevelPercentage) ? HvarRiskSettingsModel.DEFAULT_CONFIDENCE_LEVEL  : this.hvarRiskSettingsModel.confidenceLevelPercentage;
        this.confidenceLevelPercentage = defaultConfidenceLevelPercent;
        this.confidenceLevelSD = HvarRiskSettingsTrimmedComponentComponent.computeConfidenceLevelSD(defaultConfidenceLevelPercent);
        this.dailyOverlappingObservation = isUndefined(this.hvarRiskSettingsModel.dailyOverlappingObservation) ? true  : this.hvarRiskSettingsModel.dailyOverlappingObservation;
        this.hvarRiskSettingsModel.version = 'default';
        const availableHoldingPeriod = this.hvarRiskSettingsModel?.advancedHvarRiskSettings?.holdingPeriod;
        const riskHorizonOptions: ExploreSelectOption[] = CoreRiskConstants.HVAR_RISK_HORIZONS.map(item => new ExploreSelectOption(item.label, item.value, item.value === availableHoldingPeriod && !isUndefined(availableHoldingPeriod)));
        if (!isUndefined(availableHoldingPeriod) && CoreRiskConstants.HVAR_RISK_HORIZONS.findIndex(item => item.value === availableHoldingPeriod) < 0) {
            riskHorizonOptions[riskHorizonOptions.length - 1].isSelected = true;
            this.isOtherRiskHorizonSelected = true;
            this.otherRiskHorizonValue = availableHoldingPeriod;
        }
        if (isUndefined(availableHoldingPeriod)) {
            riskHorizonOptions[0].isSelected = true;
        }
        this.riskHorizons = [new ExploreSelectOptionGroup(riskHorizonOptions)];

        this._initAdvancedHvarRiskSettings();
    }

    private _initAdvancedHvarRiskSettings(): void {
        if (!isUndefined(this.hvarRiskSettingsModel.advancedHvarRiskSettings)) {
            if (!isUndefined(this.hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod)) {
                this.holdingPeriod = this.hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod;
            }
            const confidenceLevelToScale = this.hvarRiskSettingsModel.advancedHvarRiskSettings.confidenceIntervalScaling;
            if (!isUndefined(confidenceLevelToScale) && confidenceLevelToScale >= this.confidenceLevelPercentage) {
                this.selectedConfidenceIntervalScaling = this.hvarRiskSettingsModel.advancedHvarRiskSettings.confidenceIntervalScaling;
            } else {
                console.warn(`confidenceLevelToScale=${confidenceLevelToScale} is less than confidenceLevelPercentage=${this.hvarRiskSettingsModel.confidenceLevelPercentage}`);
                this.hvarRiskSettingsModel.resetValue(this.propertyList.CONFIDENCE_INTERVAL_SCALE);
            }
        }
    }

    /**
     * Confidence level % changed handler
     */
    onConfidenceLevelPercentChanged(ev: CustomEvent<AuxTextInputBlurDetailInterface>): void {
        if (this.validator[0].validate((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value)) {
            const changedConfidenceLevel = Number((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value);
            let confidenceLevelPercentage: number;
            let confidenceLevelSD: number;
            if (!isNumber(changedConfidenceLevel)) {confidenceLevelPercentage = CoreRiskConstants.RISK_SETTING_DEFAULTS.DEFAULT_CONFIDENCE_LEVEL_IN_PERCENTAGE;
                confidenceLevelSD = CoreRiskConstants.RISK_SETTING_DEFAULTS.DEFAULT_CONFIDENCE_LEVEL_IN_STD_DEVIATION;
            } else {
                confidenceLevelPercentage = changedConfidenceLevel;
                confidenceLevelSD = HvarRiskSettingsTrimmedComponentComponent.computeConfidenceLevelSD(confidenceLevelPercentage);
            }
            this.hvarRiskSettingsModel.confidenceLevelPercentage = confidenceLevelPercentage;
            this.confidenceLevelPercentage = confidenceLevelPercentage;
            this.confidenceLevelSD = confidenceLevelSD;
            this.updateRiskSettingFlag.emit();
        }
    }

    /**
     * Confidence level SD changed handler
     */
    onConfidenceLevelSDChanged(ev: CustomEvent<AuxTextInputBlurDetailInterface>): void {
        if (this.validator[0].validate((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value)) {
            const changedConfidenceLevel = Number((ev.detail.srcEvent.target as HTMLAuxTextInputElement).value);
            let confidenceLevelPercentage;
            let confidenceLevelSD;
            if (!isNumber(changedConfidenceLevel)) {
                confidenceLevelPercentage = CoreRiskConstants.RISK_SETTING_DEFAULTS.DEFAULT_CONFIDENCE_LEVEL_IN_PERCENTAGE;
                confidenceLevelSD = CoreRiskConstants.RISK_SETTING_DEFAULTS.DEFAULT_CONFIDENCE_LEVEL_IN_STD_DEVIATION;
            } else {
                confidenceLevelSD = changedConfidenceLevel;
                confidenceLevelPercentage = this._computeConfidenceLevelPercent(confidenceLevelSD);
            }
            this.hvarRiskSettingsModel.confidenceLevelPercentage = confidenceLevelPercentage;
            this.confidenceLevelPercentage = confidenceLevelPercentage;
            this.confidenceLevelSD = confidenceLevelSD;
            this.updateRiskSettingFlag.emit();
        }
    }

    onDailyOverlappingObservationsChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.hvarRiskSettingsModel.dailyOverlappingObservation = event.detail.value.checked;
        // Trigger the update of the settings.
        this.updateRiskSettingFlag.emit();
    }

    private _computeConfidenceLevelPercent(confidenceLevelSD: number): number {
        return +(new Gaussian(0, 1).cdf(confidenceLevelSD) * 100).toFixed(4);
    }

    onRiskHorizonChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const selectedOptionValue = (event.detail.value as AuxSelectOption).value;
        if (isUndefined(selectedOptionValue)) {
            this.isOtherRiskHorizonSelected = false;
            this.otherRiskHorizonValue = undefined;
            if (!isUndefined(this.hvarRiskSettingsModel?.advancedHvarRiskSettings?.holdingPeriod)) {
                this.hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod = undefined;
            }
        } else {
            if (selectedOptionValue < 0) {
                this.isOtherRiskHorizonSelected = true;
                this.otherRiskHorizonValue = undefined;
                if (!isUndefined(this.hvarRiskSettingsModel?.advancedHvarRiskSettings?.holdingPeriod)) {
                    this.hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod = undefined;
                }
            } else {
                this.isOtherRiskHorizonSelected = false;
                this._ensureHasAdvancedSettings();
                this.hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod = selectedOptionValue;
            }
        }
    }

    onOtherRiskHorizonValueChange(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        const otherRiskHorizonValueSelected = event.detail.value;
        if (otherRiskHorizonValueSelected) {
            this._ensureHasAdvancedSettings();
            this.hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod = otherRiskHorizonValueSelected;
        }
    }

    onConfidenceIntervalScalingChange(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        let confidenceIntervalScaling = Number(event.detail.value);
        if (Number.isFinite(confidenceIntervalScaling)) {
            confidenceIntervalScaling = confidenceIntervalScaling === 0 ? undefined : confidenceIntervalScaling;
            this._ensureHasAdvancedSettings();
            this.hvarRiskSettingsModel.advancedHvarRiskSettings.confidenceIntervalScaling = confidenceIntervalScaling;
            this.updateRiskSettingFlag.emit();
        }
    }

    private _ensureHasAdvancedSettings(): void {
        if (!this.hvarRiskSettingsModel.doesValueExist(CoreRiskConstants.HVAR_RISK_SETTINGS_PROPERTIES.ADVANCED_HVAR_RISK_SETTINGS)) {
            this.hvarRiskSettingsModel.advancedHvarRiskSettings = new AdvancedHvarRiskSettingsModel((this.hvarRiskSettingsModel.parentRiskSettings as HvarRiskSettingsModel)?.advancedHvarRiskSettings, this.hvarRiskSettingsModel.name);
        }
    }
}
