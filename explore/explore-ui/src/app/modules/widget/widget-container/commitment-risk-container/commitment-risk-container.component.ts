import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AuxTabBarItemInterface} from '@blk/aladdin-angular-components';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {Vizualization} from '../../../../vizualizations/vizualization';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';
import {
    CommitmentHorizonSelectedTab
} from '@models/widget/inputs/commitment-risk/commitment-horizon-selected-tab.model';
import {PortfolioSecurity} from '@interfaces/portfolio-security.interface';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {CommitmentRiskScenario} from '@models/widget/inputs/commitment-risk/commitment-risk-scenario.model';

@Component({
    selector: 'app-commitment-risk-container',
    templateUrl: './commitment-risk-container.component.html',
    styleUrls: ['./commitment-risk-container.component.scss']
})

export class CommitmentRiskContainerComponent extends Vizualization implements OnInit, OnChanges {

    readonly TABLE_KEY = 'table';

    @Input() widget: Widget;
    @Input() portfolio: Portfolio;
    @Input() set widgetPayload(widgetPayload: WidgetPayload) {
        this._widgetPayload = widgetPayload;
    }

    @Output() notifyWidgetToRefresh$ = new EventEmitter();
    @Output() spriteletLaunched = new EventEmitter<SpriteletEvent>();

    _widgetPayload: WidgetPayload;
    widgetTabs: AuxTabBarItemInterface[];
    selectedTab: AuxTabBarItemInterface;

    isChartMode = true;
    fundCusip: string;
    response: PortfolioSecurity[];
    commitmentRiskScenario: CommitmentRiskScenario;

    ngOnInit(): void {
        if (!this.widget) {
            return;
        }
        // widget tab names will be driven by the underlying chart column names
        const chartColumns = this.widget.getCombinedInputs().get(WidgetInputType.COMMITMENT_RISK_CHART_COLUMNS) as ColumnSet;
        this.widgetTabs = chartColumns.columns.map(col => ({
            label: col.columnTitle, uid: col.columnTag
        }));
        // final tab is the Statistics table
        this.widgetTabs.push({label: 'Statistics', uid: this.TABLE_KEY});

        // set selected tab to what was saved or default
        this.isChartMode = this.widget.configType === WidgetConfigType.COMMITMENT_RISK_CHART;
        if (this.widget.getCombinedInputs().has(WidgetInputType.COMMITMENT_RISK_SELECTED_TAB)) {
            const selectedTabUid = (this.widget.getCombinedInputs().get(WidgetInputType.COMMITMENT_RISK_SELECTED_TAB) as CommitmentHorizonSelectedTab).selectedTab;
            this.selectedTab = this.widgetTabs.find(tab => tab.uid === selectedTabUid);
        }
        this.selectedTab ||= this.isChartMode ? this.widgetTabs[0] : this.widgetTabs[4];

        if (this.widget.getCombinedInputs().has(WidgetInputType.FUND_CUSIP)) {
            this.fundCusip = (this.widget.getCombinedInputs().get(WidgetInputType.FUND_CUSIP) as FundCusip).cusip;
        } else {
            // if no private fund had been selected when the widget is launched, we show the portfolio level data by default
            this.defaultToPortfolioView();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.portfolio?.previousValue) {
            // if there has been a change made to the portfolio (excluding initial render),
            // clear out the fund cusip and default to portfolio view
            this.defaultToPortfolioView();
        }
    }

    /**
     * OnTabSelected
     * Hold the logic to refresh the widget and update widget inputs everytime tab is changed
     */
    onTabSelected(event: CustomEvent): void {
        // For some reason, event.detail doesn't give selectedTab anymore.
        // Find the selectedTab from the widgetTabs.
        this.selectedTab = this.widgetTabs.find(tab => tab.uid === event.detail.uid);
        const isChangingBetweenChartAndTable = (this.isChartMode && this.selectedTab.uid === this.TABLE_KEY) || (!this.isChartMode && this.selectedTab.uid !== this.TABLE_KEY);
        this.widget.dataStore.metaData.inputs.set(CommitmentHorizonSelectedTab.configType, new CommitmentHorizonSelectedTab({selectedTab: this.selectedTab.uid}));

        if (isChangingBetweenChartAndTable) {
            this.isChartMode = !this.isChartMode;
            this._widgetPayload = undefined;
            this.widget.configType = this.isChartMode ? WidgetConfigType.COMMITMENT_RISK_CHART : WidgetConfigType.COMMITMENT_RISK;
            this.notifyWidgetToRefresh$.emit();
        }
    }

    /**
     * update the selected fund and refresh the widget
     * @param fundCusip
     */
    updateFundCusip(fundCusip: string) {
        this.fundCusip = fundCusip;
        this.widget.dataStore.metaData.inputs.set(WidgetInputType.FUND_CUSIP, new FundCusip(this.fundCusip));
        this.notifyWidgetToRefresh$.emit();
    }

    /**
     * defaultToPortfolioView
     * Holds the logic for when Portfolio Level data needs to be shown by default
     */
    private defaultToPortfolioView() {
        // we set the Fund cusip to 'undefined' to display portfolio level data
        this.fundCusip = undefined;
        this.widget.dataStore.metaData.inputs.set(WidgetInputType.FUND_CUSIP, new FundCusip(this.fundCusip));
        this.commitmentRiskScenario = this.widget.getCombinedInputs().get(WidgetInputType.COMMITMENT_RISK_SCENARIO) as CommitmentRiskScenario;
    }

    /**
     * Check if we need to show warning banner or not
     */
    showWarningBanner(): boolean {
        const excludedFundsNumber = Number(this._widgetPayload?.responseConfig?.footerDetails?.missingExposures?.['excluded_funds_number']);
        return excludedFundsNumber && excludedFundsNumber > 0;
    }

}
