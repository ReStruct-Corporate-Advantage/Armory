import {TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '../../../stores';
import {Report} from '@models/workspace/report.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {PerformanceConstants, PerformanceSettings, WidgetConfigType} from '@blk/explore-ui-core';
import {Widget} from '@models/widget/widget.model';
import {ReturnDrillDownTimeSeriesSpriteletLauncherService} from '@services/spritelet-launcher/return-drill-down-time-series-spritelet-launcher.service';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Test cases for ReturnDrillDownTimeSeriesSpriteletLauncherService
 */
describe('ReturnDrillDownTimeSeriesSpriteletLauncherService', () => {
    let service: ReturnDrillDownTimeSeriesSpriteletLauncherService;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });
    beforeAll(async () => {
        WorkspaceStore.init();
        await WorkspaceStore.updateCurrentReport(new Report());
    });

    beforeAll(() => {
        service = TestBed.inject(ReturnDrillDownTimeSeriesSpriteletLauncherService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(PerformanceConstants.SPRITELET_EVENTS.RETURN_DRILLDOWN_TIME_SERIES);
    });

    it('test launchSpritelet - no breakdown', async ()  => {
        const report = WorkspaceStore.getCurrentReport();
        report.widgets = [];
        const returnWidget = new Widget(WidgetConfigType.RETURNS);
        returnWidget.dataStore.metaData.inputs.delete('breakdownTree');

        const timeSeriesWidget = new Widget(WidgetConfigType.RETURNS_TIME_SERIES);
        timeSeriesWidget.dimensions.x = 0;
        timeSeriesWidget.dimensions.y = 0;
        timeSeriesWidget.dataStore.parentDataStore = returnWidget.dataStore;
        const params: any = {
            node: {
                'group': false,
                'data': {
                    'date': '01-May-2020',
                    'pnl_cusip_0': 'Cusip1',
                    'pnl_sec_desc': 'Security Description 1'
                }
            },
            value: '01-May-2020'
        };
        const spriteletEvent = new SpriteletEvent(PerformanceConstants.SPRITELET_EVENTS.RETURN_DRILLDOWN_TIME_SERIES, params);
        await service.launchSpritelet(timeSeriesWidget, spriteletEvent);
        const spriteletWidget = report.widgets[0];
        expect(spriteletWidget.configType).toBe(WidgetConfigType.RETURNS_DRILLDOWN_TIME_SERIES);
        expect(spriteletWidget.title).toBe('Details for 01-May-2020');
        expect(spriteletWidget.dimensions.cols).toBe(8);
        expect(spriteletWidget.dimensions.rows).toBe(6);
        expect(spriteletWidget.dimensions.x).toBe(8);
        expect(spriteletWidget.dimensions.y).toBe(0);
        expect(spriteletWidget.showSettings).toBe(false);
        expect(spriteletWidget.dataStore.parentDataStore).toBe(returnWidget.dataStore);
        expect(spriteletWidget.dataStore.isDependentOnParentForMetaData).toBeTruthy();
        const cols = spriteletWidget.dataStore.metaData.inputs.get('columns') as ColumnSet;
        expect(cols.columns.length).toBe(10);
        const performanceSettings = spriteletWidget.dataStore.metaData.inputs.get('performanceSettings') as PerformanceSettings;
        expect(performanceSettings.parentPerformanceSettings).toBe(returnWidget.dataStore.metaData.inputs.get('performanceSettings'));
        expect(performanceSettings.timePeriod.shortName).toBe('CUSTOM');
        expect(performanceSettings.timePeriod.fromDateValue).toBe('30-Apr-2020');
        expect(performanceSettings.timePeriod.toDateValue).toBe('01-May-2020');
    });
});
