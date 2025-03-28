import {ColumnConfig, ColumnConstants, CoreUserMetaDataStore, PerformanceConstants, UserMetaData, UseType, WidgetConfigType} from '@blk/explore-ui-core';
import {TestUtils} from '@utils/test.utils';
import {Widget} from '../../../models/widget/widget.model';
import {WorkspaceStore} from '../../../stores';
import {ReturnWidgetRightClickHandler} from './return-widget-right-click.handler';
import {WidgetUtils} from '../../../utils/widget.utils';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {EventEmitter, Injector} from '@angular/core';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {HttpClient} from '@angular/common/http';
import {NotificationService} from '@services/notification';

describe('Return Widget Right Click Handler Test', () => {

    let returnWidgetRightClickHandler;
    let widget;
    let params: any;
    let residualParams: any;
    const httpClientMock = {
        get: jest.fn()
    };
    const notificationServiceMock = {
        openDialog: jest.fn(),
        error: jest.fn(),
        message: jest.fn(),
        success: jest.fn()
    };
    let injector: Injector;
    beforeAll((done) => {
        TestUtils.initialize(done);
        const options = {providers:[{provide: HttpClient, useValue: httpClientMock}, {provide: NotificationService, useValue: notificationServiceMock}]};
        injector = Injector.create(options);
        returnWidgetRightClickHandler = new ReturnWidgetRightClickHandler(injector);
        widget = new Widget(WidgetConfigType.RETURNS);
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.launchApps = ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW', 'ALADDIN_RESEARCH'];
        CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
        params = {
            node: {
                'group': false,
                'data': {
                    'pnl_id': 'SECURITY_GROUP.CASH.XAUD00001',
                    'cusip_hidden': 'XAUD00001'
                },
                hasChildren: jest.fn()
            },
            column: {
                getColId: () => {
                    return {'colId': 'cusip'};
                }
            },
            api: {
                getSelectedNodes: () => []
            }
        };
        residualParams = {
            node: {
                'group': false,
                    'data': {
                        'pnl_id': 'Security Group.Unassigned.USD_RESID',
                        'cusip_hidden': 'USD_RESID'
                },
                hasChildren: jest.fn(),
            },
            column: {
                getColId: () => {
                    return {'colId': 'cusip'};
                }
            },
            api: {
                getSelectedNodes: () => []
            }
        };
        jest.spyOn(WorkspaceStore, 'getCurrentPortfolio').mockReturnValue(new Portfolio('PEP'));
    });

    it('test getContextMenuItemsForAgGrid', () => {
        const inputs = widget.getCombinedInputs();
        const columnSet = inputs.get('columns') as ColumnSet;
        columnSet.columns = [];
        const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        const requestConfig = {columns: cols, portfolio: 'PEP'};
        const items = returnWidgetRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
        expect(items.length).toBe(10);
        expect(items[0].name).toBe('Expand');
        expect(items[1].name).toBe('Expand All Levels');
        expect(items[2].name).toBe('Collapse All Levels');
        expect(items[3]).toBe('separator');

        expect(items[4].name).toBe('Open Performance Details');
        expect(items[5].name).toBe('Open Chart');
        expect(items[5].subMenu.length).toBe(2);
        expect(items[5].subMenu[0].name).toBe('Time series chart');
        expect(items[5].subMenu[1].name).toBe('Price chart');

        expect(items[6].name).toBe('Launch');
        expect(items[6].subMenu.length).toBe(4);
        expect(items[6].subMenu[0].name).toBe('AladdinResearch');
        expect(items[6].subMenu[1].name).toBe('SecurityMaster');
        expect(items[6].subMenu[2].name).toBe('AladdinView');
        expect(items[6].subMenu[2].subMenu.length).toBe(4);
        expect(items[6].subMenu[2].subMenu[0].name).toBe('Positions View - All Portfolios');
        expect(items[6].subMenu[2].subMenu[1].name).toBe('Positions View - Related Funds');
        expect(items[6].subMenu[2].subMenu[2].name).toBe('Trade View - Yesterday\'s Trade');
        expect(items[6].subMenu[2].subMenu[3].name).toBe('Trade View - All Trades in Fund');
        expect(items[6].subMenu[3].name).toBe('AnSer');
        expect(items[7]).toBe('separator');
        expect(items[8].name).toBe('Copy');
        expect(items[9].name).toBe('Copy with Column Headers');
    });

    it('test getContextMenuItemsForAgGrid with residual node', () => {
        const inputs = widget.getCombinedInputs();
        const columnSet = inputs.get('columns') as ColumnSet;
        columnSet.columns = [];
        const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        const requestConfig = {columns: cols, portfolio: 'PEP'};
        const items = returnWidgetRightClickHandler.getContextMenuItemsForAgGrid(residualParams, requestConfig, null);
        expect(items.length).toBe(9);
        expect(items.indexOf('Open Performance Details')).toBe(-1);
    });

    it('test Open Time series chart', () => {
        const eventEmitter = new EventEmitter<SpriteletEvent>();
        const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        const requestConfig = {columns: cols, portfolio: 'PEP'};
        const items = returnWidgetRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, eventEmitter);
        jest.spyOn(eventEmitter, 'emit');
        items[5].subMenu[0].action();
        expect(eventEmitter.emit).toHaveBeenCalledWith( expect.objectContaining({
            actionName: PerformanceConstants.SPRITELET_EVENTS.RETURN_TIME_SERIES,
            params: params
        }));
    });

    it('test Open Performance details', () => {
        const eventEmitter = new EventEmitter<SpriteletEvent>();
        const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        const requestConfig = {columns: cols, portfolio: 'PEP'};
        const items = returnWidgetRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, eventEmitter);
        jest.spyOn(eventEmitter, 'emit');
        items[4].action();
        expect(eventEmitter.emit).toHaveBeenCalledWith( expect.objectContaining({
            actionName: PerformanceConstants.SPRITELET_EVENTS.RETURN_PERF_DETAILS,
            params: params
        }));
        expect(notificationServiceMock.success).toHaveBeenCalledTimes(1);
    });

    it('test Price Chart', () => {
        const priceLaunched = new EventEmitter<SpriteletEvent>();
        const inputs = widget.getCombinedInputs();
        const columnSet = inputs.get('columns') as ColumnSet;
        columnSet.columns = [];
        const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        const requestConfig = {columns: cols, portfolio: 'PEP'};
        const items = returnWidgetRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, priceLaunched);
        jest.spyOn(priceLaunched, 'emit');
        items[5].subMenu[1].action();
        expect(priceLaunched.emit).toHaveBeenCalledWith( expect.objectContaining({
            actionName: TabularWidgetConstants.PRICE_CHART_SPRITELET.ACTION_KEY,
            params: params,
            callbackMethodName: TabularWidgetConstants.PRICE_CHART_SPRITELET.CALLBACK_METHOD_NAME
        }));
    });

    it('test getMainMenuItemsForAgGrid', () => {
        params.defaultItems = [
            {
                name: 'Pin Column'
            },
            'separator',
            {
                name: 'Autosize This Column',
            }
        ];

        let cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        let requestConfig = {columns: cols, portfolio: 'PEP'};
        let items = returnWidgetRightClickHandler.getMainMenuItemsForAgGrid(params, requestConfig, null);
        expect(items.length).toBe(5);
        expect(items[0].name).toBe('Show Column Definition');
        expect(items[1]).toBe('separator');
        expect(items[2].name).toBe('Pin Column');
        expect(items[3]).toBe('separator');
        expect(items[4].name).toBe('Autosize This Column');

        const inputs = widget.getCombinedInputs();
        const columnSet = inputs.get('columns') as ColumnSet;
        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.MANAGER_TRACKING, UseType.ACTIVE, ColumnConstants.MANAGER_TRACKING));
        columnSet.columns.push(ColumnConfig.createColumn(PerformanceConstants.FX_ATTRIBUTION_COL_TAG, UseType.ACTIVE, PerformanceConstants.FX_ATTRIBUTION_COL_TAG));
        cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        params.column = {
            getColId: () => ColumnConstants.MANAGER_TRACKING
        };
        requestConfig = {columns: cols, portfolio: 'PEP'};
        items = returnWidgetRightClickHandler.getMainMenuItemsForAgGrid(params, requestConfig, null);
        expect(items.length).toBe(6);
        expect(items[0].name).toBe('Show Column Definition');
        expect(items[1]).toBe('separator');
        expect(items[2].name).toBe('Pin Column');
        expect(items[3]).toBe('separator');
        expect(items[4].name).toBe('Autosize This Column');
        expect(items[5].name).toBe('Open Manager Selection');

        params.column = {
            getColId: () => PerformanceConstants.FX_ATTRIBUTION_COL_TAG
        };
        requestConfig = {columns: cols, portfolio: 'PEP'};
        items = returnWidgetRightClickHandler.getMainMenuItemsForAgGrid(params, requestConfig, null);
         expect(items.length).toBe(6);
        expect(items[0].name).toBe('Show Column Definition');
        expect(items[1]).toBe('separator');
        expect(items[2].name).toBe('Pin Column');
        expect(items[3]).toBe('separator');
        expect(items[4].name).toBe('Autosize This Column');
        expect(items[5].name).toBe('Open FX Attribution');
    });

    it('test Open Manager Selection', () => {
        params.defaultItems = [
            {
                name: 'Pin Column'
            },
            'separator',
            {
                name: 'Autosize This Column',
            }
        ];
        const inputs = widget.getCombinedInputs();
        const columnSet = inputs.get('columns') as ColumnSet;
        columnSet.columns.push(ColumnConfig.createColumn(ColumnConstants.MANAGER_TRACKING, UseType.ACTIVE, ColumnConstants.MANAGER_TRACKING));
        const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        const requestConfig = {columns: cols, portfolio: 'PEP'};
        params.column = {
            getColId: () => ColumnConstants.MANAGER_TRACKING
        };
        const eventEmitter = new EventEmitter<SpriteletEvent>();
        jest.spyOn(eventEmitter, 'emit');
        const items = returnWidgetRightClickHandler.getMainMenuItemsForAgGrid(params, requestConfig, eventEmitter);
        items[5].action();
        expect(eventEmitter.emit).toHaveBeenCalledWith( expect.objectContaining({
            actionName: PerformanceConstants.SPRITELET_EVENTS.RETURN_MANAGER_SELECTION,
            params: params
        }));
    });

    it('test Open FX Attribution', () => {
        params.defaultItems = [
            {
                name: 'Pin Column'
            },
            'separator',
            {
                name: 'Autosize This Column',
            }
        ];
        const inputs = widget.getCombinedInputs();
        const columnSet = inputs.get('columns') as ColumnSet;
        columnSet.columns.push(ColumnConfig.createColumn(PerformanceConstants.FX_ATTRIBUTION_COL_TAG, UseType.ACTIVE, PerformanceConstants.FX_ATTRIBUTION_COL_TAG));
        const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        const requestConfig = {columns: cols, portfolio: 'PEP'};
        params.column = {
            getColId: () => PerformanceConstants.FX_ATTRIBUTION_COL_TAG
        };
        const eventEmitter = new EventEmitter<SpriteletEvent>();
        jest.spyOn(eventEmitter, 'emit');
        const items = returnWidgetRightClickHandler.getMainMenuItemsForAgGrid(params, requestConfig, eventEmitter);
        items[5].action();
        expect(eventEmitter.emit).toHaveBeenCalledWith( expect.objectContaining({
            actionName: PerformanceConstants.SPRITELET_EVENTS.RETURN_FX_ATTRIBUTION,
            params: params
        }));
    });

    it('tests processCusip', () => {
        expect(returnWidgetRightClickHandler.processCusip('CUSIP_DESCRIPTION.1234#2346')).toBe('1234%232346');
        expect(returnWidgetRightClickHandler.processCusip('1234#2346')).toBe('1234%232346');
        expect(returnWidgetRightClickHandler.processCusip('12342346')).toBe('12342346');
    });
});
