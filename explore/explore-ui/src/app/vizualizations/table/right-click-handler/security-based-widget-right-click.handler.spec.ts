import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';
import {SecurityBasedWidgetRightClickHandler} from './security-based-widget-right-click.handler';
import {WorkspaceStore} from '../../../stores';
import {WidgetUtils} from '@utils/widget.utils';
import {RequestAdapterConfig, VizualizationColumnConfig} from '../../../interfaces';
import {EventEmitter, Injector} from '@angular/core';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {
    ColumnConstants,
    ColumnDefinition,
    CommonUtils,
    CoreColumnUtils,
    CoreDefinitionStore,
    CoreUserMetaDataStore,
    DateValue,
    TokenConstants,
    UserMetaData,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {HttpClient} from '@angular/common/http';
import {NotificationService} from '@services/notification';
import {of} from 'rxjs';
import {AppUtils} from '@utils/app.utils';
import {RightClickHandlerUtils} from './utils/right-click-handler.utils';
import {CommonConstants} from '@constants/common.constants';
import {WidgetConstants} from '@constants/widget.constants';

describe('Security Based Right Click Handler Test', () => {

    let securityBasedRightClickHandler;
    let requestConfig: RequestAdapterConfig;
    let params: any;
    const httpClientMock = {
        get: jest.fn()
    };
    const notificationServiceMock = {
        openDialog: jest.fn(),
        error: jest.fn(),
        warning: jest.fn()
    };
    let injector: Injector;
    beforeAll((done) => {
        TestUtils.initialize(done);
        const options = {providers: [{provide: HttpClient, useValue: httpClientMock}, {provide: NotificationService, useValue: notificationServiceMock}]};
        injector = Injector.create(options);
        securityBasedRightClickHandler = new SecurityBasedWidgetRightClickHandler(injector);
        const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        requestConfig = {columns: cols, portfolio: 'PEP'};
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.launchApps = ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW', 'ALADDIN_RESEARCH'];
        CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
        params = {
            node: {
                'group': false,
                'data': {
                    'cusip_0': 'Cusip1',
                    'security_description_1': 'Security Description 1',
                    'sec_group_hidden': 'CMBS'
                },

                hasChildren: jest.fn()
            },
            column: {
                getColDef: () => {
                    return {'colTag': 'cusip'};
                },
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

    it('test getContextMenuItemsForAgGrid when security is private fund', () => {
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_CLIMATE_ENABLED] = 'N';
        CoreDefinitionStore.tokens[TokenConstants.ENABLE_COMMITMENT_RISK_LEGACY] = 'Y';
        const paramsNew = {
            node: {
                'group': false,
                'data': {
                    'cusip_0': 'Cusip1',
                    'security_description_1': 'Security Description 1',
                    'sec_group_hidden': 'FUND',
                    'sec_type_hidden': 'PRIVATE'
                },
                hasChildren: jest.fn()
            },
            column: {
                getColDef: () => {
                    return {'colTag': 'cusip'};
                },
                getColId: () => {
                    return {'colId': 'cusip'};
                }
            },
            api: {
                getSelectedNodes: () => []
            }
        };
        let items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(paramsNew, requestConfig);
        expect(items.length).toBe(9);
        expect(items[0].name).toBe('Expand');
        expect(items[1].name).toBe('Expand All Levels');
        expect(items[2].name).toBe('Collapse All Levels');
        expect(items[3]).toBe('separator');

        expect(items[4].name).toBe('Open Chart');
        expect(items[4].subMenu.length).toBe(1);
        expect(items[4].subMenu[0].name).toBe('Price chart');

        expect(items[5].name).toBe('Launch');
        expect(items[5].subMenu.length).toBe(5);
        expect(items[5].subMenu[0].name).toBe('AladdinResearch');
        expect(items[5].subMenu[1].name).toBe('SecurityMaster');
        expect(items[5].subMenu[2].name).toBe('AladdinView');
        expect(items[5].subMenu[2].subMenu.length).toBe(4);
        expect(items[5].subMenu[2].subMenu[0].name).toBe('Positions View - All Portfolios');
        expect(items[5].subMenu[2].subMenu[1].name).toBe('Positions View - Related Funds');
        expect(items[5].subMenu[2].subMenu[2].name).toBe('Trade View - Yesterday\'s Trade');
        expect(items[5].subMenu[2].subMenu[3].name).toBe('Trade View - All Trades in Fund');
        expect(items[5].subMenu[3].name).toBe('AnSer');
        expect(items[5].subMenu[4].name).toBe('Commitment risk');

        expect(items[6]).toBe('separator');
        expect(items[7].name).toBe('Copy');
        expect(items[8].name).toBe('Copy with Column Headers');

        CoreDefinitionStore.tokens[TokenConstants.ENABLE_COMMITMENT_RISK_LEGACY] = 'N';
        CoreDefinitionStore.tokens[TokenConstants.ENABLE_COMMITMENT_RISK] = 'N';
        items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(paramsNew, requestConfig);
        expect(items.length).toBe(9);
        expect(items[0].name).toBe('Expand');
        expect(items[1].name).toBe('Expand All Levels');
        expect(items[2].name).toBe('Collapse All Levels');
        expect(items[3]).toBe('separator');

        expect(items[4].name).toBe('Open Chart');
        expect(items[4].subMenu.length).toBe(1);
        expect(items[4].subMenu[0].name).toBe('Price chart');
        expect(items[5].name).toBe('Launch');
        expect(items[5].subMenu.length).toBe(4);
        expect(items[5].subMenu[0].name).toBe('AladdinResearch');
        expect(items[5].subMenu[1].name).toBe('SecurityMaster');
        expect(items[5].subMenu[2].name).toBe('AladdinView');
        expect(items[5].subMenu[2].subMenu.length).toBe(4);
        expect(items[5].subMenu[2].subMenu[0].name).toBe('Positions View - All Portfolios');
        expect(items[5].subMenu[2].subMenu[1].name).toBe('Positions View - Related Funds');
        expect(items[5].subMenu[2].subMenu[2].name).toBe('Trade View - Yesterday\'s Trade');
        expect(items[5].subMenu[2].subMenu[3].name).toBe('Trade View - All Trades in Fund');
        expect(items[5].subMenu[3].name).toBe('AnSer');

        expect(items[6]).toBe('separator');
        expect(items[7].name).toBe('Copy');
        expect(items[8].name).toBe('Copy with Column Headers');
    });

    it('test getContextMenuItemsForAgGrid price chart perm check', () => {
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_PRICE_CHART] = 'N';
        let items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        expect(items.length).toBe(8);
        expect(items[0].name).toBe('Expand');
        expect(items[1].name).toBe('Expand All Levels');
        expect(items[2].name).toBe('Collapse All Levels');
        expect(items[3]).toBe('separator');

        expect(items[4].name).toBe('Launch');
        expect(items[4].subMenu.length).toBe(4);
        expect(items[4].subMenu[0].name).toBe('AladdinResearch');
        expect(items[4].subMenu[1].name).toBe('SecurityMaster');
        expect(items[4].subMenu[2].name).toBe('AladdinView');
        expect(items[4].subMenu[2].subMenu.length).toBe(4);
        expect(items[4].subMenu[2].subMenu[0].name).toBe('Positions View - All Portfolios');
        expect(items[4].subMenu[2].subMenu[1].name).toBe('Positions View - Related Funds');
        expect(items[4].subMenu[2].subMenu[2].name).toBe('Trade View - Yesterday\'s Trade');
        expect(items[4].subMenu[2].subMenu[3].name).toBe('Trade View - All Trades in Fund');
        expect(items[4].subMenu[3].name).toBe('AnSer');
        expect(items[5]).toBe('separator');
        expect(items[6].name).toBe('Copy');
        expect(items[7].name).toBe('Copy with Column Headers');

        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_PRICE_CHART] = 'Y';
        items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        expect(items.length).toBe(9);
        expect(items[0].name).toBe('Expand');
        expect(items[1].name).toBe('Expand All Levels');
        expect(items[2].name).toBe('Collapse All Levels');
        expect(items[3]).toBe('separator');

        expect(items[4].name).toBe('Open Chart');
        expect(items[4].subMenu.length).toBe(1);
        expect(items[4].subMenu[0].name).toBe('Price chart');

        expect(items[5].name).toBe('Launch');
        expect(items[5].subMenu.length).toBe(4);
        expect(items[5].subMenu[0].name).toBe('AladdinResearch');
        expect(items[5].subMenu[1].name).toBe('SecurityMaster');
        expect(items[5].subMenu[2].name).toBe('AladdinView');
        expect(items[5].subMenu[2].subMenu.length).toBe(4);
        expect(items[5].subMenu[2].subMenu[0].name).toBe('Positions View - All Portfolios');
        expect(items[5].subMenu[2].subMenu[1].name).toBe('Positions View - Related Funds');
        expect(items[5].subMenu[2].subMenu[2].name).toBe('Trade View - Yesterday\'s Trade');
        expect(items[5].subMenu[2].subMenu[3].name).toBe('Trade View - All Trades in Fund');
        expect(items[5].subMenu[3].name).toBe('AnSer');

        expect(items[6]).toBe('separator');
        expect(items[7].name).toBe('Copy');
        expect(items[8].name).toBe('Copy with Column Headers');
    });

    it('test getContextMenuItemsForAgGrid', () => {
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_CLIMATE_ENABLED] = 'N';
        let items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        expect(items.length).toBe(9);
        expect(items[0].name).toBe('Expand');
        expect(items[1].name).toBe('Expand All Levels');
        expect(items[2].name).toBe('Collapse All Levels');
        expect(items[3]).toBe('separator');

        expect(items[4].name).toBe('Open Chart');
        expect(items[4].subMenu.length).toBe(1);
        expect(items[4].subMenu[0].name).toBe('Price chart');
        expect(items[5].name).toBe('Launch');
        expect(items[5].subMenu.length).toBe(4);
        expect(items[5].subMenu[0].name).toBe('AladdinResearch');
        expect(items[5].subMenu[1].name).toBe('SecurityMaster');
        expect(items[5].subMenu[2].name).toBe('AladdinView');
        expect(items[5].subMenu[2].subMenu.length).toBe(4);
        expect(items[5].subMenu[2].subMenu[0].name).toBe('Positions View - All Portfolios');
        expect(items[5].subMenu[2].subMenu[1].name).toBe('Positions View - Related Funds');
        expect(items[5].subMenu[2].subMenu[2].name).toBe('Trade View - Yesterday\'s Trade');
        expect(items[5].subMenu[2].subMenu[3].name).toBe('Trade View - All Trades in Fund');
        expect(items[5].subMenu[3].name).toBe('AnSer');
        expect(items[6]).toBe('separator');
        expect(items[7].name).toBe('Copy');
        expect(items[8].name).toBe('Copy with Column Headers');

        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_CLIMATE_ENABLED] = 'Y';
        items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        expect(items.length).toBe(9);
        expect(items[0].name).toBe('Expand');
        expect(items[1].name).toBe('Expand All Levels');
        expect(items[2].name).toBe('Collapse All Levels');
        expect(items[3]).toBe('separator');

        expect(items[4].name).toBe('Open Chart');
        expect(items[4].subMenu.length).toBe(1);
        expect(items[4].subMenu[0].name).toBe('Price chart');

        expect(items[5].name).toBe('Launch');
        expect(items[5].subMenu.length).toBe(4);
        expect(items[5].subMenu[0].name).toBe('AladdinResearch');
        expect(items[5].subMenu[1].name).toBe('SecurityMaster');
        expect(items[5].subMenu[2].name).toBe('AladdinView');
        expect(items[5].subMenu[2].subMenu.length).toBe(4);
        expect(items[5].subMenu[2].subMenu[0].name).toBe('Positions View - All Portfolios');
        expect(items[5].subMenu[2].subMenu[1].name).toBe('Positions View - Related Funds');
        expect(items[5].subMenu[2].subMenu[2].name).toBe('Trade View - Yesterday\'s Trade');
        expect(items[5].subMenu[2].subMenu[3].name).toBe('Trade View - All Trades in Fund');
        expect(items[5].subMenu[3].name).toBe('AnSer');

        expect(items[6]).toBe('separator');
        expect(items[7].name).toBe('Copy');
        expect(items[8].name).toBe('Copy with Column Headers');

        CoreDefinitionStore.tokens[TokenConstants.CLARITY_PREMIUM_ACCESS] = 'Y';
        items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        expect(items.length).toBe(9);
        expect(items[0].name).toBe('Expand');
        expect(items[1].name).toBe('Expand All Levels');
        expect(items[2].name).toBe('Collapse All Levels');
        expect(items[3]).toBe('separator');

        expect(items[4].name).toBe('Open Chart');
        expect(items[4].subMenu.length).toBe(1);
        expect(items[4].subMenu[0].name).toBe('Price chart');

        expect(items[5].name).toBe('Launch');
        expect(items[5].subMenu.length).toBe(4);
        expect(items[5].subMenu[0].name).toBe('AladdinResearch');
        expect(items[5].subMenu[1].name).toBe('SecurityMaster');
        expect(items[5].subMenu[2].name).toBe('AladdinView');
        expect(items[5].subMenu[2].subMenu.length).toBe(4);
        expect(items[5].subMenu[2].subMenu[0].name).toBe('Positions View - All Portfolios');
        expect(items[5].subMenu[2].subMenu[1].name).toBe('Positions View - Related Funds');
        expect(items[5].subMenu[2].subMenu[2].name).toBe('Trade View - Yesterday\'s Trade');
        expect(items[5].subMenu[2].subMenu[3].name).toBe('Trade View - All Trades in Fund');
        expect(items[5].subMenu[3].name).toBe('AnSer');

        expect(items[6]).toBe('separator');
        expect(items[7].name).toBe('Copy');
        expect(items[8].name).toBe('Copy with Column Headers');

        CoreDefinitionStore.tokens[TokenConstants.CLARITY_AI_LINK_OUT_ACCESS] = 'Y';
        items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        expect(items.length).toBe(9);
        expect(items[0].name).toBe('Expand');
        expect(items[1].name).toBe('Expand All Levels');
        expect(items[2].name).toBe('Collapse All Levels');
        expect(items[3]).toBe('separator');

        expect(items[4].name).toBe('Open Chart');
        expect(items[4].subMenu.length).toBe(1);
        expect(items[4].subMenu[0].name).toBe('Price chart');

        expect(items[5].name).toBe('Launch');
        expect(items[5].subMenu.length).toBe(5);

        expect(items[5].subMenu[0].name).toBe('AladdinResearch');
        expect(items[5].subMenu[1].name).toBe('SecurityMaster');
        expect(items[5].subMenu[2].name).toBe('AladdinView');
        expect(items[5].subMenu[2].subMenu.length).toBe(4);
        expect(items[5].subMenu[2].subMenu[0].name).toBe('Positions View - All Portfolios');
        expect(items[5].subMenu[2].subMenu[1].name).toBe('Positions View - Related Funds');
        expect(items[5].subMenu[2].subMenu[2].name).toBe('Trade View - Yesterday\'s Trade');
        expect(items[5].subMenu[2].subMenu[3].name).toBe('Trade View - All Trades in Fund');
        expect(items[5].subMenu[3].name).toBe('Clarity AI ESG Summary');
        expect(items[5].subMenu[4].name).toBe('AnSer');

        expect(items[6]).toBe('separator');
        expect(items[7].name).toBe('Copy');
        expect(items[8].name).toBe('Copy with Column Headers');

        const paramsNew = {
            node: {
                'group': false,
                'data': {
                    'cusip_0': 'Cusip1',
                    'security_description_1': 'Security Description 1',
                    'sec_group_hidden': 'CMBS'
                },
                hasChildren: jest.fn()
            },
            column: {
                getColDef: () => {
                    return {'colTag': 'pc_prepay_rate_1y'};
                },
                getColId: () => {
                    return {'colId': 'ag-Grid-AutoColumn'};
                }
            },
            api: {
                getSelectedNodes: () => []
            }
        };
        const requestConfigNew = {...requestConfig};
        requestConfigNew.columns.push(
            {
                originalColumnTitle: '"Physical Climate Adj. 1 Year CPR"',
                columnKey: '"pc_prepay_rate_1y_83a653b8ffd149a"',
                columnTag: 'pc_prepay_rate_1y',
                columnTitle: '"Physical Climate Adj. 1 Year CPR"',
                dataType: 'STRING',
                pClimateScenarioSettings: []
            }
        );
        requestConfigNew.columns.push(
            {
                originalColumnTitle: '"Transition Climate Adj. 1 Year CPR"',
                columnKey: '"tr_prepay_rate_1y_83a653b8ffd149a"',
                columnTag: 'tr_prepay_rate_1y',
                columnTitle: '"Transition Climate Adj. 1 Year CPR"',
                dataType: 'STRING',
                tClimateScenarioSettings: []
            }
        );
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_CLIMATE_LINKOUT_ENABLED] = 'Y';
        items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        expect(items[5].subMenu[3].name).toBe('Clarity AI ESG Summary');
        expect(items[5].subMenu[4].name).toBe('Aladdin Climate');
        items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(paramsNew, requestConfigNew);
        expect(items[5].subMenu[4].name).toBe('Aladdin Climate');

        paramsNew.column.getColDef = () => {
            return {'colTag': 'tr_prepay_rate_1y'};
        };
        items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(paramsNew, requestConfigNew);
        expect(items[5].subMenu[4].name).toBe('Aladdin Climate');
        expect(items[5].subMenu[5].name).toBe('AnSer');

        // re-disable tokens for other tests
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_CLIMATE_LINKOUT_ENABLED] = 'N';
        CoreDefinitionStore.tokens[TokenConstants.CLARITY_PREMIUM_ACCESS] = 'N';
        CoreDefinitionStore.tokens[TokenConstants.CLARITY_AI_LINK_OUT_ACCESS] = 'N';
    });



    it('test Price chart', () => {
        const eventEmitter = new EventEmitter<SpriteletEvent>();
        const items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, eventEmitter);
        jest.spyOn(eventEmitter, 'emit');
        items[4].subMenu[0].action();
        expect(eventEmitter.emit).toHaveBeenCalledWith( expect.objectContaining({
            actionName: TabularWidgetConstants.PRICE_CHART_SPRITELET.ACTION_KEY,
            params,
            callbackMethodName: TabularWidgetConstants.PRICE_CHART_SPRITELET.CALLBACK_METHOD_NAME
        }));
    });

    it('test AladdinResearch', () => {
        jest.spyOn(securityBasedRightClickHandler, 'launchApp');
        const items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        items[5].subMenu[0].action();
        expect(securityBasedRightClickHandler.launchApp).toHaveBeenCalledWith(TabularWidgetConstants.LAUNCH_ALADDIN_RESEARCH, 'Cusip1', undefined);
    });

    it('test SecurityMaster', () => {
        jest.spyOn(securityBasedRightClickHandler, 'launchApp');
        const items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        items[5].subMenu[1].action();
        expect(securityBasedRightClickHandler.launchApp).toHaveBeenCalledWith(TabularWidgetConstants.LAUNCH_SEC_MASTER, 'Cusip1', undefined);
    });

    it('test AladdinView - Positions View - All Portfolios', () => {
        jest.spyOn(securityBasedRightClickHandler, 'launchAladdinView');
        const items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        items[5].subMenu[2].subMenu[0].action();
        expect(securityBasedRightClickHandler.launchAladdinView).toHaveBeenCalledWith('positions&cusip=Cusip1&pos_date=T');
    });

    it('test AladdinView - Positions View - Related Funds', () => {
        jest.spyOn(securityBasedRightClickHandler, 'launchAladdinView');
        const items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        items[5].subMenu[2].subMenu[1].action();
        expect(securityBasedRightClickHandler.launchAladdinView).toHaveBeenCalledWith('positions&cusip=Cusip1&pos_date=T&port_group=PEP');
    });

    it('test AladdinView - Trade View - Yesterday\'s Trade', () => {
        jest.spyOn(securityBasedRightClickHandler, 'launchAladdinView');
        const items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        items[5].subMenu[2].subMenu[2].action();
        expect(securityBasedRightClickHandler.launchAladdinView).toHaveBeenCalledWith('trades&cusip=Cusip1&trade_date=T-1B&end_trade_date=T&port_group=PEP');
    });

    it('test AladdinView - Trade View - All Trades in Fund', () => {
        jest.spyOn(securityBasedRightClickHandler, 'launchAladdinView');
        const items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        items[5].subMenu[2].subMenu[3].action();
        expect(securityBasedRightClickHandler.launchAladdinView).toHaveBeenCalledWith('trades&cusip=Cusip1&trade_date=T-1B&end_trade_date=T&port_group=PEP');
    });

    it('test AnSer', () => {
        jest.spyOn(securityBasedRightClickHandler, 'launchApp');
        const items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        items[5].subMenu[3].action();
        expect(securityBasedRightClickHandler.launchApp).toHaveBeenCalledWith(TabularWidgetConstants.LAUNCH_ANSER, ['Cusip1'], undefined);
    });

    it('test AnSer - with selected nodes', () => {
        jest.spyOn(securityBasedRightClickHandler, 'launchApp');
        // With selected rows
        jest.spyOn(params.api, 'getSelectedNodes').mockReturnValue([
            {
                'group': false,
                'data': {
                    'cusip_0': 'Cusip1',
                    'security_description_1': 'Security Description 1'
                }
            },
            {
                'group': false,
                'data': {
                    'cusip_0': 'Cusip2',
                    'security_description_1': 'Security Description 2'
                }
            }]);
        const items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        items[5].subMenu[3].action();
        expect(securityBasedRightClickHandler.launchApp).toHaveBeenCalledWith(TabularWidgetConstants.LAUNCH_ANSER, ['Cusip1', 'Cusip2'], undefined);
    });

    it('test AnSer - with selected nodes - node right clicked on not selected', () => {
        jest.spyOn(securityBasedRightClickHandler, 'launchApp');
        // With selected rows
        jest.spyOn(params.api, 'getSelectedNodes').mockReturnValue([
            {
                'group': false,
                'data': {
                    'cusip_0': 'Cusip3',
                    'security_description_1': 'Security Description 3'
                }
            },
            {
                'group': false,
                'data': {
                    'cusip_0': 'Cusip2',
                    'security_description_1': 'Security Description 2'
                }
            }]);
        const items = securityBasedRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig);
        items[5].subMenu[3].action();
        expect(securityBasedRightClickHandler.launchApp).toHaveBeenCalledWith(TabularWidgetConstants.LAUNCH_ANSER, ['Cusip1'], undefined);
    });

    it('test Launch app - launching Security Master', () => {
        const fnSpy = jest.spyOn(window, 'open');
        securityBasedRightClickHandler.launchApp(TabularWidgetConstants.LAUNCH_SEC_MASTER, 'Cusip1');
        expect(fnSpy).toHaveBeenCalledWith('https://dev.blackrock.com/LaunchApp/SM2?close_window=1&cusip=Cusip1', 'SecMaster', 'height=200,width=200');
    });

    it('test Launch app - launching Anser - with single cusip', () => {
        const fnSpy = jest.spyOn(window, 'open');
        securityBasedRightClickHandler.launchApp(TabularWidgetConstants.LAUNCH_ANSER, ['Cusip1']);
        expect(fnSpy).toHaveBeenCalledWith('https://dev.blackrock.com/LaunchApp/Anser?close_window=1&cusip=Cusip1', 'AnSer', 'height=200,width=200');
    });

    it('test Launch app - launching Anser - with multiple cusip', () => {
        const fnSpy = jest.spyOn(window, 'open');
        securityBasedRightClickHandler.launchApp(TabularWidgetConstants.LAUNCH_ANSER, ['Cusip1', 'Cusip2']);
        expect(fnSpy).toHaveBeenCalledWith('https://dev.blackrock.com/LaunchApp/Anser?close_window=1&cusip0=Cusip1&cusip1=Cusip2', 'AnSer', 'height=200,width=200');
    });

    it('test Launch app - launching Aladdin Research', () => {
        const fnSpy = jest.spyOn(window, 'open');
        securityBasedRightClickHandler.launchApp(TabularWidgetConstants.LAUNCH_ALADDIN_RESEARCH, 'Cusip1');
        expect(fnSpy).toHaveBeenCalledWith('https://dev.blackrock.com/apps/aladdin-research/#/profile/Cusip1');
    });

    it('test Launch app - launching AladdinView', () => {
        const fnSpy = jest.spyOn(window, 'open');
        securityBasedRightClickHandler.launchAladdinView('Explore');
        expect(fnSpy).toHaveBeenCalledWith('https://dev.blackrock.com/aladdinview/permalink?tool=Explore');
    });

    it('test Launch app - launching Clarity AI', () => {
        jest.clearAllMocks();
        jest.spyOn(WorkspaceStore, 'getCurrentPortfolio').mockReturnValue(new Portfolio('PEP', DateValue.newDate('09/01/2022')));
        const magicURLResponse = {
            args: {},
            output: '',
            transactionContext: {},
            return_val: 'FAILURE',
            transactionId: '',
            command: '',
        };
        const fnSpy = jest.spyOn(window, 'open');
        securityBasedRightClickHandler.launchApp(TabularWidgetConstants.LAUNCH_CLARITY_AI);
        expect(notificationServiceMock.openDialog).toHaveBeenCalled();
        httpClientMock.get = jest.fn(() => {
            return of(magicURLResponse);
        });
        // call dialog callback to trigger Clarity AI launch
        notificationServiceMock.openDialog.mock.calls[0][0].dialogCallBack1();
        expect(notificationServiceMock.warning).toHaveBeenCalledTimes(1);
        expect(notificationServiceMock.error).toHaveBeenCalledTimes(1);
        expect(fnSpy).toHaveBeenCalledTimes(0);

        securityBasedRightClickHandler.launchApp(TabularWidgetConstants.LAUNCH_CLARITY_AI, '874039100');
        httpClientMock.get = jest.fn(() => {
            return of({...magicURLResponse, output: 'https://go.clarity.ai/', return_val: 'SUCCESS'});
        });
        notificationServiceMock.openDialog.mock.calls[0][0].dialogCallBack1('874039100');
        expect(httpClientMock.get).toHaveBeenCalledWith(AppUtils.getBaseUrl(false) + 'esg/CLARITY_AI_LINK?cusip.__string=874039100');
        expect(notificationServiceMock.warning).toHaveBeenCalledTimes(2);
        expect(fnSpy).toHaveBeenCalledTimes(1);
        expect(fnSpy).toHaveBeenCalledWith('https://go.clarity.ai/', '_blank');
    });

    it('test Launch app - launching Aladdin Climate', () => {
        jest.clearAllMocks();
        const fnSpy = jest.spyOn(window, 'open');

        jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(true);
        jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValue(false);
        securityBasedRightClickHandler.launchApp(TabularWidgetConstants.LAUNCH_ALADDIN_CLIMATE, 'Cusip1');
        expect(fnSpy).toHaveBeenCalledWith('https://dev.blackrock.com/apps/aladdin-climate-beta/#/entity/Cusip1?lookup=true');

        jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(false);
        jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValue(true);
        securityBasedRightClickHandler.launchApp(TabularWidgetConstants.LAUNCH_ALADDIN_CLIMATE, 'Cusip1');
        expect(fnSpy).toHaveBeenCalledWith('https://dev.blackrock.com/apps/aladdin-climate-beta/#/entity/Cusip1?lookup=true');

        jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(false);
        jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValue(false);
        securityBasedRightClickHandler.launchApp(TabularWidgetConstants.LAUNCH_ALADDIN_CLIMATE, 'Cusip1');
        expect(fnSpy).toHaveBeenCalledWith('https://dev.blackrock.com/apps/aladdin-climate/#/entity/Cusip1?lookup=true');
    });

    it('test getWidgetConfigTypes', () => {
        const widgetConfigTypes = SecurityBasedWidgetRightClickHandler.getWidgetConfigTypes();
        expect(widgetConfigTypes).toBeDefined();
        expect(widgetConfigTypes.length).toBe(1);
        expect(widgetConfigTypes[0]).toBe(WidgetConfigType.RISK_EXPOSURE);
    });

    it('test getWidgetSpecificContextMenuItems with root node - IRR Cash Flow', () => {
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_IRR] = 'Y';
        params = {
            node: {
                parent: null,
                level: 0,
                data: {}
            },
            column: {
                getColId: () => ColumnConstants.ACTION_COL,
            },
            api: {
                getSelectedNodes: () => [],
            }
        };
        requestConfig = {columns: [], portfolio: 'PEP'};
        requestConfig.columns.push({columnTag: 'net_irr'} as VizualizationColumnConfig);

        jest.spyOn(CoreColumnUtils, 'getColumnDefByTag').mockReturnValue({isIRRColumn: () => true, isHVaRColumn: () => false, isMCVaRColumn: () => false} as ColumnDefinition);
        const spriteletLaunched = {};
        const menuItems = securityBasedRightClickHandler.getWidgetSpecificContextMenuItems(params, requestConfig, spriteletLaunched);
        // Launch AnSer, IRR, separator
        expect(menuItems.length).toEqual(3);
        expect(menuItems[0].name).toEqual(RightClickHandlerUtils.LAUNCH);
        expect(menuItems[1].name).toEqual(WidgetConstants.DOWNLOAD_CASHFLOW_SPRITELET.ACTION_NAME);
        expect(menuItems[2]).toEqual(CommonConstants.SEPARATOR);
    });

    describe('test getWidgetSpecifricContextMenuItems - HVAR, MCVAR', () => {
        it('test getWidgetSpecificContextMenuItems with root node - HVAR, MCVAR - No options displayed', () => {
            params = {
                node: {
                    parent: null,
                    data: {}
                },
                column: {
                    getColId: () => ColumnConstants.ACTION_COL,
                },
                api: {
                    getSelectedNodes: () => [],
                }
            };
            requestConfig = {columns: [], portfolio: 'PEP'};
            const spriteletLaunched = {};
            const menuItems = securityBasedRightClickHandler.getWidgetSpecificContextMenuItems(params, requestConfig, spriteletLaunched);
            // Launch AnSer + separator
            expect(menuItems.length).toEqual(2);
            expect(menuItems[0].name).toEqual(RightClickHandlerUtils.LAUNCH);
            expect(menuItems[1]).toEqual(CommonConstants.SEPARATOR);
        });

        it('test getWidgetSpecificContextMenuItems with sector node - HVAR, MCVAR - No options displayed', () => {
            params = {
                node: {
                    parent: {},
                    level: 1,
                    group: true,
                    data: {}
                },
                column: {
                    getColId: () => ColumnConstants.ACTION_COL,
                    getUserProvidedColDef: () => { }
                },
                api: {
                    getSelectedNodes: () => [],
                }
            };
            requestConfig = {columns: [], portfolio: 'PEP'};
            requestConfig.columns.push({columnTag: 'hvar_inc'} as VizualizationColumnConfig);
            requestConfig.columns.push({columnTag: 'mcvar_inc'} as VizualizationColumnConfig);
            const spriteletLaunched = {};
            const menuItems = securityBasedRightClickHandler.getWidgetSpecificContextMenuItems(params, requestConfig, spriteletLaunched);
            // Launch AnSer + separator
            expect(menuItems.length).toEqual(2);
            expect(menuItems[0].name).toEqual(RightClickHandlerUtils.LAUNCH);
            expect(menuItems[1]).toEqual(CommonConstants.SEPARATOR);
        });

        it('test getWidgetSpecificContextMenuItems with security node - HVAR, MCVAR - Options displayed', () => {
            params = {
                node: {
                    parent: {},
                    level: 1,
                    group: false,
                    data: {}
                },
                column: {
                    getColId: () => ColumnConstants.ACTION_COL,
                    getUserProvidedColDef: () => { }
                },
                api: {
                    getSelectedNodes: () => [],
                }
            };
            requestConfig = {columns: [], portfolio: 'PEP'};
            requestConfig.columns.push({columnTag: 'hvar_inc'} as VizualizationColumnConfig);
            requestConfig.columns.push({columnTag: 'mcvar_inc'} as VizualizationColumnConfig);

            jest.spyOn(CoreColumnUtils, 'getColumnDefByTag').mockImplementation((colTag) => (colTag === 'hvar_inc') ?
                {groups: ['Portfolio Risk', 'Historical VaR'], isHVaRColumn: () => true, isMCVaRColumn: () => false} as ColumnDefinition :
                {groups: ['Portfolio Risk', 'Monte Carlo VaR'], isHVaRColumn: () => false, isMCVaRColumn: () => true} as ColumnDefinition
            );

            const spriteletLaunched = {};
            const menuItems = securityBasedRightClickHandler.getWidgetSpecificContextMenuItems(params, requestConfig, spriteletLaunched);
            // Open Table, Launch AnSer, separator
            expect(menuItems.length).toEqual(3);
            expect(menuItems[0].name).toBe(RightClickHandlerUtils.TABLE);
            expect(menuItems[0].subMenu.length).toBe(2);
            expect(menuItems[0].subMenu[0].name).toBe(WidgetConstants.HVAR_PNLS_TS.ACTION_NAME);
            expect(menuItems[0].subMenu[1].name).toBe(WidgetConstants.MCVAR_SIMULATION_PNLS.ACTION_NAME);
            expect(menuItems[1].name).toEqual(RightClickHandlerUtils.LAUNCH);
            expect(menuItems[2]).toBe(CommonConstants.SEPARATOR);
        });
    });
});
