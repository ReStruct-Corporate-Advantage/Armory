import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';
import {WidgetUtils} from '@utils/widget.utils';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {EventEmitter} from '@angular/core';
import {PerformanceConstants, WidgetConfigType} from '@blk/explore-ui-core';
import {ReturnSpriteletRightClickHandler} from './return-spritelet-right-click.handler';

describe('Return Spritelet Widget Right Click Handler Test', () => {

    let returnSpriteletRightClickHandler;
    let widget;
    let params: any;
    beforeAll((done) => {
        TestUtils.initialize(done);
        returnSpriteletRightClickHandler = new ReturnSpriteletRightClickHandler();
        widget = new Widget(WidgetConfigType.RETURNS_TIME_SERIES);
        params = {
            node: {
                'group': true,
                'data': {
                },
                hasChildren: jest.fn()
            },
            api: {
                getSelectedNodes: () => []
            }
        };
    });

    it('test getContextMenuItemsForAgGrid', () => {
        const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        const requestConfig = {columns: cols, portfolio: 'PEP'};
        let items = returnSpriteletRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
        expect(items.length).toBe(6);

        params.node.parent = {'group': true, 'data': {}};

        items = returnSpriteletRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, null);
        expect(items.length).toBe(8);

        expect(items[0].name).toBe('Expand');
        expect(items[1].name).toBe('Expand All Levels');
        expect(items[2].name).toBe('Collapse All Levels');
        expect(items[3]).toBe('separator');
        expect(items[4].name).toBe('Open Table');
        expect(items[4].subMenu.length).toBe(2);
        expect(items[4].subMenu[0].name).toBe('Details');
        expect(items[4].subMenu[1].name).toBe('Open Performance Details');
        expect(items[5]).toBe('separator');
        expect(items[6].name).toBe('Copy');
        expect(items[7].name).toBe('Copy with Column Headers');
    });

    it('test Open Details', () => {
        params.node.parent = {'group': true, 'data': {}};
        const eventEmitter = new EventEmitter<SpriteletEvent>();
        const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        const requestConfig = {columns: cols, portfolio: 'PEP'};
        const items = returnSpriteletRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, eventEmitter);
        jest.spyOn(eventEmitter, 'emit');
        items[4].subMenu[0].action();
        expect(eventEmitter.emit).toHaveBeenCalledWith( expect.objectContaining({
            actionName: PerformanceConstants.SPRITELET_EVENTS.RETURN_DRILLDOWN_TIME_SERIES,
            params: params
        }));
    });

    it('test Open Performance details', () => {
        params.node.parent = {'group': true, 'data': {}};
        const eventEmitter = new EventEmitter<SpriteletEvent>();
        const cols  = WidgetUtils.convertWidgetInputsToVizualisationColumnConfig(widget.dataStore.metaData.inputs, widget.displayInputs, widget.configType);
        const requestConfig = {columns: cols, portfolio: 'PEP'};
        const items = returnSpriteletRightClickHandler.getContextMenuItemsForAgGrid(params, requestConfig, eventEmitter);
        jest.spyOn(eventEmitter, 'emit');
        items[4].subMenu[1].action();
        expect(eventEmitter.emit).toHaveBeenCalledWith( expect.objectContaining({
            actionName: PerformanceConstants.SPRITELET_EVENTS.RETURN_DRILLDOWN_PERF_DETAILS,
            params: params
        }));
    });

});
