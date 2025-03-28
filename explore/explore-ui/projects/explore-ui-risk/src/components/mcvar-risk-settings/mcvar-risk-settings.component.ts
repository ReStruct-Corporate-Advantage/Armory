import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
    AuxCheckboxChangedDetailInterface,
    AuxNumericStepperValueChangedDetailInterface,
    AuxSelectOption,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface,
    AuxValuePairInterface
} from '@blk/aladdin-angular-components';
import { CoreRiskConstants } from '../../core-risk.constants';
import { CoreAppUtils, ExploreSelectOption, ExploreSelectOptionGroup, UserMetaDataUtils } from '@blk/explore-ui-core';
import { MCVaRRiskSettingsModel} from '../../models/mcvar-risk-settings/mcvar-risk-settings.model';
import { isNil, isUndefined } from 'lodash';
import {RiskSettings} from '../../models/risk-settings/risk-settings.model';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'explore-risk-mcvar-risk-settings',
  templateUrl: './mcvar-risk-settings.component.html'
})
export class McvarRiskSettingsComponent implements OnInit {

    @Input() riskSettingsModel: RiskSettings;
    @Input() isRiskSettingChanged$: BehaviorSubject<boolean>;
    @Input() widgetType: string;

    @Output() updateRiskSettingFlag: EventEmitter<boolean> = new EventEmitter<boolean>();

    docUrl =  '/literature/aladdin-product-update/mcvar-solution-guide.pdf';

    mcvarRiskSettingsModel: MCVaRRiskSettingsModel;

    distributionTypeSelectOptionGroup: AuxSelectOptionGroup[];
    pricingTypeSelectOptionGroup: AuxSelectOptionGroup[];
    idioCalculationSelectOptionGroup: AuxSelectOptionGroup[];

    samples: number;
    seed: number;
    includeTimeReturn: boolean;
    useImportanceSampling: boolean;
    degreesOfFreedom: string;

    confidenceLevelValuePair: AuxValuePairInterface[];
    returnHorizonValue: string;
    riskHorizonValue: string;

    isItColumnLevelRiskSettings = false;

    protected readonly CoreRiskConstants = CoreRiskConstants;

    ngOnInit(): void {
        if (CoreAppUtils.isExternalBENClient()) {
            const userOrg = UserMetaDataUtils.getUserPerm('userOrg');
            this.docUrl = `${userOrg}/risk` + this.docUrl;
        } else {
            this.docUrl = 'acs' + this.docUrl;
        }
        this._calculateDefaultRiskSettings();
        this.mcvarRiskSettingsModel = this.riskSettingsModel.mcvarRiskSettings;
        this.isItColumnLevelRiskSettings = this.mcvarRiskSettingsModel.name === CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN;
        this.distributionTypeSelectOptionGroup = [new ExploreSelectOptionGroup()];
        this.distributionTypeSelectOptionGroup[0].values = CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES.map((dt, index) => new ExploreSelectOption(dt.label, dt.value, isUndefined(this.mcvarRiskSettingsModel.distributionType) ? index === 0 : dt.value === this.mcvarRiskSettingsModel.distributionType));
        this.degreesOfFreedom = isNil(this.mcvarRiskSettingsModel.degreesOfFreedom) ? MCVaRRiskSettingsModel.DEFAULT_DEGREES_OF_FREEDOM : this.mcvarRiskSettingsModel.degreesOfFreedom.toString();
        this.pricingTypeSelectOptionGroup = [new ExploreSelectOptionGroup()];
        this.pricingTypeSelectOptionGroup[0].values = CoreRiskConstants.MCVAR_PRICING_TYPES.map((pt, index) => new ExploreSelectOption(pt.label, pt.value, isUndefined(this.mcvarRiskSettingsModel.pricingType) ? index === 0 : pt.value === this.mcvarRiskSettingsModel.pricingType));
        this.idioCalculationSelectOptionGroup = [new ExploreSelectOptionGroup()];
        this.idioCalculationSelectOptionGroup[0].values = CoreRiskConstants.MCVAR_IDIO_CALCS.map((ic, index) => new ExploreSelectOption(ic.label, ic.value, isUndefined(this.mcvarRiskSettingsModel.idiosyncraticCorrelation) ? index === 0 : ic.value === this.mcvarRiskSettingsModel.idiosyncraticCorrelation));
        this.samples = isNil(this.mcvarRiskSettingsModel.samples) ? MCVaRRiskSettingsModel.DEFAULT_SAMPLES : this.mcvarRiskSettingsModel.samples;
        this.seed = isNil(this.mcvarRiskSettingsModel.seed) ? MCVaRRiskSettingsModel.DEFAULT_SEED : this.mcvarRiskSettingsModel.seed;
        this.includeTimeReturn = isNil(this.mcvarRiskSettingsModel.includeTimeReturn) ? true : this.mcvarRiskSettingsModel.includeTimeReturn;
        if (this.mcvarRiskSettingsModel.useImportanceSampling === false) {
            this.useImportanceSampling = undefined;
        }
        this.useImportanceSampling = isNil(this.mcvarRiskSettingsModel.useImportanceSampling)
            ? false
            : this.mcvarRiskSettingsModel.useImportanceSampling;
        this.isRiskSettingChanged$.subscribe(_changed => this._calculateDefaultRiskSettings());
    }

    _calculateDefaultRiskSettings(): void {
        const confidenceLevelPercentValue = this.riskSettingsModel?.economyRiskSettings?.confidenceLevelPercentage + '%';
        const confidenceLevelSDValue = this.riskSettingsModel?.economyRiskSettings?.confidenceLevelSD + 'σ';
        this.confidenceLevelValuePair = [{label: 'Confidence Level', value: confidenceLevelPercentValue}, {label: 'or', value: confidenceLevelSDValue}];
        this.returnHorizonValue = this.riskSettingsModel.economyRiskSettings.availableWeightingSchemes
            .find(ws => ws.value === this.riskSettingsModel.economyRiskSettings.weightingScheme)?.displayName;
        this.riskHorizonValue = this.riskSettingsModel.economyRiskSettings.riskHorizons
            .find(riskHorizon => Number(riskHorizon.value) === this.riskSettingsModel.economyRiskSettings.riskHorizon)?.text;
    }

    onUseImportanceSamplingChange(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.useImportanceSampling = event.detail.value.checked;
        if (!this.useImportanceSampling) {
            this.mcvarRiskSettingsModel.useImportanceSampling = undefined;
        } else {
            this.mcvarRiskSettingsModel.useImportanceSampling = this.useImportanceSampling;
        }
        this.updateRiskSettingFlag.emit();
    }

    onDistributionTypeSelectionChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const selectedDistributionType = (event.detail.value as AuxSelectOption).value;
        if (selectedDistributionType) {
            this.mcvarRiskSettingsModel.distributionType = selectedDistributionType;
        } else {
            this.mcvarRiskSettingsModel.distributionType = undefined;
            this.mcvarRiskSettingsModel.degreesOfFreedom = undefined;
        }
        this.updateRiskSettingFlag.emit();
    }

    shouldShowDegreesOfFreedom(): boolean {
        return CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[1].value === this.mcvarRiskSettingsModel.selfDistributionType() || (isNil(this.mcvarRiskSettingsModel.selfDistributionType()) && CoreRiskConstants.MCVAR_DISTRIBUTION_TYPES[1].value === this.mcvarRiskSettingsModel.distributionType);
    }

    onSamplesValueChange(event: KeyboardEvent): void {
        const target = event.target as EventTarget & {value: string};
        let samples = Number(target.value);
        if (isNaN(samples) || samples === 0 || samples > 100000) {
            samples = MCVaRRiskSettingsModel.DEFAULT_SAMPLES;
            target.value = String(samples);
        }
        if (samples && MCVaRRiskSettingsModel.DEFAULT_SAMPLES !== samples) {
            this.mcvarRiskSettingsModel.samples = samples;
        } else {
            this.mcvarRiskSettingsModel.samples = undefined;
        }
        this.updateRiskSettingFlag.emit();
    }

    onSeedValueChange(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        const seed = event.detail.value;
        if (seed && MCVaRRiskSettingsModel.DEFAULT_SEED !== seed) {
            this.mcvarRiskSettingsModel.seed = seed;
        } else {
            this.mcvarRiskSettingsModel.seed = undefined;
        }
        this.updateRiskSettingFlag.emit();
    }

    onPricingTypeOptionChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const pricingType = (event.detail.value as AuxSelectOption).value;
        if (pricingType && pricingType !== CoreRiskConstants.MCVAR_PRICING_TYPES[0].value) {
            this.mcvarRiskSettingsModel.pricingType = pricingType;
        } else {
            this.mcvarRiskSettingsModel.pricingType = undefined;
        }
        this.updateRiskSettingFlag.emit();
    }

    onIncludeTimeReturnChange(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.includeTimeReturn = event.detail.value.checked;
        if (this.includeTimeReturn) {
            this.mcvarRiskSettingsModel.includeTimeReturn = undefined;
        } else {
            this.mcvarRiskSettingsModel.includeTimeReturn = false;
        }
        this.updateRiskSettingFlag.emit();
    }

    onIdioSyncraticCorrelationOptionChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const idioSyncCorrelation = (event.detail.value as AuxSelectOption).value;
        if (idioSyncCorrelation && idioSyncCorrelation !== CoreRiskConstants.MCVAR_IDIO_CALCS[0].value) {
            this.mcvarRiskSettingsModel.idiosyncraticCorrelation = idioSyncCorrelation;
        } else {
            this.mcvarRiskSettingsModel.idiosyncraticCorrelation = undefined;
        }
        this.updateRiskSettingFlag.emit();
    }

    onDegreesOfFreedomChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        const degreesOfFreedom = event.detail.value;
        if (degreesOfFreedom && parseInt(MCVaRRiskSettingsModel.DEFAULT_DEGREES_OF_FREEDOM, 10) !== degreesOfFreedom) {
            this.mcvarRiskSettingsModel.degreesOfFreedom = degreesOfFreedom;
        } else {
            this.mcvarRiskSettingsModel.degreesOfFreedom = undefined;
        }
        this.updateRiskSettingFlag.emit();
    }
}
