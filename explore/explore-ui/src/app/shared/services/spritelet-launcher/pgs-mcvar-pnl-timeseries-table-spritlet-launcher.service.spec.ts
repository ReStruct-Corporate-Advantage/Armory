import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '@stores/workspace.store';
import {Report} from '@models/workspace/report.model';
import {TestBed} from '@angular/core/testing';
import {WidgetConstants} from '@constants/widget.constants';
import {Widget} from '@models/widget/widget.model';
import {ColumnConstants, NOTIFICATION_SERVICE_TOKEN, UseType, WidgetConfigType} from '@blk/explore-ui-core';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {
    PgsMCvarPnlTimeseriesTableSpritletLauncherService
} from '@services/spritelet-launcher/pgs-mcvar-pnl-timeseries-table-spritlet-launcher.service';
import {Column, GetContextMenuItemsParams} from 'ag-grid-community';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {ColumnSet} from '@blk/explore-ui-column-option';

describe('test PgsMCvarPnlTimeseriesTableSpritletLauncherService', () => {

    let service: PgsMCvarPnlTimeseriesTableSpritletLauncherService;

    let parentWidget: Widget;
    let notificationServiceMock;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());

        notificationServiceMock = {
            error: jest.fn()
        };

        const portfolio = new Portfolio();
        portfolio.portName = 'ISHT7-10';

        WorkspaceStore.currentPortfolio$.next(portfolio);

        TestBed.configureTestingModule({
            providers: [
                PgsMCvarPnlTimeseriesTableSpritletLauncherService,
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceMock}
            ],
        });
        service = TestBed.inject(PgsMCvarPnlTimeseriesTableSpritletLauncherService);


        parentWidget = new Widget(WidgetConfigType.PGS);
        const columnSet = parentWidget.dataStore.metaData.inputs.get('columns') as ColumnSet;
        columnSet.createColumnAndAdd(ColumnConstants.PORTFOLIO, ColumnConstants.PORTFOLIO, UseType.ALL);
    });

    it('test getSpriteletActionKey', () => {
        const spritletActionKey = service.getSpriteletActionKey();
        expect(spritletActionKey).toBe(WidgetConstants.MCVAR_SIMULATION_PNLS.ACTION_KEY);
    });

    it('test launchSpritelet', () => {
        const getColumnId = jest.fn();
        const hasChildren = jest.fn().mockImplementation(() => true);
        const column: Column = {getColId: getColumnId, columnKey: 'portfolio', getColDef: jest.fn(() => ({colTag: 'portfolio'}))} as unknown as Column;
        const params = {column, node: {data: {portfolio: 'PORT1'}, hasChildren}} as unknown as GetContextMenuItemsParams;
        service.launchSpritelet(parentWidget, {params} as SpriteletEvent);
        const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];
        expect(widgetResult).toBeDefined();
        expect(widgetResult.configType).toBe(WidgetConfigType.MCVAR_PNL_TS);
    });

    describe('test isMandatoryColumn', () => {
        it('test isMandatoryColumn true', () => {
            const column = {columnTag: 'mcvar_sim_pnl_path'};
            const result = service.isMandatoryColumn(column as any);
            expect(result).toBeTruthy();
        });

        it('test isMandatoryColumn false', () => {
            const column = {columnTag: 'mcvar_sim_pnl_path1'};
            const result = service.isMandatoryColumn(column as any);
            expect(result).toBeFalsy();
        });
    });
});
