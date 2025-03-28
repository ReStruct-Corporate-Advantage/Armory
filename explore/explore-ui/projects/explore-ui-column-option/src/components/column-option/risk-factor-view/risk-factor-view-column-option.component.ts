import {Component} from '@angular/core';
import {ColumnOptionAttribute} from '@blk/explore-ui-core';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {BaseColumnOptionComponent} from '../base-column-option.component';

/**
 * Component for the risk settings column options.
 * It will be dynamically created in the container object of column-option component.
 */
@Component({
    selector: 'explore-risk-factor-view-column-option',
    templateUrl: './risk-factor-view-column-option.component.html'
})
export class RiskFactorViewColumnOptionComponent extends BaseColumnOptionComponent<RiskSettings> {

    static OPTION_KEY = 'riskSettings';

    dependsOnExposure = false;
    dependsOnEconomy = false;
    showHVARSettings = false;
    showTrimmedHVARSettings = false;
    showMCVARSettings = false;

    /**
     * Init the component.
     */
    protected initializeComponent(): void {
        super.initializeComponent();

        this.option.columnOptionAttributes.forEach((columnOptionAttribute: ColumnOptionAttribute) => {
            switch (columnOptionAttribute.key) {
                case CoreRiskConstants.RISK_SETTING_TYPE.EXPOSURE:
                    this.dependsOnExposure = true;
                    break;
                case CoreRiskConstants.RISK_SETTING_TYPE.ECONOMY:
                    this.dependsOnEconomy = true;
                    break;
                case CoreRiskConstants.RISK_SETTING_TYPE.HVAR:
                    this.showHVARSettings = true;
                    break;
                case CoreRiskConstants.RISK_SETTING_TYPE.HVAR_TRIMMED:
                    this.showTrimmedHVARSettings = true;
                    break;
                case CoreRiskConstants.RISK_SETTING_TYPE.MCVAR:
                    this.showMCVARSettings = true;
                    break;
            }
        });
        this.optionValue.setSettingsSource(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);
    }

    /**
     * Get the config type that this object is configuring.
     */
    getOptionValueConfigType(): string {
        return RiskSettings.CONFIG_TYPE;
    }

}
