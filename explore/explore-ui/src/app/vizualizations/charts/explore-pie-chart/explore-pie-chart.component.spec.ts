import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {data1} from '@mocks/test-data/qbstr-test-data';
import {ReactiveCube} from '@qbstr/data-cube-reactive';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {ExplorePieChartComponent} from './explore-pie-chart.component';
import {ROOT_LEVEL} from '@utils/qbstr';
import {ChartSettings} from '@models/widget/inputs/chart-settings/chart-settings.model';
import {Widget} from '@models/widget/widget.model';
import {TestUtils} from '@utils/test.utils';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import Highcharts from 'highcharts';
import * as hcCore from '@qbstr/highcharts-core';

describe('ExplorePieChartComponent', () => {
    let component: ExplorePieChartComponent;
    let fixture: ComponentFixture<ExplorePieChartComponent>;
    let widgetPayload: WidgetPayload;

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
                    isSubtotalable: false,
                    isHidden: false
                },
                {
                    columnKey: 'pct_mv_1',
                    columnTitle: 'pct_mv_1',
                    formatter: {format: () => ''},
                    dataType: 'DOUBLE',
                    columnTag: 'pct_mv_1',
                    isSubtotalable: true,
                    isHidden: false
                },
                {
                    columnKey: 'security_description_1',
                    columnTitle: 'security_description_1',
                    formatter: {format: () => ''},
                    dataType: 'STRING',
                    columnTag: 'security_description_1',
                    isSubtotalable: false,
                    isHidden: false
                }
            ]
        };
        widgetPayload = {
            widgetConfigType: WidgetConfigType.PIE,
            requestConfig: request,
            responseConfig: data1.data as any,
            cube: new ReactiveCube<any>([]),
            breakdownLevels: [ROOT_LEVEL, 'level-1']
        };
        widgetPayload.customVizConfig = {
            showGridLines: 'true',
        };
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExplorePieChartComponent],
            imports: [AladdinAngularComponentsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExplorePieChartComponent);
        component = fixture.componentInstance;
        component.widget = new Widget(WidgetConfigType.PIE);
        component.widgetPayload = widgetPayload;

        setupHighchartsSpy.mockImplementation(() => component.hc);
        generateOptionsSpy.mockImplementation(() => Highcharts.getOptions());

        component['setInternalState'](widgetPayload);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('creates chart config from measures', () => {
        const measures = [{name: 'pct_mv_0', title: 'Notional Market Value %', aggMethod: 'sum'}];
        expect(component.createChartConfig(measures)).toEqual({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'pct_mv_1',
                    'Security Group',
                ],
            },
            'drillDown': [],
            'flattenedRow': undefined,
            'groupBy': [
                'level-1',
            ],
            'measures': [
                {
                    'aggMethod': 'sum',
                    'name': 'pct_mv_0',
                    'title': 'Notional Market Value %',
                },
            ],
            'useAbsoluteValue': true,
        });
    });

    it('creates chart config from measures - praPie chart', () => {
        const measures = [{name: 'pct_mv_0', title: 'Notional Market Value %', aggMethod: 'sum'}];
        component.widget.configType = WidgetConfigType.FACTOR_GRAPHING_PIE_CHART;
        expect(component.createChartConfig(measures)).toEqual({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'pct_mv_1',
                    'Security Group',
                ],
            },
            'drillDown': [],
            'flattenedRow': 'level-1',
            'groupBy': [
                'level-1',
            ],
            'measures': [
                {
                    'aggMethod': 'sum',
                    'name': 'pct_mv_0',
                    'title': 'Notional Market Value %',
                },
            ],
            'useAbsoluteValue': true,
        });
        component.widget.configType = WidgetConfigType.PIE;
    });

    it('create chart options', () => {
        const chartSettings = new ChartSettings();
        chartSettings.labelShow = false;
        chartSettings.legendShow = true;

        component.createChartConfig([{name: 'pct_mv_0', title: 'Notional Market Value %', aggMethod: 'sum'}]);
        component.widget.dataStore.metaData.inputs.set(ChartSettings.CHART_SETTINGS, chartSettings);
        component.storeChangedChartState({label: false});
        component.isBatchExport = true;
        expect(component.createChartOptions()).toMatchObject({
            'chart': {
                'animation': false,
                'events': {},
                'zoomType': 'xy',
            },
            'colors': undefined,
            'credits': {
                'enabled': false,
            },
            'exporting': {
                'enabled': false,
            },
            'hideLegendToggle': true,
            'legend': {
                'align': 'center',
                'enabled': true,
                'itemDistance': 8,
                'itemMarginTop': 3.5,
                'maxHeight': 120,
                'width': '100%',
            },
            'plotOptions': {
                'series': {
                    'dataLabels': {
                        'enabled': false,
                    },
                    'tooltip': {
                        'headerFormat': '',
                    },
                },
            },
            'title': {
                'text': null,
            },
            'xAxis': {
                'gridLineWidth': 1,
            },
            'yAxis': {
                'labels': {},
                'title': {
                    'text': '',
                },
            },
        });
    });

    it('should test toolTipFormatter when seriesName and category name are same, positive value and positive y value', () => {
        const point = {
            name: 'Equity',
            value: 903.5,
            y: 213.34562,
            series: {
                name: 'Equity'
            },
            qbstr: {
                negative: false
            },
        };


        jest.spyOn(component['firstCol'].formatter, 'format').mockReturnValue('903');
        expect(component.tooltipPointFormatter(point)).toBe(`<b>Equity</b>: 903<br/>`);
    });

    it('should test toolTipFormatter when seriesName and category name are same, positive value and negative y value', () => {
        const point = {
            name: 'Equity',
            value: 903.5,
            y: -213.34562,
            series: {
                name: 'Equity'
            },
            qbstr: {
                negative: false
            },
        };


        jest.spyOn(component['firstCol'].formatter, 'format').mockReturnValue('903');
        expect(component.tooltipPointFormatter(point)).toBe(`<b>Equity</b>: 903<br/>`);
    });

    it('should test toolTipFormatter when seriesName and category name same and negative value, negative point value', () => {
        const point = {
            name: 'Equity',
            value: -903.5,
            y: -0.126,
            series: {
                name: 'Equity'
            },
            qbstr: {
                negative: true
            },
        };


        jest.spyOn(component['firstCol'].formatter, 'format').mockReturnValue('903');
        expect(component.tooltipPointFormatter(point)).toBe(`<b>Equity</b>: 903<br/>`);
    });

    it('should test toolTipFormatter when seriesName and category name are same and negative true and positive point value', () => {
        const point = {
            name: 'Equity',
            y: 303.55,
            colorValue: 0.1377,
            series: {
                name: 'Equity'
            },
            qbstr: {
                negative: true
            },
        };
        jest.spyOn(component['firstCol'].formatter, 'format').mockReturnValue('568');
        expect(component.tooltipPointFormatter(point)).toBe(`<b>Equity</b>: 568<br/>`);
    });

    it('should test toolTipFormatter when seriesName, firstColumn name same and category name is different, positive value and positive y value', () => {
        const point = {
            name: 'Equity',
            value: 903.5,
            y: 1355.123,
            series: {
                name: 'Notional Market Value %'
            },
            qbstr: {
                negative: false
            },
        };

        component['firstCol'].columnTitle = 'Notional Market Value %';
        jest.spyOn(component['firstCol'].formatter, 'format').mockReturnValue('903');
        expect(component.tooltipPointFormatter(point)).toBe(`<b>Notional Market Value %</b><br><b>&nbsp;Equity</b>: 903<br/>`);
    });

    it('should test toolTipFormatter when seriesName and firstColumn name and category name are different, positive value and negative y value', () => {
        const point = {
            name: 'Equity',
            value: 903.5,
            y: -1355.123,
            series: {
                name: 'IT'
            },
            qbstr: {
                negative: false
            },
        };

        component['firstCol'].columnTitle = 'Notional Market Value %';
        jest.spyOn(component['firstCol'].formatter, 'format').mockReturnValue('903');
        expect(component.tooltipPointFormatter(point)).toBe(`<b>Notional Market Value %</b><br><b>&nbsp;IT</b><br><b>&nbsp;Equity</b>: 903<br/>`);
    });

    it('test labelFormatter - should append - for negative values', () => {
        const point = {
            point: {
                name: 'Equity',
                value: 903.5,
                y: 213.34562,
                series: {
                    name: 'Equity'
                },
                qbstr: {
                    negative: true
                },
            }
        };

        jest.spyOn(component['firstCol'].formatter, 'format').mockReturnValue('-903');
        expect(component.labelFormatter(point)).toBe('-903');
    });

});
