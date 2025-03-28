import * as definitions from '../../../mocks/definitions.json';

import riskExposure from '../../assets/widget-configs/risk-and-exposure-widget.json';
import bar from '../../assets/widget-configs/bar-chart-widget.json';
import clarity from '@assets/widget-configs/explore-clarity-ai-chart-widget.json';
import heatmap from '../../assets/widget-configs/heat-map-widget.json';
import treemap from '../../assets/widget-configs/tree-map-widget.json';
import pgsWidget from '../../assets/widget-configs/pgs-widget.json';
import pgsBarWidget from '../../assets/widget-configs/pgs-bar-widget.json';
import pgsTsWidget from '../../assets/widget-configs/pgs-ts-widget.json';
import returnsWidget from '../../assets/widget-configs/return-analysis-widget.json';

import commitmentRisk from '../../assets/widget-configs/commitment-risk-widget.json';
import commitmentRiskChart from '../../assets/widget-configs/commitment-risk-chart-widget.json';
import commitmentRiskLegacy from '../../assets/widget-configs/commitment-risk-widget-legacy.json';
import commitmentRiskChartLegacy from '../../assets/widget-configs/commitment-risk-chart-widget-legacy.json';
import commitmentRiskExcludedFunds from '../../assets/widget-configs/commitment-risk-excluded-funds-widget.json';

import returnsColumnSpritelet from '../../assets/widget-configs/return-column-spritelet-widget.json';
import returnsDrilldownSpritelet from '../../assets/widget-configs/return-drilldown-spritelet-widget.json';
import returnsPerformanceDetailsSpritelet from '../../assets/widget-configs/return-performance-details-widget.json';
import returnsTimeSeriesSpritelet from '../../assets/widget-configs/return-time-series-widget.json';

import returnChartWidget from '../../assets/widget-configs/return-chart-widget.json';
import expostStatsWidget from '../../assets/widget-configs/expost-stats-widget.json';
import expostReturnsWidget from '../../assets/widget-configs/expost-returns-widget.json';
import expostTimeSeriesWidget from '../../assets/widget-configs/expost-time-series-widget.json';
import praPie from '../../assets/widget-configs/pra-pie-widget.json';
import praBar from '../../assets/widget-configs/pra-bar-widget.json';
import praStackBar from '../../assets/widget-configs/pra-stack-bar-widget.json';
import praWidget from '../../assets/widget-configs/pra-widget.json';
import praFactorData from '../../assets/widget-configs/pra-factor-data-widget.json';
import pie from '../../assets/widget-configs/pie-chart-widget.json';
import scatter from '../../assets/widget-configs/scatter-plot-widget.json';
import slopeGraph from '../../assets/widget-configs/slope-graph-widget.json';
import ts from '../../assets/widget-configs/time-series-widget.json';
import pivotWidget from '../../assets/widget-configs/pivot-widget.json';
import praSecurityContribution from '../../assets/widget-configs/pra-security-contribution.json';
import cmbsMap from '../../assets/widget-configs/cmbs-map-widget.json';
import praTimeSeries from '../../assets/widget-configs/pra-time-series-widget.json';
import marginAnalyticsCassini from '../../assets/widget-configs/cassini-margin-analytics-widget.json';
import lookthroughSummaryWidget from '../../assets/widget-configs/lookthrough-summary-widget.json';
import pnlTsWidget from '../../assets/widget-configs/pnl-ts-widget.json';
import mcvarPnlTsWidget from '../../assets/widget-configs/mcvar-pnl-ts-widget.json';
import diversificationTsWidget from '../../assets/widget-configs/diversification-ts-widget.json';
import decarbonizationWidget from '../../assets/widget-configs/decarbonization-chart-widget.json';
import {WidgetConfigFactory} from '../factories';
import {Observable, of} from 'rxjs';
import {TestBed} from '@angular/core/testing';
import {MetadataModule} from '../modules/metadata/metadata.module';
import {HttpClient} from '@angular/common/http';
import {ConfigInitializer} from '../initializers/config.initializer';
import {DefinitionsService} from '../modules/metadata/definitions/definitions.service';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {ColumnSectorRule, CustomSectorType, GroupRule, SectorConstants} from '@blk/explore-ui-breakdown';
import {
    ColumnConstants,
    CoreDefinitionStore,
    CoreTestUtils,
    CoreUserMetaDataStore,
    UserMetaData
} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import FundSectoringConfig from '../../assets/fund-sectoring-config/fund-sectoring-config.json';

export class TestUtils {

    static initDefinitions(): void {
        DefinitionsService.initDefinitions(definitions);
    }

    static initialize(done: any) {
        ConfigInitializer.initializeConfig();
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.perfDataPerms = true;
        CoreUserMetaDataStore.userMetaData.userPermissionGroups = [];
        CoreUserMetaDataStore.userMetaData.allEnterprisePermissionGroups = [];
        TestUtils.initializeTokens();
        TestUtils.initDefinitions();
        TestUtils.initializeWidgetConfig(done);
        done();
    }

    static initializeTokens(): void {
        CoreDefinitionStore.tokens = {
            enableClarityAI: 'Y',
            enablePerfAttr: 'Y',
            enablePFMConnection: 'Y',
            explorePopupChart: 'Y',
            enableFactorAttribution: 'Y',
            exploreExcelFormat: 'xlsx',
            enableExpost: 'Y',
            enableOptimization: 'N',
            enableCommitmentRisk: 'Y',
            enableCommitmentRisk2: 'Y',
            enableAdvancedPraMode: 'N',
            enableIndexResearch: 'true',
            enableAdhocPort: 'Y',
            enableCassiniMarginAnalytics: 'Y',
            exploreEnableCombinedLRO: 'Y',
            exploreClimateEnabled: 'Y'
        };
    }

    static initializeWidgetConfig(done: any) {
        const httpMock = {
            get: jest.fn((url: string): Observable<any> => {
                if (url === 'assets/widget-configs/risk-and-exposure-widget.json') {
                    return of(riskExposure);
                } else if (url === 'assets/widget-configs/bar-chart-widget.json') {
                    return of(bar);
                } else if (url === 'assets/widget-configs/heat-map-widget.json') {
                    return of(heatmap);
                } else if (url === 'assets/widget-configs/tree-map-widget.json') {
                    return of(treemap);
                } else if (url === 'assets/widget-configs/pgs-widget.json') {
                    return of(pgsWidget);
                } else if (url === 'assets/widget-configs/return-analysis-widget.json') {
                    return of(returnsWidget);
                } else if (url === 'assets/widget-configs/return-column-spritelet-widget.json') {
                    return of(returnsColumnSpritelet);
                } else if (url === 'assets/widget-configs/return-drilldown-spritelet-widget.json') {
                    return of(returnsDrilldownSpritelet);
                } else if (url === 'assets/widget-configs/return-performance-details-widget.json') {
                    return of(returnsPerformanceDetailsSpritelet);
                } else if (url === 'assets/widget-configs/return-time-series-widget.json') {
                    return of(returnsTimeSeriesSpritelet);
                } else if (url === 'assets/widget-configs/return-chart-widget.json') {
                    return of(returnChartWidget);
                } else if (url === 'assets/widget-configs/expost-stats-widget.json') {
                    return of(expostStatsWidget);
                } else if (url === 'assets/widget-configs/expost-returns-widget.json') {
                    return of(expostReturnsWidget);
                } else if (url === 'assets/widget-configs/expost-time-series-widget.json') {
                    return of(expostTimeSeriesWidget);
                } else if (url === 'assets/widget-configs/pra-pie-widget.json') {
                    return of(praPie);
                } else if (url === 'assets/widget-configs/pra-bar-widget.json') {
                    return of(praBar);
                } else if (url === 'assets/widget-configs/pra-stack-bar-widget.json') {
                    return of(praStackBar);
                } else if (url === 'assets/widget-configs/pra-widget.json') {
                    return of(praWidget);
                } else if (url === 'assets/widget-configs/pie-chart-widget.json') {
                    return of(pie);
                } else if (url === 'assets/widget-configs/scatter-plot-widget.json') {
                    return of(scatter);
                } else if (url === 'assets/widget-configs/slope-graph-widget.json') {
                    return of(slopeGraph);
                } else if (url === 'assets/widget-configs/time-series-widget.json') {
                    return of(ts);
                } else if (url === 'assets/widget-configs/pivot-widget.json') {
                    return of(pivotWidget);
                } else if (url === 'assets/widget-configs/pra-security-contribution.json') {
                    return of(praSecurityContribution);
                } else if (url === 'assets/widget-configs/cmbs-map-widget.json') {
                    return of(cmbsMap);
                } else if (url === 'assets/widget-configs/explore-clarity-ai-chart-widget.json') {
                    return of(clarity);
                } else if (url === 'assets/widget-configs/commitment-risk-widget.json') {
                    return of(commitmentRisk);
                } else if (url === 'assets/widget-configs/commitment-risk-chart-widget.json') {
                    return of(commitmentRiskChart);
                } else if (url === 'assets/widget-configs/commitment-risk-widget-legacy.json') {
                    return of(commitmentRiskLegacy);
                } else if (url === 'assets/widget-configs/commitment-risk-chart-widget-legacy.json') {
                    return of(commitmentRiskChartLegacy);
                } else if (url === 'assets/widget-configs/commitment-risk-excluded-funds-widget.json') {
                    return of(commitmentRiskExcludedFunds);
                } else if (url === 'assets/widget-configs/pra-time-series-widget.json') {
                    return of(praTimeSeries);
                } else if (url === 'assets/widget-configs/cassini-margin-analytics-widget.json') {
                    return of(marginAnalyticsCassini);
                } else if (url === 'assets/widget-configs/lookthrough-summary-widget.json') {
                    return of(lookthroughSummaryWidget);
                } else if (url === 'assets/widget-configs/pra-factor-data-widget.json') {
                    return of(praFactorData);
                } else if (url === 'assets/widget-configs/pgs-bar-widget.json') {
                    return of(pgsBarWidget);
                } else if (url === 'assets/widget-configs/pgs-ts-widget.json') {
                    return of(pgsTsWidget);
                } else if (url === 'assets/widget-configs/pnl-ts-widget.json') {
                    return of(pnlTsWidget);
                } else if (url === 'assets/widget-configs/mcvar-pnl-ts-widget.json') {
                    return of(mcvarPnlTsWidget);
                } else if (url === 'assets/widget-configs/decarbonization-chart-widget.json') {
                    return of(decarbonizationWidget);
                } else if (url === 'assets/widget-configs/diversification-ts-widget.json') {
                    return of(diversificationTsWidget);
                }
            })
        };
        TestBed.configureTestingModule({
            imports: [MetadataModule],
            providers: [{provide: HttpClient, useValue: httpMock}],
            teardown: {
                destroyAfterEach: false
            }
        });
        const widgetConfigFactory = TestBed.inject(WidgetConfigFactory);
        widgetConfigFactory.loadChartConfig$().subscribe();
    }

    /**
     * Create an array of colTags from the passed in columns
     */
    static getColTags(columns) {
        return CoreTestUtils.getColTags(columns);
    }

    /**
     * Compares that the two list of values passed in are equal
     */
    static validate(actualValues, expectedValues) {
        return CoreTestUtils.validate(actualValues, expectedValues);
    }

    /**
     * Remove uid from aux
     * @param nodes tree nodes
     */
    static removeUIDFromAdvanceTreeListNodes(nodes: AuxAdvancedTreeListInterface[]) {
        nodes.forEach((node: AuxAdvancedTreeListInterface) => {
            node.uid = undefined;
            if (node.children) {
                TestUtils.removeUIDFromAdvanceTreeListNodes(node.children);
            }
        });
    }

    /**
     * Method to create nested fund sector rule
     * @param portfolioValues portfolio values
     * @param cusipValues cusip values
     * @param customSectorType custom sector type
     */
    static  createNestedFundSectorRule(portfolioValues: string[], cusipValues: string[], customSectorType: CustomSectorType): GroupRule {
        const nestedFundSectorRule = new GroupRule();
        const portfolioRule = new ColumnSectorRule();
        portfolioRule.customSectorType = customSectorType;
        ColumnSectorRule.updateRule(portfolioRule, FundSectoringConfig.portfolioColumn,
            SectorConstants.CUSTOM_RULE_BUILDER_OPERATORS.EQUALS.displayValue, portfolioValues, ColumnConstants.COLUMN_DATA_TYPE.STRING);
        const cusipRule = new ColumnSectorRule();
        cusipRule.customSectorType = customSectorType;
        ColumnSectorRule.updateRule(cusipRule, FundSectoringConfig.cusipColumn,
            SectorConstants.CUSTOM_RULE_BUILDER_OPERATORS.EQUALS.displayValue, cusipValues, ColumnConstants.COLUMN_DATA_TYPE.STRING);
        nestedFundSectorRule.subRules = [portfolioRule, cusipRule];
        nestedFundSectorRule.groupType = CommonConstants.GROUP_RULE_CONDITION.AND;
        return nestedFundSectorRule;
    }
}
