import {TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '../../../stores';
import {Report} from '@models/workspace/report.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {ColumnConfig, PerformanceConstants, WidgetConfigType} from '@blk/explore-ui-core';
import {Widget} from '@models/widget/widget.model';
import {ReportColumnService} from '@services/report-column/report-column.service';
import {Observable, of} from 'rxjs';
import {ReturnManagerSelectionSpriteletLauncherService} from '@services/spritelet-launcher/return-manager-selection-spritelet-launcher.service';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Test cases for ReturnManagerSelectionSpriteletLauncherService
 */
describe('ReturnManagerSelectionSpriteletLauncherService', () => {
    let service: ReturnManagerSelectionSpriteletLauncherService;
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
        service = TestBed.inject(ReturnManagerSelectionSpriteletLauncherService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(PerformanceConstants.SPRITELET_EVENTS.RETURN_MANAGER_SELECTION);
    });

    it('test launchSpritelet', (done)  => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());
        TestUtils.initialize(done);
        jest.spyOn(reportColumnServiceStub, 'getColumnListFromReport');
        const report = WorkspaceStore.getCurrentReport();
        report.widgets = [];
        const widget = new Widget(WidgetConfigType.RETURNS);
        const params: any = {
            value: 'Manager Selection'
        };
        const spriteletEvent = new SpriteletEvent(PerformanceConstants.SPRITELET_EVENTS.RETURN_MANAGER_SELECTION, params);
        service.launchSpritelet(widget, spriteletEvent, null);
        expect(reportColumnServiceStub.getColumnListFromReport).toHaveBeenCalled();
        const spriteletWidget = report.widgets[0];
        expect(spriteletWidget.configType).toBe(WidgetConfigType.RETURNS_MANAGER_SELECTION);
        expect(spriteletWidget.title).toBe('Performance Details for Manager Selection');
        expect(spriteletWidget.dimensions.cols).toBe(8);
        expect(spriteletWidget.dimensions.rows).toBe(6);
        expect(spriteletWidget.dimensions.x).toBe(8);
        expect(spriteletWidget.dimensions.y).toBe(null);
        expect(spriteletWidget.showSettings).toBe(false);
        expect(spriteletWidget.dataStore.parentDataStore).toBe(widget.dataStore);
        expect(spriteletWidget.dataStore.isDependentOnParentForMetaData).toBeTruthy();
        const cols = spriteletWidget.dataStore.metaData.inputs.get('columns') as ColumnSet;
        expect(cols.columns.length).toBe(5);
        expect(cols.columns[0].columnTag).toBe('date');
    });
});
