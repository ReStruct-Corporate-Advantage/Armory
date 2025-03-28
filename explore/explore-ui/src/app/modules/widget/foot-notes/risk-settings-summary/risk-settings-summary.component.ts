import {Component, Input} from '@angular/core';
import {CoreRiskConstants} from '@blk/explore-ui-risk';

/**
 * Risk Settings Summary Component
 */
@Component({
    selector: 'app-risk-settings-summary',
    templateUrl: './risk-settings-summary.component.html',
    styleUrls: ['../foot-notes.component.scss']
})
export class RiskSettingsSummaryComponent {
    @Input() riskSettingsSummaryDetails: {valueList: string[], sourceList: string[]};
    @Input() hvarRiskSettingsSummaryDetail: Map<string, {value: string | number, source: string}>;
    @Input() mcvarRiskSettingsSummaryDetail: Map<string, {value: string | number, source: string}>;

    readonly tableHeaders = ['Risk Setting', 'Value', 'Source'];
    readonly riskSettingsLabelList = [
        CoreRiskConstants.LABEL.RISK_MODEL,
        CoreRiskConstants.LABEL.ECONOMY_DATE,
        CoreRiskConstants.LABEL.WEIGHTING_SCHEME,
        CoreRiskConstants.LABEL.PERIOD,
        CoreRiskConstants.LABEL.HALF_LIFE,
        CoreRiskConstants.LABEL.RISK_HORIZON,
        CoreRiskConstants.LABEL.CONFIDENCE_LEVEL,
    ];

    protected readonly Object = Object;

    asIsOrder(_a, _b) {
        return 1;
    }
}
