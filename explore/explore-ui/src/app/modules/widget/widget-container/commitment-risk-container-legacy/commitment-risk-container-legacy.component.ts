import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AuxTabBarItemInterface} from '@blk/aladdin-angular-components';
import {Widget} from '@models/widget/widget.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {CompositionConfig} from '@models/portfolio/composition/composition-config.model';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {
    CommitmentHorizonSelectedTab
} from '@models/widget/inputs/commitment-risk/commitment-horizon-selected-tab.model';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';
import {Vizualization} from '../../../../vizualizations/vizualization';

@Component({
  selector: 'app-commitment-risk-container-legacy',
  templateUrl: './commitment-risk-container-legacy.component.html',
  styleUrls: ['./commitment-risk-container-legacy.component.scss']
})
export class CommitmentRiskContainerLegacyComponent extends Vizualization implements OnInit, OnChanges {
    readonly TABLE_KEY = 'table';
    widgetTabs: AuxTabBarItemInterface[];
    selectedTab: AuxTabBarItemInterface;
    // default to the first tab - "Value Of Private Equity"
    isChartMode = true;
    fundCusip: string;

    @Input() widget: Widget;
    @Input() portfolio: Portfolio;

    @Input() set widgetPayload(widgetPayload: WidgetPayload) {
        this._widgetPayload = widgetPayload;
    }

    _widgetPayload: WidgetPayload;
    @Input() compositionConfig: CompositionConfig;

    @Output() notifyWidgetToRefresh$ = new EventEmitter();

    ngOnInit(): void {
        this.widgetTabs = [
            {label: 'NAV', uid: 'market_val'},
            {label: 'Capital Called', uid: 'contributions'},
            {label: 'Capital Distributed', uid: 'distributions'},
            {label: 'Cash Position', uid: 'commitment'},
            {label: 'Statistics', uid: this.TABLE_KEY}
        ];
        if (this.widget) {
            this.isChartMode = this.widget.configType === WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY;
            if (this.widget.getCombinedInputs().get(CommitmentHorizonSelectedTab.configType)) {
                const selectedTabUid = (this.widget.getCombinedInputs().get(CommitmentHorizonSelectedTab.configType) as CommitmentHorizonSelectedTab).selectedTab;
                this.selectedTab = this.widgetTabs.find(tab => tab.uid === selectedTabUid);
            } else {
                this.selectedTab = this.isChartMode ? this.widgetTabs[0] : this.widgetTabs[4];
            }
            if (this.widget.getCombinedInputs().get(WidgetInputType.FUND_CUSIP)) {
                this.fundCusip = (this.widget.getCombinedInputs().get(WidgetInputType.FUND_CUSIP) as FundCusip).cusip;
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.portfolio?.currentValue && changes.portfolio?.previousValue) {
            this.widget.dataStore.metaData.inputs.delete(WidgetInputType.FUND_CUSIP);
            this.fundCusip = undefined;
            this.notifyWidgetToRefresh$.emit();
        }
    }

    /**
     * OnTabSelected
     * Hold the logic to refresh the widget and update widget inputs everytime tab is changed
     */
    onTabSelected(event: CustomEvent): void {
        this.selectedTab = event.detail;
        const isChangingBetweenChartAndTable = (this.isChartMode && this.selectedTab.uid === this.TABLE_KEY) || (!this.isChartMode && this.selectedTab.uid !== this.TABLE_KEY);
        this.widget.dataStore.metaData.inputs.set(CommitmentHorizonSelectedTab.configType, new CommitmentHorizonSelectedTab({selectedTab: this.selectedTab.uid}));

        if (isChangingBetweenChartAndTable) {
            this.isChartMode = !this.isChartMode;
            this._widgetPayload = undefined;
            this.widget.configType = this.isChartMode ? WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY : WidgetConfigType.COMMITMENT_RISK_LEGACY;
            this.notifyWidgetToRefresh$.emit();
        }
    }

    /**
     * update the selected fund and refresh the widget
     * @param fundCusip
     */
    updateFundCusip(fundCusip: string) {
        this.fundCusip = fundCusip;
        this.widget.dataStore.metaData.inputs.set(WidgetInputType.FUND_CUSIP, new FundCusip(fundCusip));
        this.notifyWidgetToRefresh$.emit();
    }
}
