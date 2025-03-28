import {TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '../../../stores';
import {Report} from '@models/workspace/report.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {ColumnConfig, PerformanceConstants, PerformanceSettings, WidgetConfigType} from '@blk/explore-ui-core';
import {Widget} from '@models/widget/widget.model';
import {ReportColumnService} from '@services/report-column/report-column.service';
import {Observable, of} from 'rxjs';
import {ReturnDrillDownPerformanceDetailsSpriteletLauncherService} from '@services/spritelet-launcher/return-drill-down-performance-details-spritelet-launcher.service';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Test cases for ReturnPerformanceDetailSpriteletLauncherService
 */
describe('ReturnDrillDownPerformanceDetailsSpriteletLauncherService', () => {
    let service: ReturnDrillDownPerformanceDetailsSpriteletLauncherService;
    const reportColumnServiceStub = {
        getColumnListFromReport: jest.fn((): Observable<Array<ColumnConfig>> => {
            return of( [ColumnConfig.createColumn('pnl_sec_desc', 'ALL', 'pnl_sec_desc'),
                ColumnConfig.createColumn('pnl_cusip', 'ALL', 'pnl_cusip_0'),
                ColumnConfig.createColumn('wt_contr', 'PORT', 'wt_contr'),
                ColumnConfig.createColumn('bench_wt_contr', 'BENCH', 'bench_wt_contr')]);
        })
    };
    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [{provide: ReportColumnService, useValue: reportColumnServiceStub}]
        });
        service = TestBed.inject(ReturnDrillDownPerformanceDetailsSpriteletLauncherService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(PerformanceConstants.SPRITELET_EVENTS.RETURN_DRILLDOWN_PERF_DETAILS);
    });

    it('test launchSpritelet', (done)  => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());
        TestUtils.initialize(done);
        jest.spyOn(reportColumnServiceStub, 'getColumnListFromReport');
        const report = WorkspaceStore.getCurrentReport();
        report.widgets = [];
        const returnWidget = new Widget(WidgetConfigType.RETURNS);
        returnWidget.dataStore.metaData.inputs.delete('breakdownTree');

        const timeSeriesWidget = new Widget(WidgetConfigType.RETURNS_TIME_SERIES);
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
        const spriteletEvent = new SpriteletEvent(PerformanceConstants.SPRITELET_EVENTS.RETURN_DRILLDOWN_PERF_DETAILS, params);
        service.launchSpritelet(timeSeriesWidget, spriteletEvent, null);
        expect(reportColumnServiceStub.getColumnListFromReport).toHaveBeenCalled();
        const spriteletWidget = report.widgets[0];
        expect(spriteletWidget.configType).toBe(WidgetConfigType.RETURNS_DRILLDOWN_PERF_DETAIL);
        expect(spriteletWidget.title).toBe('Performance Details for 01-May-2020');
        expect(spriteletWidget.dimensions.cols).toBe(8);
        expect(spriteletWidget.dimensions.rows).toBe(6);
        expect(spriteletWidget.dimensions.x).toBe(8);
        expect(spriteletWidget.dimensions.y).toBe(null);
        expect(spriteletWidget.showSettings).toBe(false);
        expect(spriteletWidget.dataStore.parentDataStore).toBe(returnWidget.dataStore);
        expect(spriteletWidget.dataStore.isDependentOnParentForMetaData).toBeTruthy();
        const cols = spriteletWidget.dataStore.metaData.inputs.get('columns') as ColumnSet;
        expect(cols.columns.length).toBe(4);
        const performanceSettings = spriteletWidget.dataStore.metaData.inputs.get('performanceSettings') as PerformanceSettings;
        expect(performanceSettings.parentPerformanceSettings).toBe(returnWidget.dataStore.metaData.inputs.get('performanceSettings'));
        expect(performanceSettings.timePeriod.shortName).toBe('CUSTOM');
        expect(performanceSettings.timePeriod.fromDateValue).toBe('30-Apr-2020');
        expect(performanceSettings.timePeriod.toDateValue).toBe('01-May-2020');
    });
});
