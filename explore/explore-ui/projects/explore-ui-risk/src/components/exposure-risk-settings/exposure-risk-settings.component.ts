import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {
    AuxSelectOption,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface, AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {
    CoreDefinitionStore,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    RiskModel,
    SubscribableComponent
} from '@blk/explore-ui-core';
import {cloneDeep, isUndefined} from 'lodash';
import {CoreRiskConstants} from '../../core-risk.constants';
import {ExposureSettings} from '../../models/exposure-settings/exposure-settings.model';

/**
 * Exposure risk settings Component
 *
 * @example
 *  <explore-risk-exposure-risk-settings #exposureRiskSettingsComponent
 *      [exposureRiskSettings]="riskSettings.exposureRiskSettings"
 *      [isSourceVisibleSub]="isSourceVisibleSub">
 *  </explore-risk-exposure-risk-settings>
 */
@Component({
    selector: 'explore-risk-exposure-risk-settings',
    templateUrl: './exposure-risk-settings.component.html',
    styleUrls: ['./exposure-risk-settings.component.scss']
})
export class ExposureRiskSettingsComponent extends SubscribableComponent implements OnInit, OnDestroy {
    @Input() exposureRiskSettings: ExposureSettings;
    @Output() updateRiskSettingFlag: EventEmitter<boolean> = new EventEmitter<boolean>();

    riskModels: RiskModel[];
    riskModelList: AuxSelectOptionGroup[];

    inputRiskModel: string;
    readonly otherRiskModel: ExploreSelectOption = new ExploreSelectOption('Other', '');
    readonly LABEL = CoreRiskConstants.LABEL;
    readonly propertyList = cloneDeep(CoreRiskConstants.EXPOSURE_SETTINGS_PROPERTIES);

    /**
     * Init hook
     */
    ngOnInit() {
        this.riskModels = cloneDeep(CoreDefinitionStore.riskModelList);
        this.checkGPDefault();
        this.refreshRiskModelList();
    }

    /**
     * Risk model selection handler
     */
    onRiskModelSelectionChanged(ev: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        const changedRiskModel = (ev.detail.value as AuxSelectOption).value;
        this.exposureRiskSettings.riskModel = changedRiskModel;
        this.inputRiskModel = changedRiskModel;
        this.updateRiskSettingFlag.emit();
    }

    onOtherRiskModelChange(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        const changedRiskModel = event.detail.value;
        this.exposureRiskSettings.riskModel = changedRiskModel;
        this.inputRiskModel = changedRiskModel;
        this.updateRiskSettingFlag.emit();
    }

    /**
     * Risk model reset handler
     */
    riskModelReset(): void {
        this.exposureRiskSettings.resetValue(this.propertyList.RISK_MODEL);
        this.riskModels = cloneDeep(CoreDefinitionStore.riskModelList);
        this.checkGPDefault();
        this.refreshRiskModelList();
        this.updateRiskSettingFlag.emit();
    }

    /**
     * If the value isn't defined by user, updates according to port or org defaults.
     */
    checkGPDefault(): void {
        const isRiskModelUndefined = isUndefined(this.exposureRiskSettings.riskModel);
        if (!isRiskModelUndefined) {
            this.inputRiskModel = this.exposureRiskSettings.riskModel;
        }
        if (this.exposureRiskSettings.doesValueExist(this.propertyList.RISK_MODEL) || isRiskModelUndefined) {
            return;
        }

        // doesnt exist. Add another item to list with this model as value and name it GP Default + first few characters of the model string
        if (this.exposureRiskSettings.getSourceName(this.propertyList.RISK_MODEL) === CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT) {
            this.riskModels.unshift(new RiskModel({
                Value: this.exposureRiskSettings.riskModel,
                Label: CoreRiskConstants.RISK_MODEL_TYPE.GP + ' (' + this.exposureRiskSettings.riskModel.substring(0, 10) + ')'
            }));
        } else {
            for (let i = 0, l = this.riskModels.length; i < l; i++) {
                if (this.riskModels[i].value === CoreRiskConstants.RISK_MODEL_TYPE.DEFAULT) {
                    this.riskModels[i] = new RiskModel({
                        Value: this.exposureRiskSettings.riskModel,
                        Label: CoreRiskConstants.RISK_MODEL_TYPE.ORG
                    });
                    break;
                }
            }
        }
    }

    /**
     * Function to refresh risk model list
     */
    refreshRiskModelList(): void {
        const riskModelSelecOptions: ExploreSelectOption[] = this.riskModels.map(model => new ExploreSelectOption(model.label, model.value));
        riskModelSelecOptions.push(this.otherRiskModel);
        this.riskModelList = [new ExploreSelectOptionGroup(riskModelSelecOptions)];
        this.riskModelList[0].values.forEach(riskModel => riskModel.isSelected = false);
        const filteredRiskModelList = this.riskModelList[0].values.filter(riskModel => riskModel.value === this.exposureRiskSettings.riskModel);
        // we need to check whether isSelected is assigned to the correct riskModel since the length of the filteredRiskModelList can be greater than 1 because of checkGPDefault()
        if (filteredRiskModelList.length > 1) {
            filteredRiskModelList[1].isSelected = true;
        } else if (filteredRiskModelList.length === 1) {
            filteredRiskModelList[0].isSelected = true;
        } else if (filteredRiskModelList.length === 0) {
            this.otherRiskModel.isSelected = true;
            this.inputRiskModel = this.exposureRiskSettings.riskModel;
        }
        this.riskModelList = this.riskModelList.map(riskModel => riskModel);
    }
}
