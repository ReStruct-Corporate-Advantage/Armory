import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '@stores/workspace.store';
import {Report} from '@models/workspace/report.model';
import {TestBed} from '@angular/core/testing';
import {WidgetConstants} from '@constants/widget.constants';
import {Widget} from '@models/widget/widget.model';
import {
    ColumnConfig, ColumnConstants,
    ColumnDefinition,
    CoreColumnUtils,
    NOTIFICATION_SERVICE_TOKEN,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {
    PgsHvarPnlTimeseriesTableSpritletLauncherService
} from '@services/spritelet-launcher/pgs-hvar-pnl-timeseries-table-spritlet-launcher.service';
import {Column, GetContextMenuItemsParams} from 'ag-grid-community';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';

describe('test PgsHvarPnlTimeseriesTableSpritletLauncherService', () => {

    let service: PgsHvarPnlTimeseriesTableSpritletLauncherService;

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
                PgsHvarPnlTimeseriesTableSpritletLauncherService,
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceMock}
            ],
        });
        service = TestBed.inject(PgsHvarPnlTimeseriesTableSpritletLauncherService);


        parentWidget = new Widget(WidgetConfigType.PGS);
        const colSet: ColumnSet = new ColumnSet();
        colSet.columns = [{columnTag: 'portfolio', positionColumnType: 'ALL', columnKey: 'portfolio', optionValues: []} as unknown as ColumnConfig, {columnTag: 'rk_pg_hvar_ctr', optionValues: []} as unknown as ColumnConfig];
        parentWidget.dataStore.metaData.inputs.set('columns', colSet);
    });

    it('test getSpriteletActionKey', () => {
        const spritletActionKey = service.getSpriteletActionKey();
        expect(spritletActionKey).toBe(WidgetConstants.HVAR_PNLS_TS.ACTION_KEY);
    });

    describe('test launchSpritelet when action made from PGS widget', () => {
        it('launch from Column', () => {
            jest.spyOn(CoreColumnUtils, 'getColumnDefByTag').mockImplementation((_colTag: string) => {
                const definition = new ColumnDefinition();
                definition.dataType = ColumnConstants.COLUMN_DATA_TYPE.DOUBLE;
                return definition;
            });
            const getColumnId = jest.fn().mockImplementation(function() {
                return 'rk_pg_hvar_ctr';
            });
            const column: Column = {getColId: getColumnId, getColDef: jest.fn(() => ({colTag: 'rk_pg_hvar_ctr'}))} as unknown as Column;
            const hasChildren = jest.fn().mockImplementation(() => true);
            const params = {column, node: {data: {portfolio: 'PORT1'}, hasChildren}} as unknown as GetContextMenuItemsParams;
            service.launchSpritelet(parentWidget, {params} as SpriteletEvent);
            const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];
            expect(widgetResult).toBeDefined();
            expect(widgetResult.configType).toBe(WidgetConfigType.PNL_TS);
        });
        describe('launch from action column', () => {
            it('Launch from root level', () => {
                jest.spyOn(CoreColumnUtils, 'getColumnDefByTag').mockImplementation((_colTag: string) => {
                    const definition = new ColumnDefinition();
                    definition.dataType = ColumnConstants.COLUMN_DATA_TYPE.DOUBLE;
                    return definition;
                });
                const getColumnId = jest.fn().mockImplementation(function() {
                    return 'actionCol';
                });
                const column: Column = {getColId: getColumnId} as unknown as Column;
                const hasChildren = jest.fn().mockImplementation(() => true);
                const params = {column, node: {data: {'_ROOT_': 'PORT1'}, level: 0, hasChildren}} as unknown as GetContextMenuItemsParams;
                service.launchSpritelet(parentWidget, {params} as SpriteletEvent);
                const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];
                expect(widgetResult).toBeDefined();
                expect(widgetResult.configType).toBe(WidgetConfigType.PNL_TS);
            });
            it('Launch from level1 group', () => {
                const getColumnId = jest.fn().mockImplementation(function() {
                    return 'actionCol';
                });
                const hasChildren = jest.fn().mockImplementation(function() {
                    return true;
                });
                const column: Column = {getColId: getColumnId} as unknown as Column;
                const params = {
                    column,
                    node: {data: {'level-1': 'PORT1'}, level: 1, hasChildren}
                } as unknown as GetContextMenuItemsParams;
                service.launchSpritelet(parentWidget, {params} as SpriteletEvent);
                const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];
                expect(widgetResult).toBeDefined();
                expect(widgetResult.configType).toBe(WidgetConfigType.PNL_TS);
            });
            it('Launch from leaf level', () => {
                const getColumnId = jest.fn().mockImplementation(function() {
                    return 'actionCol';
                });
                const hasChildren = jest.fn().mockImplementation(function() {
                    return false;
                });
                const column: Column = {getColId: getColumnId} as unknown as Column;
                const params = {column, node: {data: {portfolio: 'PORT1'}, hasChildren}} as unknown as GetContextMenuItemsParams;
                service.launchSpritelet(parentWidget, {params} as SpriteletEvent);
                const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];
                expect(widgetResult).toBeDefined();
                expect(widgetResult.configType).toBe(WidgetConfigType.PNL_TS);
            });
        });
    });

    describe('test isMandatoryColumn', () => {
        it('test isMandatoryColumn', () => {
            const column: ColumnConfig = {columnTag: 'hvar_sim_sd'} as ColumnConfig;
            const result = service.isMandatoryColumn(column);
            expect(result).toBeTruthy();
        });

        it('test isMandatoryColumn', () => {
            const column: ColumnConfig = {columnTag: 'hvar_sim_pnl'} as ColumnConfig;
            const result = service.isMandatoryColumn(column);
            expect(result).toBeFalsy();
        });
    });

    describe('test launchSpritelet when action made from RnE widget', () => {
        beforeEach(() => {
            parentWidget.configType = WidgetConfigType.RISK_EXPOSURE;
            const colSet = parentWidget.dataStore.metaData.inputs.get('columns') as ColumnSet;
            colSet.columns = [{columnTag: 'cusip', positionColumnType: 'ALL', columnKey: 'cusip', optionValues: []} as unknown as ColumnConfig, {columnTag: 'rk_pg_hvar_ctr', optionValues: []} as unknown as ColumnConfig];
        });
        it('launch from Column', () => {
            jest.spyOn(CoreColumnUtils, 'getColumnDefByTag').mockImplementation((_colTag: string) => {
                const definition = new ColumnDefinition();
                definition.dataType = ColumnConstants.COLUMN_DATA_TYPE.DOUBLE;
                return definition;
            });
            const getColumnId = jest.fn().mockImplementation(function() {
                return 'rk_pg_hvar_ctr';
            });
            const column: Column = {getColId: getColumnId, getColDef: jest.fn(() => ({colTag: 'rk_pg_hvar_ctr'}))} as unknown as Column;
            const hasChildren = jest.fn().mockImplementation(() => true);
            const params = {column, node: {data: {portfolio: 'PORT1'}, level: 0, hasChildren}} as unknown as GetContextMenuItemsParams;
            service.launchSpritelet(parentWidget, {params} as SpriteletEvent);
            const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];
            expect(widgetResult).toBeDefined();
            expect(widgetResult.configType).toBe(WidgetConfigType.PNL_TS);
            expect(widgetResult.dataStore.metaData.inputs.get(FundCusip.configType)).toBeUndefined();
        });
        describe('launch from action column', () => {
            it('Launch from root level', () => {
                jest.spyOn(CoreColumnUtils, 'getColumnDefByTag').mockImplementation((_colTag: string) => {
                    const definition = new ColumnDefinition();
                    definition.dataType = ColumnConstants.COLUMN_DATA_TYPE.DOUBLE;
                    return definition;
                });
                const getColumnId = jest.fn().mockImplementation(function() {
                    return 'actionCol';
                });
                const column: Column = {getColId: getColumnId} as unknown as Column;
                const hasChildren = jest.fn().mockImplementation(() => true);
                const params = {column, node: {data: {'_ROOT_': 'PORT1'}, level: 0, hasChildren}} as unknown as GetContextMenuItemsParams;
                service.launchSpritelet(parentWidget, {params} as SpriteletEvent);
                const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];
                expect(widgetResult).toBeDefined();
                expect(widgetResult.configType).toBe(WidgetConfigType.PNL_TS);
                expect(widgetResult.dataStore.metaData.inputs.get(FundCusip.configType)).toBeUndefined();
            });
            it('Launch from level1 group', () => {
                const getColumnId = jest.fn().mockImplementation(function() {
                    return 'actionCol';
                });
                const hasChildren = jest.fn().mockImplementation(function() {
                    return true;
                });
                const column: Column = {getColId: getColumnId} as unknown as Column;
                const params = {
                    column,
                    node: {data: {'level-1': 'PORT1'}, level: 1, hasChildren}
                } as unknown as GetContextMenuItemsParams;
                service.launchSpritelet(parentWidget, {params} as SpriteletEvent);
                const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];
                expect(widgetResult).toBeDefined();
                expect(widgetResult.configType).toBe(WidgetConfigType.PNL_TS);
                expect(widgetResult.dataStore.metaData.inputs.get(FundCusip.configType)).toBeDefined();
            });
            it('Launch from leaf level', () => {
                const getColumnId = jest.fn().mockImplementation(function() {
                    return 'actionCol';
                });
                const hasChildren = jest.fn().mockImplementation(function() {
                    return false;
                });
                const column: Column = {getColId: getColumnId} as unknown as Column;
                const params = {column, node: {data: {portfolio: 'PORT1'}, hasChildren}} as unknown as GetContextMenuItemsParams;
                service.launchSpritelet(parentWidget, {params} as SpriteletEvent);
                const widgetResult = WorkspaceStore.getCurrentReport().widgets[0];
                expect(widgetResult).toBeDefined();
                expect(widgetResult.configType).toBe(WidgetConfigType.PNL_TS);
                expect(widgetResult.dataStore.metaData.inputs.get(FundCusip.configType)).toBeDefined();
            });
        });
    });
});
