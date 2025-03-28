import {Component, Input, OnInit} from '@angular/core';
import {AuxSelectOptionGroup} from '@blk/aladdin-angular-components';
import {
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    TokenUtils,
    WidgetInput
} from '@blk/explore-ui-core';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {RiskConstants} from '@constants/risk.constants';
import {RiskColumnSettings} from '@models/riskSettings/risk-column-settings.model';
import {cloneDeep} from 'lodash';
import {WidgetSettingsStore} from '../widget-settings.store';

@Component({
    selector: 'app-factor-based-widget-quick-columnset',
    templateUrl: './factor-based-widget-quick-columnset.component.html',
    styleUrls: ['./factor-based-widget-quick-columnset.component.scss']
})
/**
 * Component for the quick column set in FBA.
 */
export class FactorBasedWidgetQuickColumnsetComponent implements OnInit {
    @Input() inputs: Map<string, WidgetInput>;

    quickColumnSet: AuxSelectOptionGroup[];
    groupingSet: AuxSelectOptionGroup[];
    riskColumnSettings: RiskColumnSettings;

    /**
     * constructor
     */
    constructor(private widgetSettingsStore: WidgetSettingsStore) {
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        // Get Risk Column Settings
        this.riskColumnSettings = this.inputs.get(CoreRiskConstants.CONFIG_TYPE.RISK_COLUMN_SETTINGS) as RiskColumnSettings;
        if (!this.riskColumnSettings.groupingTypeSelected) {
            this.riskColumnSettings.groupingTypeSelected = cloneDeep(RiskConstants.PRA_GROUPING_SET[0]);
        }
        if (!this.riskColumnSettings.columnSetSelected) {
            this.riskColumnSettings.columnSetSelected = cloneDeep(RiskConstants.PRA_QUICK_COLUMN_SET[0]);
        }

        this.quickColumnSet = [new ExploreSelectOptionGroup([])];

        // set default quick column set.
        RiskConstants.PRA_QUICK_COLUMN_SET.forEach(riskSetting => {
            const tokenValue = riskSetting.token ? TokenUtils.isFeatureEnabled(riskSetting.token) : true;
            if (tokenValue) {
                const columnSetOption: ExploreSelectOption = new ExploreSelectOption(riskSetting.label, riskSetting, this.riskColumnSettings.columnSetSelected.label === riskSetting.label);
                this.quickColumnSet[0].values.push(columnSetOption);
            }
        });

        // set default grouping type.
        this.groupingSet = [new ExploreSelectOptionGroup([])];
        RiskConstants.PRA_GROUPING_SET.forEach(riskSetting => {
            const groupingSetOption: ExploreSelectOption = new ExploreSelectOption(riskSetting.label, riskSetting, this.riskColumnSettings.groupingTypeSelected.label === riskSetting.label);
            if (groupingSetOption.isSelected) {
                this.widgetSettingsStore.groupingTypeChanged$.next(riskSetting.matchingRiskCategory);
            }
            this.groupingSet[0].values.push(groupingSetOption);
        });
    }

    /**
     * Set Quick column set for FBA
     */
    setQuickColumnSet(columnSetObject: { label: string; value: string }): void {
        // no need to emit if selection was not changed.
        if (this.riskColumnSettings.columnSetSelected.label === columnSetObject.label) {
            return;
        }
        this.riskColumnSettings.columnSetSelected = columnSetObject;
        this.widgetSettingsStore.quickColumnSetChanged$.next(columnSetObject.value);
    }

    /**
     * Changes the widget level settings based on the groping type selected.
     */
    setGroupingType(groupingTypeObject: { label: string; value: string; matchingRiskCategory: string }): void {
        // no need to process if selection was not changed.
        if (this.riskColumnSettings.groupingTypeSelected.label === groupingTypeObject.label) {
            return;
        }
        const groupingType: string = groupingTypeObject.value;
        if (groupingType === RiskConstants.PRA_GROUPING_TYPE.FACTOR) {
            this.setRiskColumnSettings(false, true, false, false);
        } else if (groupingType === RiskConstants.PRA_GROUPING_TYPE.SECTOR) {
            this.setRiskColumnSettings(false, false, true, false);
        } else if (groupingType === RiskConstants.PRA_GROUPING_TYPE.SECTOR_TO_FACTOR) {
            this.setRiskColumnSettings(false, false, false, false);
        } else if (groupingType === RiskConstants.PRA_GROUPING_TYPE.PORTFOLIO_GROUP) {
            this.setRiskColumnSettings(false, true, true, true);
        }
        this.riskColumnSettings.groupingTypeSelected = groupingTypeObject;
        this.widgetSettingsStore.groupingTypeChanged$.next(groupingTypeObject.matchingRiskCategory);
    }

    /**
     * sets the widget properties for essentially report selection.
     */
    private setRiskColumnSettings(showSecurities: boolean, disableSectorBreakdown: boolean, disableFactorBreakdown: boolean, isPortGroupSummaryRequest: boolean) {
        this.riskColumnSettings.showSecurities = showSecurities;
        this.riskColumnSettings.disableSectorBreakdown = disableSectorBreakdown;
        this.riskColumnSettings.disableFactorBreakdown = disableFactorBreakdown;
        this.riskColumnSettings.isPortGroupSummaryRequest = isPortGroupSummaryRequest;
    }
}
