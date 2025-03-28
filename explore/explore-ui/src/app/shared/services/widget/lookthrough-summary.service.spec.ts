import {TestUtils} from '@utils/test.utils';
import {beforAllDataServiceTest, validateService} from '@services/widget/functions-for-data-service.testutil';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ColumnConfig, ColumnConstants, CommonUtils, UseType, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet, CustomTitleColumnOption} from '@blk/explore-ui-column-option';
import {WorkspaceStore} from '@stores/workspace.store';
import {Report} from '@models/workspace/report.model';
import {LookThroughSummaryService} from '@services/widget/lookthrough-summary.service';

describe('LookThroughSummaryService Test', () => {
    let service: LookThroughSummaryService;
    let exploreDataReqService: ExploreDataRequestService;

    beforeAll(() => {
        exploreDataReqService = beforAllDataServiceTest();
    });

    beforeEach(done => {
        TestUtils.initialize(done);

        WorkspaceStore.init();
        WorkspaceStore.currentReport$.next(new Report());
        service = new LookThroughSummaryService(exploreDataReqService);
    });

    it('validate service', () => {
        validateService(service, [WidgetConfigType.LOOK_THROUGH_SUMMARY], 'N');
    });

    it('test the LookThroughSummaryService modifyInputs', () => {
        const origColumns = new ColumnSet();
        const inputs = new Map<string, WidgetInput>();
        service['modifyWidgetInputsForRequest'](inputs);
        // nothing changes
        expect(inputs.size).toBe(0);
        inputs.set(WidgetInputType.COLUMNS, origColumns);
        origColumns.columns.push(ColumnConfig.createColumn(ColumnConstants.SECURITY_DESCRIPTION, UseType.ALL, ColumnConstants.SECURITY_DESCRIPTION + '_' + CommonUtils.generateUniqueIdAsString()));
        service['modifyWidgetInputsForRequest'](inputs);
        expect((origColumns.columns[0].optionValues[0] as CustomTitleColumnOption).customTitle).toEqual('Security Description');
    });
});

