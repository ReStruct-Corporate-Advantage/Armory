import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';
import {WidgetUtils} from '@utils/widget.utils';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {EventEmitter} from '@angular/core';
import {PgsRightClickHandler} from './pgs-right-click.handler';
import {WidgetConstants} from '@constants/widget.constants';
import {ColumnConstants, ColumnDefinition, CoreColumnUtils, WidgetConfigType} from '@blk/explore-ui-core';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {VizualizationColumnConfig} from '@interfaces/request.interface';

describe('PGS Widget Right Click Handler Test', () => {

    let pgsRightClickHandler;
    let widget;
    let params: any;
    beforeAll((done) => {
        TestUtils.initialize(done);
        pgsRightClickHandler = new PgsRightClickHandler();
        widget = new Widget(WidgetConfigType.PGS);
        params = {
            node: {
                'group': true,
                'data': {
                },
                hasChildren: jest.fn()
            },
            api: {
                getSelectedNodes: () => []
            },
            column: {
                getColDef: () => {
                    return {'colTag': ''};
                },
                getColId: () => ColumnConstants.ACTION_COL,
                getUserProvidedColDef: () => { }
            }
        };
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    describe('test getContextMenuItemsForAgGrid', () => {
        describe('onContextMenuColClicked', () => {
            it('test without HVaR and MCVaR columns', () => {
                params.node.level = 0;
                const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
                const requestConfig = {columns: cols, portfolio: 'PEP'};
                let items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
                expect(items.length).toBe(6);

                params.node.parent = {'group': true, 'data': {}};

                items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
                expect(items.length).toBe(9);

                expect(items[0].name).toBe('Expand');
                expect(items[1].name).toBe('Expand All Levels');
                expect(items[2].name).toBe('Collapse All Levels');
                expect(items[3]).toBe('separator');
                expect(items[4].name).toBe('Open Table');
                expect(items[4].subMenu.length).toBe(1);
                expect(items[4].subMenu[0].name).toBe('Risk and exposure');
                expect(items[5].name).toBe('Open Chart');
                expect(items[5].subMenu.length).toEqual(4);
                expect(items[6]).toBe('separator');
                expect(items[7].name).toBe('Copy');
                expect(items[8].name).toBe('Copy with Column Headers');

                requestConfig.columns.push({columnTag: 'active_shares'});
                items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
                expect(items.length).toBe(9);
                expect(items[4].subMenu.length).toBe(2);
                expect(items[4].subMenu[1].name).toBe('Active shares issuer decomposition');
            });

            it('test with HVaR and MCVaR columns', () => {
                params.node.level = 0;
                const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
                const requestConfig = {columns: cols, portfolio: 'PEP'};
                requestConfig.columns.push({columnTag: 'hvar_inc'});
                requestConfig.columns.push({columnTag: 'mcvar_inc'});
                jest.spyOn(CoreColumnUtils, 'getColumnDefByTag').mockImplementation((colTag) => colTag === 'hvar_inc' ?
                    {groups: ['Portfolio Risk', 'Historical VaR'], isHVaRColumn: () => true, isMCVaRColumn: () => false} :
                    {groups: ['Portfolio Risk', 'Monte Carlo VaR'], isHVaRColumn: () => false, isMCVaRColumn: () => true});
                let items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
                expect(items.length).toBe(9);

                params.node.parent = {'group': true, 'data': {}};

                items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
                expect(items.length).toBe(9);

                expect(items[0].name).toBe('Expand');
                expect(items[1].name).toBe('Expand All Levels');
                expect(items[2].name).toBe('Collapse All Levels');
                expect(items[3]).toBe('separator');
                expect(items[4].name).toBe('Open Table');
                expect(items[4].subMenu.length).toBe(3);
                expect(items[4].subMenu[0].name).toBe('Risk and exposure');
                expect(items[4].subMenu[1].name).toBe(WidgetConstants.HVAR_PNLS_TS.ACTION_NAME);
                expect(items[4].subMenu[2].name).toBe('MCVaR Simulation P&Ls');
                expect(items[5].name).toBe('Open Chart');
                expect(items[5].subMenu.length).toEqual(4);
                expect(items[6]).toBe('separator');
                expect(items[7].name).toBe('Copy');
                expect(items[8].name).toBe('Copy with Column Headers');

                requestConfig.columns.push(({columnTag: 'active_shares'} as VizualizationColumnConfig));
                items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
                expect(items.length).toBe(9);
                expect(items[4].subMenu.length).toBe(4);
                expect(items[4].subMenu[3].name).toBe('Active shares issuer decomposition');
            });
        });
        describe('onRightClickOfaColumn', () => {
            it ('rightClickOnColumn other than HVaR or MCVaR', () => {
                params.node.level = 0;
                const colDef = {colTag : 'portfolio'};
                params.column = {
                    getColId: () => 'portfolio',
                    getUserProvidedColDef: () => { },
                    getColDef: () => colDef
                };
                const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
                const requestConfig = {columns: cols, portfolio: 'PEP'};
                jest.spyOn(CoreColumnUtils, 'getColumnDefByTag').mockReturnValue(({groups: [], colTag: 'portfolio', isHVaRColumn: () => false, isMCVaRColumn: () => false} as ColumnDefinition));
                let items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
                expect(items.length).toBe(9);

                params.node.parent = {'group': true, 'data': {}};

                items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
                expect(items.length).toBe(9);

                expect(items[0].name).toBe('Expand');
                expect(items[1].name).toBe('Expand All Levels');
                expect(items[2].name).toBe('Collapse All Levels');
                expect(items[3]).toBe('separator');
                expect(items[4].name).toBe('Open Table');
                expect(items[4].subMenu.length).toBe(1);
                expect(items[4].subMenu[0].name).toBe('Risk and exposure');
                expect(items[5].name).toBe('Open Chart');
                expect(items[5].subMenu.length).toEqual(4);
                expect(items[6]).toBe('separator');
                expect(items[7].name).toBe('Copy');
                expect(items[8].name).toBe('Copy with Column Headers');
            });
            it ('rightClickOnColumn HVaR', () => {
                params.node.level = 0;
                const colDef = {colTag : 'hvar_inc', isMCVaRColumn: () => false, isHVaRColumn: () => true};
                params.column = {
                    getColId: () => 'hvar_inc',
                    getUserProvidedColDef: () => { },
                    getColDef: () => colDef
                };
                const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
                const requestConfig = {columns: cols, portfolio: 'PEP'};
                jest.spyOn(CoreColumnUtils, 'getColumnDefByTag').mockReturnValue(({groups: ['Portfolio Risk', 'Historical VaR'], colTag: 'hvar_inc', isHVaRColumn: () => true, isMCVaRColumn: () => false} as ColumnDefinition));
                let items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
                expect(items.length).toBe(9);

                params.node.parent = {'group': true, 'data': {}};

                items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
                expect(items.length).toBe(9);

                expect(items[0].name).toBe('Expand');
                expect(items[1].name).toBe('Expand All Levels');
                expect(items[2].name).toBe('Collapse All Levels');
                expect(items[3]).toBe('separator');
                expect(items[4].name).toBe('Open Table');
                expect(items[4].subMenu.length).toBe(2);
                expect(items[4].subMenu[0].name).toBe('Risk and exposure');
                expect(items[4].subMenu[1].name).toBe(WidgetConstants.HVAR_PNLS_TS.ACTION_NAME);
                expect(items[5].name).toBe('Open Chart');
                expect(items[5].subMenu.length).toEqual(4);
                expect(items[6]).toBe('separator');
                expect(items[7].name).toBe('Copy');
                expect(items[8].name).toBe('Copy with Column Headers');
            });
            it ('rightClickOnColumn MCVaR', () => {
                params.node.level = 0;
                const colDef = {colTag : 'mcvar_inc'};
                params.column = {
                    getColId: () => 'mcvar_inc',
                    getUserProvidedColDef: () => { },
                    getColDef: () => colDef
                };
                const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
                const requestConfig = {columns: cols, portfolio: 'PEP'};
                jest.spyOn(CoreColumnUtils, 'getColumnDefByTag').mockReturnValue(({groups: ['Portfolio Risk', 'Monte Carlo VaR'], colTag: 'mcvar_inc', isHVaRColumn: () => false, isMCVaRColumn: () => true} as ColumnDefinition));
                let items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
                expect(items.length).toBe(9);

                params.node.parent = {'group': true, 'data': {}};

                items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
                expect(items.length).toBe(9);

                expect(items[0].name).toBe('Expand');
                expect(items[1].name).toBe('Expand All Levels');
                expect(items[2].name).toBe('Collapse All Levels');
                expect(items[3]).toBe('separator');
                expect(items[4].name).toBe('Open Table');
                expect(items[4].subMenu.length).toBe(2);
                expect(items[4].subMenu[0].name).toBe('Risk and exposure');
                expect(items[4].subMenu[1].name).toBe('MCVaR Simulation P&Ls');
                expect(items[5].name).toBe('Open Chart');
                expect(items[5].subMenu.length).toEqual(4);
                expect(items[6]).toBe('separator');
                expect(items[7].name).toBe('Copy');
                expect(items[8].name).toBe('Copy with Column Headers');
            });
        });
    });

    it('test Risk and exposure', () => {
        params.node.parent = {'group': true, 'data': {}};
        const eventEmitter = new EventEmitter<SpriteletEvent>();
        const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        const requestConfig = {columns: cols, portfolio: 'PEP'};
        const items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, eventEmitter);
        jest.spyOn(eventEmitter, 'emit');
        items[4].subMenu[0].action();
        expect(eventEmitter.emit).toHaveBeenCalledWith( expect.objectContaining({
            actionName: WidgetConstants.RISK_EXPOSURE_SPRITELET.ACTION_KEY,
            params
        }));
    });

    it('test bar chart at selected level', () => {
        params.node.parent = {'group': true, 'data': {}};
        const eventEmitter = new EventEmitter<SpriteletEvent>();
        const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        const requestConfig = {columns: cols, portfolio: 'PEP'};
        const items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, eventEmitter);
        jest.spyOn(eventEmitter, 'emit');
        items[5].subMenu[0].action();
        expect(eventEmitter.emit).toHaveBeenCalledWith( expect.objectContaining({
            actionName: TabularWidgetConstants.PGS_BAR_CHART_SPRITELET.ACTION_KEY,
            params
        }));
    });

    it('test bar chart at selected level', () => {
        params.node.parent = {'group': true, 'data': {}};
        params.node.level = 0;
        const eventEmitter = new EventEmitter<SpriteletEvent>();
        const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        const requestConfig = {columns: cols, portfolio: 'PEP'};
        const items = pgsRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, eventEmitter);
        jest.spyOn(eventEmitter, 'emit');
        items[5].subMenu[2].action();
        expect(eventEmitter.emit).toHaveBeenCalledWith( expect.objectContaining({
            actionName: TabularWidgetConstants.PGS_LEAF_BAR_CHART_SPRITELET.ACTION_KEY,
            params
        }));
    });

});
