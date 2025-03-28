import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {FetchSecuritiesDataService} from '@services/widget/fetch-securities-data-service';
import {beforAllDataServiceTest} from '@services/widget/functions-for-data-service.testutil';
import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';
import {WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {WidgetConfigFactory} from '../../../factories';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {ColumnSectorRule, CustomSector, GroupRule, CustomFilter} from '@blk/explore-ui-breakdown';

describe('Fetch Securities Service Test', () => {
    let service: FetchSecuritiesDataService;
    let exploreDataRequestService: ExploreDataRequestService;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new class extends FetchSecuritiesDataService {

        }(exploreDataRequestService);
    });

    beforeEach( (done) => {
        TestUtils.initialize(done);
    });

    it('modifyWidgetInput test case', () => {
        const widget: Widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        widget.widgetConfigInputs = WidgetConfigFactory.getInputsForWidgetConfigType(WidgetConfigType.RISK_EXPOSURE);
        widget.initializeInputs();

        const widgetInputs: Map<string, WidgetInput> = new Map(widget.dataStore.metaData.inputs);

        const expectedCustomFilter = new CustomFilter();
        expectedCustomFilter.customSector = new CustomSector();
        expectedCustomFilter.customSector.rule = new GroupRule();
        const secTypeRule: ColumnSectorRule = new ColumnSectorRule({colTitle: 'Security Type', colTag: 'sec_type', compType: 'EQUALS', compValues: ['PRIVATE'], colPositionColumnType:'ALL'});
        const secGroupRule: ColumnSectorRule = new ColumnSectorRule({colTitle: 'Security Group', colTag: 'sec_group', compType: 'EQUALS', compValues: ['FUND'], colPositionColumnType:'ALL'});

        (expectedCustomFilter.customSector.rule as GroupRule).groupType = 'AND';
        (expectedCustomFilter.customSector.rule as GroupRule).subRules = [secTypeRule, secGroupRule];

        service['modifyWidgetInputs'](widgetInputs, widget, 'PRIVATE', 'FUND');
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns.length).toBe(2);
        expect(widgetInputs.get(WidgetInputType.FILTER) as CustomFilter).toStrictEqual(expectedCustomFilter);
        expect(widgetInputs.get(WidgetInputType.BREAKDOWN_TREE)).toBe(null);
    });
});
