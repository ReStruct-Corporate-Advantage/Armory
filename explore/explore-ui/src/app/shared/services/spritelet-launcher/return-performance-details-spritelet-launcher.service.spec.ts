import {TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '../../../stores';
import {Report} from '@models/workspace/report.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {ColumnConfig, PerformanceConstants, WidgetConfigType} from '@blk/explore-ui-core';
import {ReturnSpriteletInput} from '@models/widget/inputs/return-spritelet-input.model';
import {Widget} from '@models/widget/widget.model';
import {ReturnPerformanceDetailSpriteletLauncherService} from '@services/spritelet-launcher/return-performance-detail-spritelet-launcher.service';
import {ReportColumnService} from '@services/report-column/report-column.service';
import {Observable, of} from 'rxjs';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * Test cases for ReturnPerformanceDetailSpriteletLauncherService
 */
describe('ReturnPerformanceDetailSpriteletLauncherService', () => {
    let service: ReturnPerformanceDetailSpriteletLauncherService;
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
        service = TestBed.inject(ReturnPerformanceDetailSpriteletLauncherService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe(PerformanceConstants.SPRITELET_EVENTS.RETURN_PERF_DETAILS);
    });

    it('test launchSpritelet', (done)  => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());
        TestUtils.initialize(done);
        jest.spyOn(reportColumnServiceStub, 'getColumnListFromReport');
        const report = WorkspaceStore.getCurrentReport();
        report.widgets = [];
        const widget = new Widget(WidgetConfigType.RETURNS);
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
        const spriteletEvent = new SpriteletEvent(PerformanceConstants.SPRITELET_EVENTS.RETURN_PERF_DETAILS, params);
        service.launchSpritelet(widget, spriteletEvent, null);
        expect(reportColumnServiceStub.getColumnListFromReport).toHaveBeenCalled();
        const spriteletWidget = report.widgets[0];
        expect(spriteletWidget.configType).toBe(WidgetConfigType.RETURNS_PERF_DETAIL);
        expect(spriteletWidget.title).toBe('Performance Details for Security Description 1');
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
        const spriteletInput = spriteletWidget.dataStore.metaData.inputs.get('returnSpriteletInput') as ReturnSpriteletInput;
        expect(spriteletInput.pnlID).toBe('Cusip1_ID');
        expect(spriteletInput.nodeDesc).toBe('Security Description 1');
        expect(JSON.stringify(spriteletInput.sectorPathRules)).toEqual('[{"savable":true,"lineItem":null,"newWeight":null,"ruleType":"Sector","sectorRulesInfo":[{"subSector":{"columnName":"Cusip","columnTag":"cusip","positionColumnType":"ALL",' +
            '"useNoneBuckets":true},"sectorValue":"Cusip1","sectorType":"NormalSector"},{"subSector":{"columnName":"Strategy Name","columnTag":"strategy_name","positionColumnType":"ALL","useNoneBuckets":true},"sectorValue":"Strategy 1","sectorType":"NormalSector"}]}]');
    });
});
