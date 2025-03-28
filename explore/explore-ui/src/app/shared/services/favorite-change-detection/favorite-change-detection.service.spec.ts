import {TestBed} from '@angular/core/testing';

import {FavoriteChangeDetectionService} from './favorite-change-detection.service';
import {
    ConfigState,
    ConfigTypeFactory,
    CoreFavoriteStore,
    Favorite,
    FavoriteCacheKey,
    WidgetInputType
} from '@blk/explore-ui-core';
import {Report} from '@models/workspace/report.model';
import {AggregationColumnOption, ColumnSet, CustomAggregationColumnOption} from '@blk/explore-ui-column-option';
import {CUSTOM_CALC_COL_TAG} from '@utils/qbstr';
import {TestUtils} from '@utils/test.utils';
import {cloneDeep} from 'lodash';
import {Workspace} from '@models/workspace/workspace.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {BarChartSettings} from '@models/widget/inputs/chart-settings/bar-chart-settings.model';
import {ChartType} from '@qbstr/highcharts-api';
import {ReportGroup} from '@models/workspace/report-group.model';

describe('FavoriteChangeDetectionService', () => {
    let service: FavoriteChangeDetectionService;

    let breakdownFavorite: Favorite;
    let customCalcFavorite: Favorite;
    let columnSetFavorite: Favorite;
    let reportFavorite: Favorite;
    let barChartReportFavorite: Favorite;
    let simpleWorkspaceFavorite: Favorite;
    let multiWorkspaceFavorite: Favorite;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({providers: [FavoriteChangeDetectionService]});
        service = TestBed.inject(FavoriteChangeDetectionService);

        breakdownFavorite = new Favorite({
            owner: 'tilee',
            data: '{"breakdown":{"isConfigured":true,"breakdownTitle":"simple gics","subSectors":[{"breakdownRuleType":"String","groupByColumn":{"columnName":"Barclays/GICS Sectors (BAA_BARC_GICS) - Level 1","columnTag":"grsector`BAA_BARC_GICS`1","dataType":"STRING","positionColumnType":"ALL"},"subSectors":[{"breakdownRuleType":"String","groupByColumn":{"columnName":"Barclays/GICS Sectors (BAA_BARC_GICS) - Level 2","columnTag":"grsector`BAA_BARC_GICS`2","dataType":"STRING","positionColumnType":"ALL"},"subSectors":[{"breakdownRuleType":"String","groupByColumn":{"columnName":"Barclays/GICS Sectors (BAA_BARC_GICS) - Level 3","columnTag":"grsector`BAA_BARC_GICS`3","dataType":"STRING","positionColumnType":"ALL"},"useNoneBuckets":false}],"useNoneBuckets":false}],"useNoneBuckets":false}]},"title":"simple gics"}',
            listOrder: 1,
            list_order: 1,
            description: ' ',
            id: 2405616,
            title: 'simple gics',
            type: 'BREAKDOWN',
            tool: 'Explore_BETA',
        });

        customCalcFavorite = new Favorite({
            owner: 'tilee',
            data: '{"columnTag":"custom_calc","columnKey":"custom_calc_f34275949c2d4ea","positionColumnType":"ALL","optionValues":[{"expression":"a","measures":{"a":{"columnTag":"market_val","positionColumnType":"PORT","optionValues":[{"aggregationType":2,"configType":"aggregation"},{"measureNode":"security","configType":"customCalculationNodeType"}],"title":"Market Value"}},"configType":"customCalculation"},{"subtotalType":2,"excludeNullValues":true,"weightType":"PORT","colWeightType":"NOTIONAL","configType":"customAggregation"},{"decimalPlaces":2,"useThousandsSeparator":true,"scaling":1,"configType":"numericColumnFormatColumnOption"}],"title":"custom mv"}',
            listOrder: 2,
            list_order: 2,
            description: ' ',
            id: 2405617,
            title: 'custom mv',
            type: 'COLUMN',
            tool: 'Explore_BETA',
            isSlim: false
        });

        columnSetFavorite = new Favorite({
            owner: 'tilee',
            data: '{"configType":"columnSet","columns":[{"columnTag":"security_description","columnKey":"security_description_1","positionColumnType":"ALL"},{"columnTag":"cusip","columnKey":"cusip_0","positionColumnType":"ALL"},{"columnTag":"pct_mv","columnKey":"pct_mv_1","positionColumnType":"PORT","optionValues":[{"aggregationType":2,"configType":"aggregation"},{"decimalPlaces":1,"useThousandsSeparator":true,"scaling":0.01,"configType":"numericColumnFormatColumnOption"}]},{"isGlobalFav":false,"favId":2405617,"configType":"COLUMN","columnKey":"custom_calc_f34275949c2d4ea"}],"columnState":{"columns":[{"columnKey":"security_description_1","width":125,"pinned":"left"},{"columnKey":"cusip_0","width":57,"pinned":null},{"columnKey":"pct_mv_1","width":101,"pinned":null}]},"title":"cols with custom calc"}',
            listOrder: 2,
            list_order: 2,
            description: ' ',
            id: 2405618,
            title: 'cols with custom calc',
            type: 'REPORT',
            tool: 'Explore_BETA',
            isSlim: false
        });

        reportFavorite = new Favorite({
            owner: 'tilee',
            data: '{"configType":"WIDGETS_REPORT","widgets":[{"configType":"riskExposure","title":"Risk and exposure","id":1575504582,"sizeX":8,"sizeY":6,"col":0,"row":0,"displayInputs":{"expandedState":{"expandedPaths":[["_ROOT_"]]}},"dataStore":"daa3c893-db22-4af6-a69d-e602c75a775b"}],"availableDataStores":{"daa3c893-db22-4af6-a69d-e602c75a775b":{"name":"daa3c893-db22-4af6-a69d-e602c75a775b","metaData":{"inputs":{"columns":{"isGlobalFav":false,"favId":2405618,"configType":"columnSet"},"breakdownTree":{"isGlobalFav":false,"favId":2405616,"configType":"breakdown"},"isLightLookthroughEnabled":false,"topBottomFilter":{"childColumnOptions":{},"configType":"topBottomFilter"},"normalizedWidgetFilter":false,"riskAndExposureAdditionalSettings":{"configType":"riskAndExposureAdditionalSettings","closedPositionAggregationType":"NONE","benchmarkPositionAggregationType":"NONE","portfolioPositionAggregationType":"NONE"},"overrideDateSortByOldest":{"sortByOldest":false},"sortedColumns":{"sortedColumns":[],"configType":"sortedColumns"}}}}},"comparisonConfigId":1564987870,"title":"basic report"}',
            listOrder: 4,
            list_order: 4,
            description: ' ',
            id: 2405622,
            title: 'basic report',
            type: 'LAYOUT',
            tool: 'Explore_BETA',
            isSlim: false
        });

        barChartReportFavorite = new Favorite({
            owner: 'tilee',
            data: '{"configType":"WIDGETS_REPORT","widgets":[{"configType":"bar","title":"Bar chart","id":90117176,"sizeX":8,"sizeY":6,"col":0,"row":0,"displayInputs":{"chart":{"chartType":"column","configType":"barSettings"},"showGridLines":true,"secondaryAxisColumn":{"secondaryAxisColumn":{"secondaryAxisColumn":null}},"chartSettings":{"labelShow":true,"legendShow":true}},"dataStore":"3f7ce0a3-a691-4cb1-892f-cf968f6510c8"}],"availableDataStores":{"3f7ce0a3-a691-4cb1-892f-cf968f6510c8":{"name":"3f7ce0a3-a691-4cb1-892f-cf968f6510c8","metaData":{"inputs":{"columns":{"configType":"columnSet","columns":[{"columnTag":"pct_notional_val","columnKey":"pct_notional_val_0","positionColumnType":"PORT","optionValues":[{"sortOrder":"DESC","configType":"sortOrderColumnOption"},{"aggregationType":2,"configType":"aggregation"},{"decimalPlaces":1,"useThousandsSeparator":true,"scaling":0.01,"configType":"numericColumnFormatColumnOption"},{"sortOrder":"DESC","configType":"sortOrderColumnOption"}],"title":"Notional Market Value %"}],"columnState":{"columns":[{"columnKey":"pct_notional_val_0"}]}},"breakdownTree":{"isGlobalFav":false,"favId":1369886,"configType":"breakdown"},"stackedBreakdownTree":{"breakdown":{"isConfigured":true},"title":""},"isLightLookthroughEnabled":true,"topBottomFilter":{"childColumnOptions":{},"configType":"topBottomFilter"},"normalizedWidgetFilter":false,"overrideAxisTitle":{"primaryAxisTitle":"","secondaryAxisTitle":""},"overrideDateSortByOldest":{"sortByOldest":false},"sortedColumns":{"sortedColumns":[{"sort":"DESC","colId":"pct_notional_val_0"}],"configType":"sortedColumns"}}}}},"comparisonConfigId":85325486,"title":"bar report"}',
            listOrder: 5,
            list_order: 5,
            description: ' ',
            id: 2405989,
            title: 'bar report',
            type: 'LAYOUT',
            tool: 'Explore_BETA',
            isSlim: false
        });

        simpleWorkspaceFavorite = new Favorite({
            owner: 'tilee',
            data: '{"configType":"workspace","workpads":[{"configType":"flat-workpad","reports":[{"isGlobalFav":false,"favId":2405622,"configType":"WIDGETS_REPORT"}],"portfolio":{"configType":"portfolio","ticker":"SNP500","portId":"SNP50030414b68aeea4e1","cusip":"B01825270","currency":"USD","benchmark":{"type":"RISK","order":1,"name":"SNP500PRO"},"datePicker":{"calCode":"INDEX_ALL_Calendar","dateString":true,"dateStringValue":"T-1"},"expostSettings":{"samplingPeriod":{"numberOfPeriods":1,"shortName":"Months","timePeriodName":"1 Month"},"statisticPeriods":[{"numberOfPeriods":1,"shortName":"Years","timePeriodName":"1 Year"}],"isNetReturns":false,"isLogNormal":false,"categoryBreakdown":true},"portfolioRiskSettings":{},"lookthroughSettings":{"ltFilterRulesFav":[],"isLookThroughEnabled":false,"isBenchLookThroughEnabled":false,"ltSecurityTypes":"FUND,ETF,FUTURE_INDEX","ltProxies":"RISK_PROXY,FUND"},"splitPositionTypes":"XC,XF,XH,XS,SW,O","positionModeSettings":{"positionMode":"AS_OF_W"},"title":"SNP500"}}],"title":"basic workspace","userPermGrps":["Test EPG"]}',
            listOrder: 13,
            list_order: 13,
            description: ' ',
            id: 2405623,
            title: 'basic workspace',
            type: 'WORKSPACE',
            tool: 'Explore_BETA',
            userPermGrps: ["Test EPG"],
            isSlim: false
        });

        multiWorkspaceFavorite = new Favorite({
            owner: 'tilee',
            data: '{"configType":"workspace","workpads":[{"configType":"flat-workpad","reports":[{"isGlobalFav":false,"favId":2405622,"configType":"WIDGETS_REPORT"}],"portfolio":{"configType":"portfolio","ticker":"SNP500","portId":"SNP50030414b68aeea4e1","cusip":"B01825270","currency":"USD","benchmark":{"type":"RISK","order":1,"name":"SNP500PRO"},"datePicker":{"calCode":"INDEX_ALL_Calendar","dateString":true,"dateStringValue":"T-1"},"expostSettings":{"samplingPeriod":{"numberOfPeriods":1,"shortName":"Months","timePeriodName":"1 Month"},"statisticPeriods":[{"numberOfPeriods":1,"shortName":"Years","timePeriodName":"1 Year"}],"isNetReturns":false,"isLogNormal":false,"categoryBreakdown":true},"portfolioRiskSettings":{},"lookthroughSettings":{"ltFilterRulesFav":[],"isLookThroughEnabled":false,"isBenchLookThroughEnabled":false,"ltSecurityTypes":"FUND,ETF,FUTURE_INDEX","ltProxies":"RISK_PROXY,FUND"},"splitPositionTypes":"XC,XF,XH,XS,SW,O","positionModeSettings":{"positionMode":"AS_OF_W"},"title":"SNP500"}},{"configType":"report-group","reports":[{"configType":"WIDGETS_REPORT","widgets":[{"configType":"pgsWidget","title":"Portfolio group summary","id":69481437,"sizeX":8,"sizeY":6,"col":0,"row":0,"displayInputs":{"expandedState":{"allExpanded":true}},"dataStore":"075bf4b2-f245-481e-8b33-44816783d32f"}],"availableDataStores":{"075bf4b2-f245-481e-8b33-44816783d32f":{"name":"075bf4b2-f245-481e-8b33-44816783d32f","metaData":{"inputs":{"columns":{"configType":"columnSet","columns":[{"columnTag":"portfolio","columnKey":"portfolio","positionColumnType":"ALL"},{"columnTag":"nav_group","columnKey":"nav_group_0","positionColumnType":"PORT"},{"columnTag":"pct_nav_group","columnKey":"pct_nav_group_1","positionColumnType":"PORT"}],"columnState":{"columns":[{"columnKey":"portfolio","width":68,"pinned":"left"},{"columnKey":"nav_group_0","width":73,"pinned":null},{"columnKey":"pct_nav_group_1","width":115,"pinned":null}]}},"normalizedWidgetFilter":false,"suppressRootNodeAggregation":{"suppressRootNodeAggregation":false},"overrideDateSortByOldest":{"sortByOldest":false},"sortedColumns":{"sortedColumns":[],"configType":"sortedColumns"}}}}},"comparisonConfigId":63585410,"title":"Report 1"},{"isGlobalFav":false,"favId":2405989,"configType":"WIDGETS_REPORT"}],"portfolios":[{"configType":"portfolio","ticker":"H2","portId":"H20dcf3e260c7b416","cusip":"BRS2JW344","currency":"GBP","isIndexResearchPortfolio":false,"benchmark":{"type":"RISK","order":1,"name":"MLGBCRPINX"},"datePicker":{"calCode":"GP_BLK_GLOBAL","dateString":true,"dateStringValue":"T-1"},"expostSettings":{"samplingPeriod":{"numberOfPeriods":1,"shortName":"Months","timePeriodName":"1 Month"},"statisticPeriods":[{"numberOfPeriods":1,"shortName":"Years","timePeriodName":"1 Year"}],"isNetReturns":false,"isLogNormal":false,"categoryBreakdown":true},"portfolioRiskSettings":{},"lookthroughSettings":{"ltFilterRulesFav":[],"isLookThroughEnabled":false,"isBenchLookThroughEnabled":false,"ltSecurityTypes":"FUND,ETF,FUTURE_INDEX","ltProxies":"RISK_PROXY,FUND"},"splitPositionTypes":"XC,XF,XH,XS,SW,O","positionModeSettings":{"positionMode":"AS_OF_W"},"title":"H2"},{"configType":"portfolio","ticker":"CORE-HQ","portId":"CORE-HQ142103ca9c8449f","cusip":"BRS156JG4","currency":"USD","isIndexResearchPortfolio":false,"benchmark":{"type":"BenchAggregate","order":1,"name":"Primary"},"datePicker":{"calCode":"GreenPkg","dateString":true,"dateStringValue":"T-1"},"expostSettings":{"samplingPeriod":{"numberOfPeriods":1,"shortName":"Months","timePeriodName":"1 Month"},"statisticPeriods":[{"numberOfPeriods":1,"shortName":"Years","timePeriodName":"1 Year"}],"isNetReturns":false,"isLogNormal":false,"categoryBreakdown":true},"portfolioRiskSettings":{},"lookthroughSettings":{"ltFilterRulesFav":[],"isLookThroughEnabled":false,"isBenchLookThroughEnabled":false,"ltSecurityTypes":"FUND,ETF,FUTURE_INDEX","ltProxies":"RISK_PROXY,FUND"},"splitPositionTypes":"XC,XF,XH,XS,SW,O","positionModeSettings":{"positionMode":"AS_OF_W"},"title":"CORE-HQ"}],"isOpen":true,"name":"fixed income"}],"title":"multi workspace"}',
            listOrder: 0,
            list_order: 0,
            description: ' ',
            id: 2405900,
            title: 'multi workspace',
            type: 'WORKSPACE',
            tool: 'Explore_BETA',
            isSlim: false
        });

        CoreFavoriteStore.favoriteCache.set(new FavoriteCacheKey(breakdownFavorite.id, false).toString(), breakdownFavorite);
        CoreFavoriteStore.favoriteCache.set(new FavoriteCacheKey(customCalcFavorite.id, false).toString(), customCalcFavorite);
        CoreFavoriteStore.favoriteCache.set(new FavoriteCacheKey(columnSetFavorite.id, false).toString(), columnSetFavorite);
        CoreFavoriteStore.favoriteCache.set(new FavoriteCacheKey(reportFavorite.id, false).toString(), reportFavorite);
        CoreFavoriteStore.favoriteCache.set(new FavoriteCacheKey(barChartReportFavorite.id, false).toString(), barChartReportFavorite);
        CoreFavoriteStore.favoriteCache.set(new FavoriteCacheKey(simpleWorkspaceFavorite.id, false).toString(), simpleWorkspaceFavorite);
        CoreFavoriteStore.favoriteCache.set(new FavoriteCacheKey(multiWorkspaceFavorite.id, false).toString(), multiWorkspaceFavorite);
    });

    it('should return tree of favorite changes report level, column set, custom calc', () => {
        const report: Report = ConfigTypeFactory.createConfig(reportFavorite.data, reportFavorite.type, true);
        const reportCopy = cloneDeep(report);
        const flattenedFavoriteChanges = [];

        // update aggregation on custom calc
        const dataStore = reportCopy.widgets[0].dataStore;
        const reportColSet = dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        const customCalcCol = reportColSet.columns.find(col => col.columnTag === CUSTOM_CALC_COL_TAG);
        const aggregationColOption = (customCalcCol.optionValues.find(option => option instanceof CustomAggregationColumnOption) as CustomAggregationColumnOption);
        aggregationColOption.subtotalType = 5;
        aggregationColOption.optionState = ConfigState.MODIFIED;

        const reportChangedFavoritesTree = service.getReportChangedFavoritesTree(reportCopy, flattenedFavoriteChanges, true);

        // should return report -> column set -> custom calc
        expect(reportChangedFavoritesTree.value.id).toEqual(reportCopy.id);
        expect(reportChangedFavoritesTree.nestedChanges).toHaveLength(1);

        const columnSetChangedFavorite = reportChangedFavoritesTree.nestedChanges[0];
        expect(columnSetChangedFavorite.value.id).toEqual(reportColSet.id);
        expect(columnSetChangedFavorite.nestedChanges).toHaveLength(1);

        const customCalcChangedFavorite = columnSetChangedFavorite.nestedChanges[0];
        expect(customCalcChangedFavorite.value.id).toEqual(customCalcCol.id);
        expect(customCalcChangedFavorite.nestedChanges).toHaveLength(0);

        expect(flattenedFavoriteChanges.length).toBe(3);
    });

    it('should return tree consisting of only report level when no changes to nested favorites', () => {
        const report = ConfigTypeFactory.createConfig(reportFavorite.data, reportFavorite.type, true) as Report;
        const flattenedFavoriteChanges = [];

        // no changes, return only report
        const reportChangedFavoritesTree = service.getReportChangedFavoritesTree(report, flattenedFavoriteChanges, true);
        expect(reportChangedFavoritesTree.value).toEqual(report);
        expect(reportChangedFavoritesTree.nestedChanges).toHaveLength(0);

        expect(flattenedFavoriteChanges.length).toBe(1);
    });

    it('should return tree consisting of only workspace level when no changes to nested favorites', () => {
        const workspace = ConfigTypeFactory.createConfig(simpleWorkspaceFavorite.data, simpleWorkspaceFavorite.type, true) as Workspace;
        const flattenedFavoriteChanges = [];

        // no changes, return only workspace
        const workspaceChangedFavoritesTree = service.getWorkspaceChangedFavoritesTree(workspace, flattenedFavoriteChanges);
        expect(workspaceChangedFavoritesTree.value).toEqual(workspace);
        expect(workspaceChangedFavoritesTree.nestedChanges).toHaveLength(0);

        expect(flattenedFavoriteChanges.length).toBe(1);
    });

    it('should return a tree of all favorite changes within a workspace: unmodified saved custom calc -> modified saved colSet -> saved report -> flat workpad', () => {
        jest.spyOn(FavoriteChangeDetectionService, 'isChangedFavorite').mockReturnValue(true);
        const workspace = ConfigTypeFactory.createConfig(simpleWorkspaceFavorite.data, simpleWorkspaceFavorite.type, true) as Workspace;
        workspace.id = 2405623;
        const workspaceCopy = cloneDeep(workspace);
        const flattenedFavoriteChanges = [];

        // modify the column set
        const colSet = workspaceCopy.workpads[0].reports[0].widgets[0].dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        const aggregationColOption = colSet.columns[2].optionValues.find(option => option instanceof AggregationColumnOption) as AggregationColumnOption;
        aggregationColOption.value = 5;
        aggregationColOption.optionState = ConfigState.MODIFIED;

        const workspaceChangedFavoritesTree = service.getWorkspaceChangedFavoritesTree(workspaceCopy, flattenedFavoriteChanges);

        // expect to see workspace -> workpad -> report -> columnSet all modified
        expect(workspaceChangedFavoritesTree.value).toEqual(workspaceCopy);
        expect(workspaceChangedFavoritesTree.isWorkspaceFavoriteContentModified).toEqual(true);

        const workpadChangedFavorites = workspaceChangedFavoritesTree.nestedChanges[0];
        expect(workpadChangedFavorites.value instanceof FlatWorkpad).toBeTruthy();
        expect((workpadChangedFavorites.value as FlatWorkpad).portfolio.portName).toEqual('SNP500');
        expect(workpadChangedFavorites.modifiedReports).toHaveLength(1);
        expect(workpadChangedFavorites.nestedChanges).toHaveLength(0);

        const reportChangedFavorites = workpadChangedFavorites.modifiedReports[0];
        expect(reportChangedFavorites.value.id).toEqual(workspace.workpads[0].reports[0].id);
        expect(reportChangedFavorites.nestedChanges).toHaveLength(2);

        const columnSetChangedFavorite = reportChangedFavorites.nestedChanges[0];
        expect(columnSetChangedFavorite.value).toEqual(colSet);
        expect(columnSetChangedFavorite.nestedChanges).toHaveLength(1);

        expect(flattenedFavoriteChanges.length).toBe(5);
    });

    it('should return a tree of all favorite changes within a workspace - one flat workpad, one report group', () => {
        const workspace = ConfigTypeFactory.createConfig(multiWorkspaceFavorite.data, multiWorkspaceFavorite.type, true) as Workspace;
        const workspaceCopy = cloneDeep(workspace);
        const flattenedFavoriteChanges = [];

        // modify the column set inside flat workpad
        const colSet = workspaceCopy.workpads[0].reports[0].widgets[0].dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        const aggregationColOption = colSet.columns[2].optionValues.find(option => option instanceof AggregationColumnOption) as AggregationColumnOption;
        aggregationColOption.value = 5;
        aggregationColOption.optionState = ConfigState.MODIFIED;

        // modify bar chart settings in report group
        const barChartSettings = workspaceCopy.workpads[1].reports[1].widgets[0].displayInputs.get('chart') as BarChartSettings;
        barChartSettings.chartType = ChartType.BAR;

        const workspaceChangedFavoritesTree = service.getWorkspaceChangedFavoritesTree(workspaceCopy, flattenedFavoriteChanges);

        // expect to see modified workspace -> report -> colSet
        //                                  -> report
        expect(workspaceChangedFavoritesTree.value).toEqual(workspaceCopy);
        expect(workspaceChangedFavoritesTree.nestedChanges).toHaveLength(2);

        // workpad: report -> colSet
        const workpadChangedFavorites = workspaceChangedFavoritesTree.nestedChanges[0];
        expect(workpadChangedFavorites.value instanceof FlatWorkpad).toBeTruthy();
        expect((workpadChangedFavorites.value as FlatWorkpad).portfolio.portName).toEqual('SNP500');
        expect(workpadChangedFavorites.modifiedReports).toHaveLength(1);
        expect(workpadChangedFavorites.nestedChanges).toHaveLength(0);

        const reportChangedFavorites = workpadChangedFavorites.modifiedReports[0];
        expect(reportChangedFavorites.value.id).toEqual(workspace.workpads[0].reports[0].id);
        expect(reportChangedFavorites.nestedChanges).toHaveLength(2);

        const columnSetChangedFavorite = reportChangedFavorites.nestedChanges[0];
        expect(columnSetChangedFavorite.value).toEqual(colSet);
        expect(columnSetChangedFavorite.nestedChanges).toHaveLength(1);

        // workpad: report
        const workpadChangedFavorites2 = workspaceChangedFavoritesTree.nestedChanges[1];
        expect(workpadChangedFavorites2.value instanceof ReportGroup).toBeTruthy();
        expect((workpadChangedFavorites2.value as ReportGroup).portfolios).toHaveLength(2);
        expect(workpadChangedFavorites2.modifiedReports).toHaveLength(1);
        expect(workpadChangedFavorites.nestedChanges).toHaveLength(0);

        const reportChangedFavorites2 = workpadChangedFavorites2.modifiedReports[0];
        expect(reportChangedFavorites2.value.id).toEqual(workspace.workpads[1].reports[1].id);
        expect(reportChangedFavorites2.nestedChanges).toHaveLength(0);

        expect(flattenedFavoriteChanges.length).toBe(6);
    });

    it('should return a tree of all favorite changes within a workspace - modified saved colSet -> UNSAVED report -> flat workpad - do not allow report to be saved', () => {
        const workspace = ConfigTypeFactory.createConfig(simpleWorkspaceFavorite.data, simpleWorkspaceFavorite.type, true) as Workspace;
        const workspaceCopy = cloneDeep(workspace);

        const flattenedFavoriteChanges = [];

        // clear id so Report is -unsaved- favorite
        delete workspaceCopy.workpads[0].reports[0].id;

        const colSet = workspaceCopy.workpads[0].reports[0].widgets[0].dataStore.metaData.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        colSet.columns = [];

        const workspaceChangedFavoritesTree = service.getWorkspaceChangedFavoritesTree(workspaceCopy, flattenedFavoriteChanges);

        // expect to see workspace -> workpad -> report -> columnSet all modified
        expect(workspaceChangedFavoritesTree.value).toEqual(workspaceCopy);
        expect(workspaceChangedFavoritesTree.nestedChanges).toHaveLength(1);

        const workpadChangedFavorites = workspaceChangedFavoritesTree.nestedChanges[0];
        expect(workpadChangedFavorites.value instanceof FlatWorkpad).toBeTruthy();
        expect((workpadChangedFavorites.value as FlatWorkpad).portfolio.portName).toEqual('SNP500');
        expect(workpadChangedFavorites.modifiedReports).toHaveLength(1);
        expect(workpadChangedFavorites.nestedChanges).toHaveLength(0);

        const reportChangedFavorites = workpadChangedFavorites.modifiedReports[0];
        // make sure report is not selected to be saved
        expect(reportChangedFavorites.isSelected).toBeFalsy();
        expect(reportChangedFavorites.nestedChanges).toHaveLength(2);

        const columnSetChangedFavorite = reportChangedFavorites.nestedChanges[0];
        expect(columnSetChangedFavorite.value).toEqual(colSet);
        expect(columnSetChangedFavorite.nestedChanges).toHaveLength(0);

        expect(flattenedFavoriteChanges.length).toBe(4);
    });
});
