import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ExploreSlopeGraphComponent} from './explore-slope-graph.component';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {data1} from '@mocks/test-data/qbstr-test-data';
import {ReactiveCube} from '@qbstr/data-cube-reactive';
import {ROOT_LEVEL} from '@utils/qbstr';
import {SimpleChange, SimpleChanges} from '@angular/core';
import {Widget} from '@models/widget/widget.model';
import {TestUtils} from '@utils/test.utils';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import * as hcCore from '@qbstr/highcharts-core';
import Highcharts from 'highcharts';
import {ChartType} from "@qbstr/highcharts-api";

describe('ExploreSlopeGraphComponent', () => {
    let component: ExploreSlopeGraphComponent;
    let fixture: ComponentFixture<ExploreSlopeGraphComponent>;
    let widgetPayload: WidgetPayload;
    let colMap: any;

    const setupHighchartsSpy = jest.spyOn(hcCore, 'setupHighcharts');
    const generateOptionsSpy = jest.spyOn(hcCore, 'generateOptions');

    beforeAll((done) => {
        TestUtils.initialize(done);
        const request = {
            portfolio: 'PEP',
            columns: [
                {
                    columnKey: 'cusip_0',
                    columnTitle: 'cusip_0',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'cusip_0',
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'pct_mv_1',
                    columnTitle: 'pct_mv_1',
                    formatter: {format: () => ''},
                    dataType: 'DOUBLE',
                    columnTag: 'pct_mv_1',
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'security_description_1',
                    columnTitle: 'security_description_1',
                    formatter: {format: () => ''},
                    dataType: 'STRING',
                    columnTag: 'security_description_1',
                    isHidden: false,
                    isSubtotalable: true
                },
            ]
        };
        widgetPayload = {widgetConfigType: WidgetConfigType.SLOPE_GRAPH};
        widgetPayload.requestConfig = request;
        widgetPayload.responseConfig = data1.data as any;
        widgetPayload.cube = new ReactiveCube<any>([]);
        widgetPayload.breakdownLevels = [ROOT_LEVEL, 'level-1'];
        widgetPayload.customVizConfig = {
            showGridLines: 'true',
            secondaryYAxis: 'pct_mv_1',
            chartType: 'column'
        };
        colMap = {};
        request.columns.forEach(col => colMap[col.columnKey] = col);

    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExploreSlopeGraphComponent],
            imports: [AladdinAngularComponentsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExploreSlopeGraphComponent);
        component = fixture.componentInstance;
        component.widgetPayload = widgetPayload;
        component.widget = new Widget(WidgetConfigType.SLOPE_GRAPH);

        setupHighchartsSpy.mockImplementation(() => component.hc);
        generateOptionsSpy.mockImplementation(() => Highcharts.getOptions());

        component['setInternalState'](widgetPayload);
        const simpleChanges: SimpleChanges = {
            widget: new SimpleChange(undefined, new Widget(WidgetConfigType.SLOPE_GRAPH), true),
            widgetPayload: new SimpleChange(undefined, widgetPayload, true)
        };
        component.ngOnChanges(simpleChanges);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the xAxis categories for the slope graph based on comparison mode', () => {
        expect(component.getCategories()).toEqual(['Before', 'After']);
        component.requestConfig = {
            portfolio: 'PEP',
            columns: [
                {
                    columnKey: 'market_val_0',
                    columnTitle: 'Market Value',
                    formatter: undefined,
                    dataType: 'DOUBLE',
                    columnTag: 'market_val',
                    isHidden: false,
                    isSubtotalable: true
                }] as any
        };
        component.responseConfig = {
            splitColumnKeys: {
                market_val_0: [
                    {
                        header: 'PEP',
                        originalKey: 'market_val_0',
                        updatedKey: 'market_val_0|PEP',
                        updatedKeySuffix: 'PEP'
                    },
                    {
                        header: 'What If PEP 1',
                        originalKey: 'market_val_0',
                        updatedKey: 'market_val_0|What If PEP 1',
                        updatedKeySuffix: 'What If PEP 1'
                    }
                ]
            }
        };
        expect(component.getCategories()).toEqual(['PEP', 'What If PEP 1']);
    });

    it('should format the tooltip points', () => {
        component.requestConfig.columns.push({
            columnKey: 'market_val_0',
            columnTitle: 'Market Value',
            formatter: {format: () => ''},
            dataType: 'DOUBLE',
            columnTag: 'market_val',
            isSubtotalable: true,
            isHidden: false,
            originalColumnTitle: 'Market Value'
        });
        component.requestConfig.portfolio = "SNP500";

        // for single measure
        let point = {
            name: 'Software', category: 'After', series: {name: 'Software'}, y: 2742368400.0888, qbstr: {
                measureName: 'market_val_0', negative: false
            }
        } as any;

        expect(component.tooltipPointFormatter(point)).toMatchSnapshot();
    });
});
