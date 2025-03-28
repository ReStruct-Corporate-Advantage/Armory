import {Widget} from '../../../models/widget/widget.model';
import {ColumnSet} from '../../../../../projects/explore-ui-column-option/src/models/column-set/column-set.model';
import {
    DiversificationScoreTableSpriteletLauncherService
} from './diversification-score-table-spritelet-launcher.service';
import {TestUtils} from '../../../utils/test.utils';
import {WorkspaceStore} from "../../../stores";
import {Report} from '../../../models/workspace/report.model';
import {TestBed} from '@angular/core/testing';
import {WidgetConfigType} from '../../../../../projects/explore-ui-core/src/widget-config/enums';
import {Column, GetContextMenuItemsParams} from "ag-grid-community";
import {WidgetConstants} from "../../../constants";
import {NOTIFICATION_SERVICE_TOKEN} from "../../../../../projects/explore-ui-core/src/ui/tokens";
import {ColumnConstants} from "../../../../../projects/explore-ui-core/src/column/constants/column.constants";
import {UseType} from "../../../../../projects/explore-ui-core/src/core/enums";
import {SpriteletEvent} from "../../../models/spritelets/spritelet-event.model";

describe('DiversificationScoreTableSpriteletLauncherService test', () => {
    let service: DiversificationScoreTableSpriteletLauncherService;

    let parentWidget: Widget;
    let notificationServiceMock;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());
        notificationServiceMock = {
            error: jest.fn(),
            warning: jest.fn()
        };
        TestBed.configureTestingModule({
            providers: [
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceMock}
            ]
        });
        service = TestBed.inject(DiversificationScoreTableSpriteletLauncherService);

        parentWidget = new Widget(WidgetConfigType.PGS);
        const columnSet = parentWidget.dataStore.metaData.inputs.get('columns') as ColumnSet;
        columnSet.createColumnAndAdd(ColumnConstants.PORTFOLIO, ColumnConstants.PORTFOLIO, UseType.ALL);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(WidgetConstants.DIVERSIFICATION_SCORE_TIMESERIES.ACTION_KEY);
    });

    it('test getSpriteletActionKey', () => {
        const spritletActionKey = service.getSpriteletActionKey();
        expect(spritletActionKey).toBe(WidgetConstants.DIVERSIFICATION_SCORE_TIMESERIES.ACTION_KEY);
    });

    describe('test doLaunchSpritlet', () => {
        it('actionCol', () => {
            const getColumnId = jest.fn().mockImplementation(() => 'action_col');
            const hasChildren = jest.fn().mockImplementation(() => true);
            const column: Column = {getColId: getColumnId, columnKey: 'action_col'} as unknown as Column;
            const params = {column, node: {data: {portfolio: 'PORT1'}, hasChildren}} as unknown as GetContextMenuItemsParams;
            service.launchSpritelet(parentWidget, {params} as SpriteletEvent);
            const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];
            expect(widgetResult).toBeDefined();
            expect(widgetResult.configType).toBe(WidgetConfigType.DIVERSIFICATION_TS);
        });
    });

    describe('test isMandatoryColumn', () => {
        it('test isMandatoryColumn true', () => {
            const column = {columnTag: 'date'};
            const result = service.isMandatoryColumn(column as any);
            expect(result).toBeTruthy();
        });

        it('test isMandatoryColumn false', () => {
            const column = {columnTag: 'non_mandatory'};
            const result = service.isMandatoryColumn(column as any);
            expect(result).toBeFalsy();
        });
    });
});
