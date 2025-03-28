import {AbstractReturnWidgetService} from '@services/widget/abstract-return-widget.service';
import {beforAllDataServiceTest} from '@services/widget/functions-for-data-service.testutil';
import {DataRequestConstants} from '@constants/data-request.constants';
import {TestUtils} from '@utils/test.utils';
import {Report} from '@models/workspace/report.model';
import {Widget} from '@models/widget/widget.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {
    AdditionalPerformanceSettings,
    ColumnConfig,
    DateValue,
    PerformanceConstants,
    PerformanceSettings,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {Breakdown, NumericColumnSector, SectorConstants} from '@blk/explore-ui-breakdown';
import {NotificationConstants} from '@constants/notification.constants';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {Notification} from '@models/widget/notification.model';
import {ColumnSet} from '@blk/explore-ui-column-option';

describe('AbstractReturnWidgetService', () => {
    let service: AbstractReturnWidgetService;
    let exploreDataRequestService: ExploreDataRequestService;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new class extends AbstractReturnWidgetService {

        }(DataRequestConstants.DATA_REQUEST_URL.BASE, exploreDataRequestService, [WidgetConfigType.RETURNS]);
    });

    beforeEach( (done) => {
        TestUtils.initialize(done);
    });

    afterEach( () => {
        jest.restoreAllMocks();
    });

    it('tests validateInputs', () => {
        const widget: Widget = new Widget();
        const report: Report = new Report();
        const portfolio: Portfolio = new Portfolio('PEP', new DateValue({date: '09/05/2018'}));
        const performanceSettings: PerformanceSettings = new PerformanceSettings();
        widget.dataStore.metaData.inputs.set(PerformanceConstants.PERFORMANCE_SETTINGS, performanceSettings);
        expect(service['validateInputs'](widget, portfolio, report)).toBe(null);

        performanceSettings.additionalSettings = new AdditionalPerformanceSettings();
        expect(service['validateInputs'](widget, portfolio, report)).toBe(null);

        performanceSettings.additionalSettings.showSummary = true;
        expect(service['validateInputs'](widget, portfolio, report)).toBe(null);

        const breakdown: Breakdown = new Breakdown();
        widget.dataStore.metaData.inputs.set(CommonConstants.CONFIG_TYPE.BREAKDOWN_TREE, breakdown);
        expect(service['validateInputs'](widget, portfolio, report)).toEqual(null);

        jest.spyOn(breakdown, 'isPerformanceBreakdown').mockReturnValue(false);
        expect(service['validateInputs'](widget, portfolio, report).message).toBe(NotificationConstants.SHOW_SUMMARY_PERF_BREAKDOWN_MESSAGE);

        performanceSettings.additionalSettings.showSummary = false;
        performanceSettings.additionalSettings.customBreakdownType = true;
        jest.spyOn(breakdown, 'hasPortfolioNameColumn').mockReturnValue(false);
        expect(service['validateInputs'](widget, portfolio, report).message).toBe(NotificationConstants.BREAKDOWN_FLATTEN_COMPONENT_MESSAGE);

        performanceSettings.additionalSettings.showSummary = true;
        const customPortfolio = new Portfolio('IP,PEP');
        expect(service['validateInputs'](widget, customPortfolio, report).message).toBe(NotificationConstants.SHOW_SUMMARY_PERF_CUSTOM_PORT_GROUP);
    });

    it('Test validateQuantileBreakdownForReturns', () => {        const columns = new ColumnSet();
        columns.columns.push(ColumnConfig.createColumn('pnl_contr'));
        columns.columns.push(ColumnConfig.createColumn('market_val'));

        expect(service['validateQuantileBreakdownForReturns'](null, null)).toBe(null);
        const breakdown = new Breakdown();
        expect(service['validateQuantileBreakdownForReturns'](breakdown, null)).toBe(null);
        const numericSector = new NumericColumnSector();
        numericSector.children = [];
        numericSector.quantileInfo.numberOfQuantiles = 2;
        breakdown.addChild(numericSector);
        expect(service['validateQuantileBreakdownForReturns'](breakdown, columns)).toBeInstanceOf(Notification);
        columns.columns.pop();
        expect(service['validateQuantileBreakdownForReturns'](breakdown, columns)).toBe(undefined);
        const numericSector2 = new NumericColumnSector();
        numericSector2.children = [];
        numericSector.addChild(numericSector2);
        expect(service['validateQuantileBreakdownForReturns'](breakdown, columns)).toBeInstanceOf(Notification);
    });
});
