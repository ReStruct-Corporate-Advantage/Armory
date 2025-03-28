import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';
import {FactorWidgetRightClickHandler} from './factor-widget-right-click.handler';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {MenuItemDef} from 'ag-grid-community';
import {ColumnDefinition, CoreColumnUtils, WidgetConfigType, TokenUtils} from '@blk/explore-ui-core';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';

describe('Factor Based Analysis widget - right click handler tests', () => {
    let fbaRightClickHandler: FactorWidgetRightClickHandler;
    let widget: Widget;
    let params: any;
    let requestConfig: RequestAdapterConfig;

    beforeAll((done) => {
        TestUtils.initialize(done);
        fbaRightClickHandler = new FactorWidgetRightClickHandler();
        widget = new Widget(WidgetConfigType.PRA);

        requestConfig = {
            columns: [
                {
                    columnKey: 'rfv_ftitle',
                    columnTag: 'rfv_ftitle',
                    columnTitle: ' Title',
                    dataType: 'STRING',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: false,
                    originalColumnTitle: ''
                }, {
                    columnKey: 'rfv_exp_port_35',
                    columnTag: 'rfv_exp_port',
                    columnTitle: 'Factor Exposure',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: false,
                    originalColumnTitle: ''
                }
            ],
            portfolio: 'PEP'
        }
        ;
    });

    it('should return the expected config', () => {
        const widgetConfigTypes = FactorWidgetRightClickHandler.getWidgetConfigTypes();
        expect(widgetConfigTypes.length).toBe(1);
        expect(widgetConfigTypes[0]).toBe(WidgetConfigType.PRA);
    });

    describe('Grid column level (Main Menu) items tests', () => {
        it('should show launching pie and bar charts as options for double column types', () => {
            params = {
                column: {
                    getColId: () => 'rfv_exp_port_35'
                },
                defaultItems: ['pinSubMenu', 'separator', 'autoSizeThis', 'autoSizeAll', 'separator', 'separator', 'resetColumns']
            };
            const mainMenuItems = fbaRightClickHandler.getMainMenuItemsForAgGrid(params, requestConfig, null);
            expect(mainMenuItems.length).toBe(9);
            const showChartMenu = mainMenuItems[mainMenuItems.length - 1] as MenuItemDef;
            expect(showChartMenu.name).toBe('Open Chart');
            expect(showChartMenu.subMenu.length).toBe(4);
        });

        it('should show launching pie and bar charts as options for split column types', () => {
            params = {
                column: {
                    getColId: () => 'rfv_exp_port_35|13/06/2020'
                },
                defaultItems: ['pinSubMenu', 'separator', 'autoSizeThis', 'autoSizeAll', 'separator', 'separator', 'resetColumns']
            };
            const mainMenuItems = fbaRightClickHandler.getMainMenuItemsForAgGrid(params, requestConfig, null);
            expect(mainMenuItems.length).toBe(9);
            const showChartMenu = mainMenuItems[mainMenuItems.length - 1] as MenuItemDef;
            expect(showChartMenu.name).toBe('Open Chart');
            expect(showChartMenu.subMenu.length).toBe(4);
        });

        it('should not show pie and bar charts for string column types', () => {
            params = {
                column: {
                    getColId: () => 'rfv_ftitle'
                },
                defaultItems: ['pinSubMenu', 'separator', 'autoSizeThis', 'autoSizeAll', 'separator', 'separator', 'resetColumns']
            };
            const mainMenuItems = fbaRightClickHandler.getMainMenuItemsForAgGrid(params, requestConfig, null);
            expect(mainMenuItems.length).toBe(6);
            expect((mainMenuItems[mainMenuItems.length - 1] as MenuItemDef).name).not.toBe('Show Chart');
        });
    });

    describe('Grid context menu items tests', () => {
        it('should show launching security contributors, pie, and bar charts as options for nodes with children', () => {
            params = {
                node: {
                    group: true,
                    hasChildren: jest.fn()
                }
            };
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(false);
            const contextMenuItems = fbaRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null, new ExpandedState(), widget);
            expect(contextMenuItems.length).toBe(10);
            expect((contextMenuItems[0] as MenuItemDef).name).toBe('Expand');
            expect((contextMenuItems[1] as MenuItemDef).name).toBe('Expand All Levels');
            expect((contextMenuItems[2] as MenuItemDef).name).toBe('Collapse All Levels');
            expect(contextMenuItems[3]).toBe('separator');
            expect((contextMenuItems[4] as MenuItemDef).name).toBe('Plot factor data');
            expect((contextMenuItems[5] as MenuItemDef).name).toBe('Open Table');
            expect((contextMenuItems[5].subMenu as MenuItemDef[]).length).toBe(1);
            expect(contextMenuItems[5].subMenu[0].name).toBe('Security contributors');
            expect((contextMenuItems[6] as MenuItemDef).name).toBe('Open Chart');
            expect((contextMenuItems[6].subMenu as MenuItemDef[]).length).toBe(4);
            expect(contextMenuItems[6].subMenu[0].name).toBe('Bar chart');
            expect(contextMenuItems[6].subMenu[1].name).toBe('Stacked bar chart');
            expect(contextMenuItems[6].subMenu[2].name).toBe('Pie chart');
            expect(contextMenuItems[6].subMenu[3].name).toBe('Time series chart');
            expect(contextMenuItems[7]).toBe('separator');
            expect((contextMenuItems[8] as MenuItemDef).name).toBe('Copy');
            expect((contextMenuItems[9] as MenuItemDef).name).toBe('Copy with Column Headers');
        });

        it('only shows security contributors and factor times series for lowest level leaf nodes', () => {
            params = {
                node: {
                    group: false,
                    hasChildren: jest.fn()
                }
            };
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(false);
            const contextMenuItems = fbaRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null, new ExpandedState(), widget);
            expect(contextMenuItems.length).toBe(10);
            expect((contextMenuItems[4] as MenuItemDef).name).toBe('Plot factor data');
            expect((contextMenuItems[5] as MenuItemDef).name).toBe('Open Table');
            expect((contextMenuItems[5].subMenu as MenuItemDef[]).length).toBe(1);
            expect(contextMenuItems[5].subMenu[0].name).toBe('Security contributors');
            expect((contextMenuItems[6] as MenuItemDef).name).toBe('Open Chart');
            expect((contextMenuItems[6].subMenu as MenuItemDef[]).length).toBe(1);
            expect(contextMenuItems[6].subMenu[0].name).toBe('Time series chart');
            expect(contextMenuItems[7]).toBe('separator');
        });

        it('disable security contributors/factor time series when macro factor breakdown is selected and not show pie and bar charts for nodes with no children', () => {
            const praWidget = new Widget(WidgetConfigType.PRA);
            const data = {
                'configType': 'praWidget',
                'type': 'bar',
                'inputs': {
                    'riskFactorBreakdown': {
                        'breakdown': {
                            'breakdownTitle': 'Macro Model - Global',
                            'subSectors': [{
                                'breakdownRuleType': 'String',
                                'useNoneBuckets': true,
                                'groupByColumn': {
                                    'columnName': 'Macro Model - Global',
                                    'columnTag': 'MACRO',
                                    'dataType': 'STRING'
                                }
                            }]
                        },
                        'title': 'Macro Model - Global'
                    }
                }
            };

            widget['deserializeInputs'](data);

            params = {
                node: {
                    group: false,
                    hasChildren: jest.fn()
                }
            };

            const columnDefinition = new ColumnDefinition();
            columnDefinition.isMacroFactor = true;
            jest.spyOn(CoreColumnUtils, 'getColumnDefByTagAndUse').mockReturnValue(columnDefinition);
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(false);

            const contextMenuItems = fbaRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null, false, praWidget);
            expect(contextMenuItems.length).toBe(10);
            expect((contextMenuItems[4] as MenuItemDef).name).toBe('Plot factor data');
            expect((contextMenuItems[5] as MenuItemDef).name).toBe('Open Table');
            expect((contextMenuItems[5].subMenu as MenuItemDef[]).length).toBe(1);
            expect(contextMenuItems[5].subMenu[0].name).toBe('Security contributors');
            expect(contextMenuItems[5].subMenu[0].disabled).toBeTruthy();
            expect((contextMenuItems[6] as MenuItemDef).name).toBe('Open Chart');
            expect((contextMenuItems[6].subMenu as MenuItemDef[]).length).toBe(1);
            expect(contextMenuItems[6].subMenu[0].name).toBe('Time series chart');
            expect(contextMenuItems[6].subMenu[0].disabled).toBeTruthy();
            expect(contextMenuItems[7]).toBe('separator');
        });

        it('should show plot factor data options with subMenus', () => {
            params = {
                node: {
                    group: true,
                    hasChildren: jest.fn()
                }
            };
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            const contextMenuItems = fbaRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null, new ExpandedState(), widget);

            expect(contextMenuItems.length).toBe(10);
            expect((contextMenuItems[0] as MenuItemDef).name).toBe('Expand');
            expect((contextMenuItems[1] as MenuItemDef).name).toBe('Expand All Levels');
            expect((contextMenuItems[2] as MenuItemDef).name).toBe('Collapse All Levels');
            expect(contextMenuItems[3]).toBe('separator');
            expect((contextMenuItems[4] as MenuItemDef).name).toBe('Plot factor data');
            expect((contextMenuItems[4].subMenu as MenuItemDef[]).length).toBe(4);
            expect(contextMenuItems[4].subMenu[0].name).toBe('Open risk matrix');
            expect(contextMenuItems[4].subMenu[1].name).toBe('Open factor level time series');
            expect(contextMenuItems[4].subMenu[2].name).toBe('Open factor return time series');
            expect(contextMenuItems[4].subMenu[3].name).toBe('Open factor volatility time series');
            expect((contextMenuItems[5] as MenuItemDef).name).toBe('Open Table');
            expect((contextMenuItems[5].subMenu as MenuItemDef[]).length).toBe(1);
            expect(contextMenuItems[5].subMenu[0].name).toBe('Security contributors');
            expect((contextMenuItems[6] as MenuItemDef).name).toBe('Open Chart');
            expect((contextMenuItems[6].subMenu as MenuItemDef[]).length).toBe(4);
            expect(contextMenuItems[6].subMenu[0].name).toBe('Bar chart');
            expect(contextMenuItems[6].subMenu[1].name).toBe('Stacked bar chart');
            expect(contextMenuItems[6].subMenu[2].name).toBe('Pie chart');
            expect(contextMenuItems[6].subMenu[3].name).toBe('Time series chart');
            expect(contextMenuItems[7]).toBe('separator');
            expect((contextMenuItems[8] as MenuItemDef).name).toBe('Copy');
            expect((contextMenuItems[9] as MenuItemDef).name).toBe('Copy with Column Headers');
        });
    });
});
