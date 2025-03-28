import {TestBed} from '@angular/core/testing';
import {ReturnTimeSeriesSpriteletLauncherService} from '@services/spritelet-launcher/return-time-series-spritelet-launcher.service';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '../../../stores';
import {Report} from '@models/workspace/report.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {ColumnConfig, PerformanceConstants, WidgetConfigType} from '@blk/explore-ui-core';
import {ReturnSpriteletInput} from '@models/widget/inputs/return-spritelet-input.model';
import {Widget} from '@models/widget/widget.model';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Test cases for ReturnTimeSeriesSpriteletLauncherService
 */
describe('ReturnTimeSeriesSpriteletLauncherService', () => {
    let service: ReturnTimeSeriesSpriteletLauncherService;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });
    beforeAll(async () => {
        WorkspaceStore.init();
        await WorkspaceStore.updateCurrentReport(new Report());
    });

    beforeAll(() => {
        service = TestBed.inject(ReturnTimeSeriesSpriteletLauncherService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(PerformanceConstants.SPRITELET_EVENTS.RETURN_TIME_SERIES);
    });

    it('test launchSpritelet - no breakdown', async ()  => {
        const report = WorkspaceStore.getCurrentReport();
        report.widgets = [];
        const widget = new Widget(WidgetConfigType.RETURNS);
        widget.dimensions.x = 0;
        widget.dimensions.y = 0;
        widget.dataStore.metaData.inputs.delete('breakdownTree');
        const params: any = {
            node: {
                'parent': {
                    'group': true,
                    'key': 'Strategy 1',
                    'parent': {
                        'group': true,
                        'key': 'PEP',
                    }
                },
                'group': false,
                'data': {
                    'pnl_cusip_0': 'Cusip1',
                    'pnl_sec_desc': 'Security Description 1',
                    'pnl_id': 'Cusip1_ID'
                }
            },
            value: 'Security Description 1'
        };
        const spriteletEvent = new SpriteletEvent(PerformanceConstants.SPRITELET_EVENTS.RETURN_TIME_SERIES, params);
        await service.launchSpritelet(widget, spriteletEvent);
        const spriteletWidget = report.widgets[0];
        expect(spriteletWidget.configType).toBe(WidgetConfigType.RETURNS_TIME_SERIES);
        expect(spriteletWidget.title).toBe('Time Series for Security Description 1');
        expect(spriteletWidget.dimensions.cols).toBe(8);
        expect(spriteletWidget.dimensions.rows).toBe(6);
        expect(spriteletWidget.dimensions.x).toBe(8);
        expect(spriteletWidget.dimensions.y).toBe(0);
        expect(spriteletWidget.showSettings).toBe(false);
        expect(spriteletWidget.dataStore.parentDataStore).toBe(widget.dataStore);
        expect(spriteletWidget.dataStore.isDependentOnParentForMetaData).toBeTruthy();
        const cols = spriteletWidget.dataStore.metaData.inputs.get('columns') as ColumnSet;
        expect(cols.columns.length).toBe(11);
        expect(cols.columns[0].columnTag).toBe('date');
        const spriteletInput = spriteletWidget.dataStore.metaData.inputs.get('returnSpriteletInput') as ReturnSpriteletInput;
        expect(spriteletInput.pnlID).toBe('Cusip1_ID');
        expect(spriteletInput.nodeDesc).toBe('Security Description 1');
        expect(JSON.stringify(spriteletInput.sectorPathRules)).toEqual('[{"savable":true,"lineItem":null,"newWeight":null,"ruleType":"Sector","sectorRulesInfo":[{"subSector":{"columnName":"Cusip","columnTag":"cusip","positionColumnType":"ALL",' +
            '"useNoneBuckets":true},"sectorValue":"Cusip1","sectorType":"NormalSector"},{"subSector":{"columnName":"Strategy Name","columnTag":"strategy_name","positionColumnType":"ALL","useNoneBuckets":true},"sectorValue":"Strategy 1","sectorType":"NormalSector"}]}]');
    });

    it('test launchSpritelet - with breakdown', async ()  => {
        const report = WorkspaceStore.getCurrentReport();
        report.widgets = [];
        const widget = new Widget(WidgetConfigType.RETURNS);
        widget.dimensions.cols = 21;
        widget.dimensions.x = 2;
        widget.dimensions.y = 0;
        const widgetCols = widget.dataStore.metaData.inputs.get('columns') as ColumnSet;
        // Won't be added since its a security column
        widgetCols.columns.push(ColumnConfig.createColumn('gics_1_sector', 'ALL'));
        widget.dataStore.metaData.inputs.set('breakdownTree', Breakdown.getDefaultBreakdown());
        const params: any = {
            node: {
                'parent': {
                    'group': true,
                    'key': 'BND',
                    'parent': {
                        'group': true,
                        'key': 'PEP',
                    }
                },
                'group': false,
                'data': {
                    'pnl_cusip_0': 'Cusip1',
                    'pnl_sec_desc': 'Security Description 1',
                    'pnl_id': 'Cusip1_ID'
                }
            },
            value: 'Security Description 1'
        };
        const spriteletEvent = new SpriteletEvent(PerformanceConstants.SPRITELET_EVENTS.RETURN_TIME_SERIES, params);
        await service.launchSpritelet(widget, spriteletEvent);
        const spriteletWidget = report.widgets[0];
        expect(spriteletWidget.configType).toBe(WidgetConfigType.RETURNS_TIME_SERIES);
        expect(spriteletWidget.title).toBe('Time Series for Security Description 1');
        expect(spriteletWidget.dimensions.cols).toBe(8);
        expect(spriteletWidget.dimensions.rows).toBe(6);
        expect(spriteletWidget.dimensions.x).toBe(2);
        expect(spriteletWidget.dimensions.y).toBe(6);
        expect(spriteletWidget.showSettings).toBe(false);
        expect(spriteletWidget.dataStore.parentDataStore).toBe(widget.dataStore);
        expect(spriteletWidget.dataStore.isDependentOnParentForMetaData).toBeTruthy();
        const cols = spriteletWidget.dataStore.metaData.inputs.get('columns') as ColumnSet;
        expect(cols.columns.length).toBe(11);
        expect(cols.columns[0].columnTag).toBe('date');
        const spriteletInput = spriteletWidget.dataStore.metaData.inputs.get('returnSpriteletInput') as ReturnSpriteletInput;
        expect(spriteletInput.pnlID).toBe('Cusip1_ID');
        expect(spriteletInput.nodeDesc).toBe('Security Description 1');
        expect(JSON.stringify(spriteletInput.sectorPathRules)).toEqual('[{"savable":true,"lineItem":null,"newWeight":null,"ruleType":"Sector","sectorRulesInfo":[{"subSector":{"columnName":"Cusip","columnTag":"cusip","positionColumnType":"ALL",' +
            '"useNoneBuckets":true},"sectorValue":"Cusip1","sectorType":"NormalSector"},{"subSector":{"columnTag":"sec_group","columnName":"Security Group","positionColumnType":"ALL","children":[]},"sectorValue":"BND","sectorType":"NormalSector"}]}]');
    });

});
