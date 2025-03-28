import {Component} from '@angular/core';
import {isNil} from 'lodash';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {FactorDataChartSettings} from '@models/widget/inputs/chart-settings/factor-data-chart-settings.model';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';
import {FactorDataRiskMatrixSettings} from '@models/widget/inputs/factor-data-settings/factor-data-risk-matrix-settings.model';

/**
 * Factor Data Widget - Risk Settings tab component,
 * shows settings based on selection option on Factor Data Widget Chart Settings tab
 */
@Component({
    selector: 'app-factor-data-risk-settings',
    templateUrl: './factor-data-risk-settings.component.html',
    styleUrls: ['./factor-data-risk-settings.component.scss']
})
export class FactorDataRiskSettingsComponent  extends BaseWidgetSettingComponent<RiskSettings> {

    readonly CSS_CLASS_SET_HALF_WIDTH = 'set-width-half';
    readonly CSS_CLASS_SET_FULL_WIDTH = 'set-width-full';
    readonly CSS_CLASS_RISK_SETTINGS = 'layout-risk-settings float-left';
    readonly HIDE_MESSAGE = 'Note: Risk Settings have no impact in case of TimeSeries mode for ';

    comparisonMatrixRiskSettings: RiskSettings;
    showComparisonSettings = false;
    cssClassNameForRiskSettings: string;
    factorDataChartSettings: FactorDataChartSettings;
    hideRiskSettingsMessage: string;

    initializeComponent(): void {
        this.factorDataChartSettings = this.inputs.get(FactorDataChartSettings.configType) as FactorDataChartSettings;
        this.setDisplayMessageHideSettings();
        if (isNil(this.hideRiskSettingsMessage)) {
            this.setShowComparisonSettings();
            this.setClassNames();
        }
    }

    private setDisplayMessageHideSettings(): void {
        if (this.factorDataChartSettings.isTimeSeriesMode && this.factorDataChartSettings.factorTimeSeriesSelectedOption === FactorTimeSeriesSelectedOption.FACTOR_LEVELS) {
            this.hideRiskSettingsMessage = this.HIDE_MESSAGE + this.factorDataChartSettings.factorTimeSeriesSelectedOption;
        }
    }

    private setShowComparisonSettings(): void {
        const factorDataRiskMatrixSettings = this.inputs.get(FactorDataRiskMatrixSettings.configType) as FactorDataRiskMatrixSettings;

        if (!this.factorDataChartSettings.isTimeSeriesMode && !isNil(factorDataRiskMatrixSettings.comparisonDate)) {
            this.showComparisonSettings = true;
            this.comparisonMatrixRiskSettings = this.inputs.get(CoreRiskConstants.FACTOR_COMPARISON_MATRIX_RISK_SETTINGS) as RiskSettings;
        }
    }

    private setClassNames(): void {
        this.cssClassNameForRiskSettings =  this.CSS_CLASS_RISK_SETTINGS + ' ' + (this.showComparisonSettings ? this.CSS_CLASS_SET_HALF_WIDTH : this.CSS_CLASS_SET_FULL_WIDTH);
    }
}
