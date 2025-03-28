import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {data1} from '@mocks/test-data/qbstr-test-data';
import {ReactiveCube, SimpleCube} from '@qbstr/data-cube-reactive';
import {ChartType, LineChartConfig} from '@qbstr/highcharts-api';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {ROOT_LEVEL} from '@utils/qbstr';
import {ExploreTimeSeriesChartComponent} from './explore-time-series-chart.component';
import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';
import {AggregationKey, createQK, FilterIncludeKey, GroupByKey} from '@qbstr/data-cube';
import {ChartWidgetInputConfigType, WidgetConfigType} from '@blk/explore-ui-core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import * as hcCore from '@qbstr/highcharts-core';
import Highcharts from 'highcharts';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {LineChartStyle} from '@enums/line-chart-style.enum';

const request = {
    portfolio: 'PEP',
    columns: [
        {
            columnKey: 'pct_mv_1',
            columnTitle: 'Market Value %',
            formatter: {format: () => ''},
            dataType: 'DOUBLE',
            columnTag: 'pct_mv',
            isSubtotalable: true,
            isHidden: false,
            originalColumnTitle: '',
            chartType: ChartType.LINE
        }
    ]
};

describe('ExploreTimeSeriesChartComponent', () => {
    let component: ExploreTimeSeriesChartComponent;
    let fixture: ComponentFixture<ExploreTimeSeriesChartComponent>;
    let widgetPayload: WidgetPayload;
    let colMap = {};
    const setupHighchartsSpy = jest.spyOn(hcCore, 'setupHighcharts');
    const generateOptionsSpy = jest.spyOn(hcCore, 'generateOptions');

    beforeAll((done) => {
        TestUtils.initialize(done);

        widgetPayload = {
            widgetConfigType: WidgetConfigType.TIME_SERIES,
            requestConfig: request,
            responseConfig: data1.data as any,
            cube: new ReactiveCube<any>([]),
            breakdownLevels: [ROOT_LEVEL, 'level-1'],
            customVizConfig: {
                showGridLines: 'true',
                seriesNameFieldOverride: 'rfv_ftitle',
                comboChartColumns: [new ComboChartColumn({colKey: 'pct_mv_1', secondaryAxis: false, chartType: ColumnSeriesChartType.LINE})]
            }
        };

    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AladdinAngularComponentsModule],
            declarations: [ExploreTimeSeriesChartComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExploreTimeSeriesChartComponent);
        component = fixture.componentInstance;
        component.widgetPayload = widgetPayload;
        setupHighchartsSpy.mockImplementation(() => component.hc);
        generateOptionsSpy.mockImplementation(() => Highcharts.getOptions());
        component.widget = new Widget(WidgetConfigType.TIME_SERIES);
        component['setInternalState'](widgetPayload);

        colMap = {};
        request.columns.forEach(col => colMap[col.columnKey] = col);
        component['colMap'] = colMap;

        const simpleChanges: SimpleChanges = {
            widget: new SimpleChange(undefined, new Widget(WidgetConfigType.TIME_SERIES), true),
            widgetPayload: new SimpleChange(undefined, widgetPayload, true)
        };
        component.ngOnChanges(simpleChanges);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('creates chart options', () => {
        component.chartMeasures = [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum', chartType: ChartType.LINE}];
        const config = component.createChartConfig([{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum', chartType: ChartType.LINE}]);
        expect(component.createChartOptions(config)).toMatchObject({
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
            'hideLegendToggle': undefined,
            'legend': {
                'align': 'center',
                'enabled': true,
                'itemMarginTop': 3.5,
                'maxHeight': 100,
            },
            'plotOptions': {
                'column': {
                    'stacking': null,
                },
                'line': {
                    'marker': {
                        'enabled': undefined,
                    },
                },
                'series': {
                    'dataLabels': {
                        'enabled': false,
                        'padding': 0,
                    },
                    'marker': {
                        'enabled': null,
                    },
                    'tooltip': {
                        'headerFormat': '',
                    },
                    'turboThreshold': 0,
                },
            },
            'title': {
                'text': null,
            },
            'xAxis': {
                'endOnTick': false,
                'gridLineWidth': 1,
                'labels': {},
            },
            'yAxis': [
                {
                    'alignTicks': true,
                    'endOnTick': true,
                    'labels': {},
                    'max': undefined,
                    'min': undefined,
                    'opposite': false,
                    'showLastLabel': true,
                    'startOnTick': true,
                    'tickInterval': undefined,
                    'title': {
                        'text': 'pct_mv_1',
                    },
                },
            ],
        });
    });

    it('creates chart options with y axis', () => {
        component.chartMeasures = [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum', chartType: ChartType.LINE}];
        component.customVizConfig = {comboChartColumns: [new ComboChartColumn({colKey: 'pct_mv_1', secondaryAxis: false, chartType: ColumnSeriesChartType.LINE})]};
        const config = component.createChartConfig([{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum', chartType: ChartType.LINE}]);
        expect(component.createChartOptions(config)).toMatchObject({
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
            'hideLegendToggle': undefined,
            'legend': {
                'align': 'center',
                'enabled': true,
                'itemMarginTop': 3.5,
                'maxHeight': 100,
            },
            'plotOptions': {
                'column': {
                    'stacking': null,
                },
                'line': {
                    'marker': {
                        'enabled': undefined,
                    },
                },
                'series': {
                    'dataLabels': {
                        'enabled': false,
                        'padding': 0,
                    },
                    'marker': {
                        'enabled': null,
                    },
                    'tooltip': {
                        'headerFormat': '',
                    },
                    'turboThreshold': 0,
                },
            },
            'title': {
                'text': null,
            },
            'xAxis': {
                'endOnTick': false,
                'gridLineWidth': 0,
                'labels': {},
            },
            'yAxis': [
                {
                    'alignTicks': true,
                    'endOnTick': true,
                    'labels': {},
                    'max': undefined,
                    'min': undefined,
                    'opposite': false,
                    'showLastLabel': true,
                    'startOnTick': true,
                    'tickInterval': undefined,
                    'title': {
                        'text': 'pct_mv_1',
                    },
                },
            ],
        });
    });

    it('creates chart config', () => {
        component.breakdownLevels = [ROOT_LEVEL, 'level-1'];
        const measures = [
            {name: 'notional_mv_1', title: 'Notional Market Value', aggMethod: 'sum', chartType: ChartType.LINE},
        ];
        expect(component.createChartConfig(measures)).toEqual({
            'drillDown': undefined,
            'groupBy': [
                'level-1',
            ],
            'measures': [
                {
                    'aggMethod': 'sum',
                    'axis': undefined,
                    'chartType': 'line',
                    'name': 'notional_mv_1',
                    'title': 'Notional Market Value',
                },
            ],
            'stacked': undefined,
        });

        // chartConfig for chartType as bar
        measures[0].chartType = ChartType.COLUMN;
        expect(component.createChartConfig(measures)).toEqual({
            'drillDown': undefined,
            'groupBy': [
                'level-1',
            ],
            'measures': [
                {
                    'aggMethod': 'sum',
                    'axis': undefined,
                    'chartType': 'column',
                    'name': 'notional_mv_1',
                    'title': 'Notional Market Value',
                },
            ],
            'stacked': undefined,
        });
    });

    it('createChartConfig when split keys are present', () => {
        const measures = [{name: 'krd_123|3M', title: 'Key Rate Duration', aggMethod: 'sum', chartType: ChartType.COLUMN},
            {name: 'krd_123|1Y', title: 'Key Rate Duration', aggMethod: 'sum', chartType: ChartType.COLUMN}];
        expect(component.createChartConfig(measures)).toEqual({
            'drillDown': undefined,
            'groupBy': [
                'level-1',
            ],
            'measures': [
                {
                    'aggMethod': 'sum',
                    'axis': undefined,
                    'chartType': 'column',
                    'name': 'krd_123|3M',
                    'title': '3M',
                },
                {
                    'aggMethod': 'sum',
                    'axis': undefined,
                    'chartType': 'column',
                    'name': 'krd_123|1Y',
                    'title': '1Y',
                },
            ],
            'stacked': undefined,
        });
    });

    it('Test updateSeriesBeforeCharting callback', () => {
        const testJson = {
            data: JSON.parse('[{"type":"line","data":[{"name":"20-FEB-2019","y":99.82148665738754,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":99.81691126481948,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":99.81333644211388,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":99.80529784285528,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":99.79624770099173,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":99.79099757852723,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":100.00000000000016,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":100.00000000000004,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":99.99719958898364,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":99.97991092874115,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % BND","yAxis":0,"className":"highcharts-color-1","colorIndex":1,"legendIndex":1},{"type":"line","data":[{"name":"20-FEB-2019","y":72.51836240274393,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":72.43797032977526,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":72.43729632978376,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":72.58337903466138,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":72.96647131488845,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":73.11418068567333,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":72.66132184239108,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":72.45113235719808,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":72.41634527564352,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":72.41566741046742,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % BND","yAxis":0,"className":"highcharts-color-2","colorIndex":2,"legendIndex":2},{"type":"line","data":[{"name":"20-FEB-2019","y":0.17851334261254973,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":0.18308873518062825,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":0.18666355788619128,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":0.1947021571447068,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":0.20375229900826809,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":0.20900242147301532,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":0.002800411016450431,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":0.020089071258777539,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % CASH","yAxis":0,"className":"highcharts-color-3","colorIndex":3,"legendIndex":3},{"type":"line","data":[{"name":"20-FEB-2019","y":-12.130936071065081,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":-12.112609984282202,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":-13.701912212240652,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":-14.013027216727958,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":-12.200899940067995,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":-12.307296218058019,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":-12.037992689981364,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":-11.749580392936585,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":-11.664369838030267,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":-11.540245501196866,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % CASH","yAxis":0,"className":"highcharts-color-4","colorIndex":4,"legendIndex":4},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % ABS","yAxis":0,"className":"highcharts-color-5","colorIndex":5,"legendIndex":5},{"type":"line","data":[{"name":"20-FEB-2019","y":5.805541734856917,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":5.814992999838306,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":5.803885615041521,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":5.808919497034466,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":5.801646709801164,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":5.817555827266399,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":5.804296943005137,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":5.770957225550987,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":5.7622035553488299,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":5.764170711585815,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % ABS","yAxis":0,"className":"highcharts-color-6","colorIndex":6,"legendIndex":6},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % CMBS","yAxis":0,"className":"highcharts-color-7","colorIndex":7,"legendIndex":7},{"type":"line","data":[{"name":"20-FEB-2019","y":4.507315225039311,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":4.529895759602797,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":4.522057721722971,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":4.528559754503828,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":4.530872376801635,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":4.525914540177945,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":4.513036802318942,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":4.516560091939691,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":4.517566261287518,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":4.53057994798133,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % CMBS","yAxis":0,"className":"highcharts-color-8","colorIndex":8,"legendIndex":8},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % CMO","yAxis":0,"className":"highcharts-color-9","colorIndex":9,"legendIndex":9},{"type":"line","data":[{"name":"20-FEB-2019","y":0.4306156971813148,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":0.4314339258185789,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":0.4307424768882803,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":0.42764134074399109,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":0.42725807933077517,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":0.4283290871240816,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":0.4276189017469684,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":0.42647341941667946,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":0.4260692401084556,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":0.426099548812841,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % CMO","yAxis":0,"className":"highcharts-color-10","colorIndex":10,"legendIndex":10},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % EQUITY","yAxis":0,"className":"highcharts-color-11","colorIndex":11,"legendIndex":11},{"type":"line","data":[{"name":"20-FEB-2019","y":0.11508831753330713,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":0.11530546483312142,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":0.11507045118245077,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":0.11516727289672918,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":0.11443898131943208,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":0.11474054714456598,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":0.11516306977249917,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":0.11476060348592932,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":0.1145946707177854,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":0.11461281171677908,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % EQUITY","yAxis":0,"className":"highcharts-color-12","colorIndex":12,"legendIndex":12},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % FUND","yAxis":0,"className":"highcharts-color-0","colorIndex":0,"legendIndex":13},{"type":"line","data":[{"name":"20-FEB-2019","y":0.27401364025779659,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":0.27454146495100487,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":1.9044920583397052,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":2.135882712392798,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":0.19827737610613084,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":0.19178497909001056,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":0.3165969537544343,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":0.2918496917113316,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":0.26611097595267077,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":0.2181773146909323,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % FUND","yAxis":0,"className":"highcharts-color-1","colorIndex":1,"legendIndex":14},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % FUTURE","yAxis":0,"className":"highcharts-color-2","colorIndex":2,"legendIndex":15},{"type":"line","data":[{"name":"20-FEB-2019","y":13.583095799079287,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":14.14737262773067,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":19.179181102318137,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":16.593992063158696,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":15.598372017692667,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":15.494076130125528,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":21.9412926640502,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":23.696476215485423,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":23.631891510957176,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":26.7960959482499,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % FUTURE","yAxis":0,"className":"highcharts-color-3","colorIndex":3,"legendIndex":16},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % MBS","yAxis":0,"className":"highcharts-color-4","colorIndex":4,"legendIndex":17},{"type":"line","data":[{"name":"20-FEB-2019","y":28.34083402142507,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":28.368310058880547,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":28.34688854540031,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":28.272022790238017,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":28.018499871236736,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":27.96212434954391,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":28.044995007660878,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":28.019051497475439,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":28.004417409141625,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":27.91516640713353,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % MBS","yAxis":0,"className":"highcharts-color-5","colorIndex":5,"legendIndex":18},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},null,null,null,{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % OPTION","yAxis":0,"className":"highcharts-color-6","colorIndex":6,"legendIndex":19},{"type":"line","data":[{"name":"20-FEB-2019","y":0.00004217581393235133,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":0.000042257056004930797,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},null,null,null,{"name":"27-FEB-2019","y":0.011414906647716869,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":0.013210136890522223,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":0.01731084233361445,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":0.014556473704928639,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":0.01455877807888581,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % OPTION","yAxis":0,"className":"highcharts-color-7","colorIndex":7,"legendIndex":20},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % SWAP","yAxis":0,"className":"highcharts-color-8","colorIndex":8,"legendIndex":21},{"type":"line","data":[{"name":"20-FEB-2019","y":-4.793474719566296,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":-3.575990829824321,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":-3.4785978154432928,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":-3.4694792681201305,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":-3.381016778242901,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":-3.35214205745197,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":-3.369494144392207,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":-3.3868959223985466,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":-3.364493724659407,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":-3.360217205459562,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % SWAP","yAxis":0,"className":"highcharts-color-9","colorIndex":9,"legendIndex":22},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % SYNTH","yAxis":0,"className":"highcharts-color-10","colorIndex":10,"legendIndex":23},{"type":"line","data":[{"name":"20-FEB-2019","y":0.15159203007083109,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":0.15042846528875274,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":0.15217100929253556,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":0.15164480541350604,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":0.15469524596157034,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":0.15287336924142329,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":0.15015242045074374,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":0.14874708570171855,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":0.14993494447311127,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":0.14824723358135118,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % SYNTH","yAxis":0,"className":"highcharts-color-11","colorIndex":11,"legendIndex":24}]')
        };
        component['_widgetPayload'].widgetSpecificData = {
            sectorsToShowForPort: {
                'BR-CORE': [
                    'ABS',
                    'CMBS',
                    'CMO',
                    'FUND',
                    'SWAP',
                    'SYNTH',
                    'OPTION',
                    'BND',
                    'FUTURE',
                    'CASH',
                    'EQUITY',
                    'MBS'
                ],
                'LCORP3-5': [
                    'BND',
                    'CASH'
                ]
            }
        };
        component.chartMeasures = [{name: 'pct_notional_val_0|LCORP3-5', title: 'Notional Market Value %', aggMethod: 'sum', chartType: ChartType.LINE}];
        let processedData = component.updateSeriesBeforeCharting(testJson);
        // If it's not compare mode, then data should just be returned
        expect(processedData).toEqual(testJson.data);
        expect(processedData.length).toEqual(24);
        component.requestConfig.isCompareMode = true;
        processedData = component.updateSeriesBeforeCharting(testJson);
        // 10 series should be filtered out
        expect(processedData.length).toEqual(14);
    });

    it('Test updateSeriesBeforeChartingForScatter callback', () => {
        const testJson = {
            data: JSON.parse('[{"type":"line","data":[{"name":"20-FEB-2019","y":99.82148665738754,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":99.81691126481948,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":99.81333644211388,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":99.80529784285528,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":99.79624770099173,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":99.79099757852723,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":100.00000000000016,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":100.00000000000004,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":99.99719958898364,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":99.97991092874115,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % BND","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":1,"legendIndex":1},{"type":"line","data":[{"name":"20-FEB-2019","y":72.51836240274393,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":72.43797032977526,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":72.43729632978376,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":72.58337903466138,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":72.96647131488845,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":73.11418068567333,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":72.66132184239108,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":72.45113235719808,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":72.41634527564352,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":72.41566741046742,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % BND","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":2,"legendIndex":2},{"type":"line","data":[{"name":"20-FEB-2019","y":0.17851334261254973,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":0.18308873518062825,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":0.18666355788619128,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":0.1947021571447068,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":0.20375229900826809,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":0.20900242147301532,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":0.002800411016450431,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":0.020089071258777539,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % CASH","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":3,"legendIndex":3},{"type":"line","data":[{"name":"20-FEB-2019","y":-12.130936071065081,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":-12.112609984282202,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":-13.701912212240652,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":-14.013027216727958,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":-12.200899940067995,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":-12.307296218058019,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":-12.037992689981364,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":-11.749580392936585,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":-11.664369838030267,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":-11.540245501196866,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % CASH","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":4,"legendIndex":4},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % ABS","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":5,"legendIndex":5},{"type":"line","data":[{"name":"20-FEB-2019","y":5.805541734856917,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":5.814992999838306,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":5.803885615041521,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":5.808919497034466,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":5.801646709801164,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":5.817555827266399,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":5.804296943005137,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":5.770957225550987,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":5.7622035553488299,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":5.764170711585815,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % ABS","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":6,"legendIndex":6},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % CMBS","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":7,"legendIndex":7},{"type":"line","data":[{"name":"20-FEB-2019","y":4.507315225039311,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":4.529895759602797,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":4.522057721722971,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":4.528559754503828,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":4.530872376801635,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":4.525914540177945,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":4.513036802318942,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":4.516560091939691,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":4.517566261287518,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":4.53057994798133,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % CMBS","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":8,"legendIndex":8},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % CMO","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":9,"legendIndex":9},{"type":"line","data":[{"name":"20-FEB-2019","y":0.4306156971813148,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":0.4314339258185789,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":0.4307424768882803,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":0.42764134074399109,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":0.42725807933077517,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":0.4283290871240816,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":0.4276189017469684,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":0.42647341941667946,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":0.4260692401084556,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":0.426099548812841,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % CMO","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":10,"legendIndex":10},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % EQUITY","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":11,"legendIndex":11},{"type":"line","data":[{"name":"20-FEB-2019","y":0.11508831753330713,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":0.11530546483312142,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":0.11507045118245077,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":0.11516727289672918,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":0.11443898131943208,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":0.11474054714456598,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":0.11516306977249917,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":0.11476060348592932,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":0.1145946707177854,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":0.11461281171677908,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % EQUITY","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":12,"legendIndex":12},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % FUND","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":0,"legendIndex":13},{"type":"line","data":[{"name":"20-FEB-2019","y":0.27401364025779659,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":0.27454146495100487,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":1.9044920583397052,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":2.135882712392798,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":0.19827737610613084,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":0.19178497909001056,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":0.3165969537544343,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":0.2918496917113316,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":0.26611097595267077,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":0.2181773146909323,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % FUND","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":1,"legendIndex":14},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % FUTURE","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":2,"legendIndex":15},{"type":"line","data":[{"name":"20-FEB-2019","y":13.583095799079287,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":14.14737262773067,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":19.179181102318137,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":16.593992063158696,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":15.598372017692667,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":15.494076130125528,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":21.9412926640502,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":23.696476215485423,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":23.631891510957176,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":26.7960959482499,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % FUTURE","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":3,"legendIndex":16},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % MBS","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":4,"legendIndex":17},{"type":"line","data":[{"name":"20-FEB-2019","y":28.34083402142507,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":28.368310058880547,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":28.34688854540031,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":28.272022790238017,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":28.018499871236736,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":27.96212434954391,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":28.044995007660878,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":28.019051497475439,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":28.004417409141625,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":27.91516640713353,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % MBS","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":5,"legendIndex":18},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},null,null,null,{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % OPTION","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":6,"legendIndex":19},{"type":"line","data":[{"name":"20-FEB-2019","y":0.00004217581393235133,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":0.000042257056004930797,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},null,null,null,{"name":"27-FEB-2019","y":0.011414906647716869,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":0.013210136890522223,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":0.01731084233361445,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":0.014556473704928639,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":0.01455877807888581,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % OPTION","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":7,"legendIndex":20},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % SWAP","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":8,"legendIndex":21},{"type":"line","data":[{"name":"20-FEB-2019","y":-4.793474719566296,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":-3.575990829824321,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":-3.4785978154432928,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":-3.4694792681201305,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":-3.381016778242901,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":-3.35214205745197,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":-3.369494144392207,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":-3.3868959223985466,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":-3.364493724659407,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":-3.360217205459562,"qbstr":{"negative":true,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % SWAP","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":9,"legendIndex":22},{"type":"line","data":[{"name":"20-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"21-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"22-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"25-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"26-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"27-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"28-FEB-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"01-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"04-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}},{"name":"05-MAR-2019","y":null,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|LCORP3-5"}}],"animation":false,"name":"LCORP3-5 Notional Market Value % SYNTH","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":10,"legendIndex":23},{"type":"line","data":[{"name":"20-FEB-2019","y":0.15159203007083109,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"21-FEB-2019","y":0.15042846528875274,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"22-FEB-2019","y":0.15217100929253556,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"25-FEB-2019","y":0.15164480541350604,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"26-FEB-2019","y":0.15469524596157034,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"27-FEB-2019","y":0.15287336924142329,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"28-FEB-2019","y":0.15015242045074374,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"01-MAR-2019","y":0.14874708570171855,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"04-MAR-2019","y":0.14993494447311127,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}},{"name":"05-MAR-2019","y":0.14824723358135118,"qbstr":{"negative":false,"measureName":"pct_notional_val_0|BR-CORE"}}],"animation":false,"name":"BR-CORE Notional Market Value % SYNTH","yAxis":0,"className":"hidden-line-graph hidden-line","colorIndex":11,"legendIndex":24}]')
        };
        component['_widgetPayload'].widgetSpecificData = {
            sectorsToShowForPort: {
                'BR-CORE': [
                    'ABS',
                    'CMBS',
                    'CMO',
                    'FUND',
                    'SWAP',
                    'SYNTH',
                    'OPTION',
                    'BND',
                    'FUTURE',
                    'CASH',
                    'EQUITY',
                    'MBS'
                ],
                'LCORP3-5': [
                    'BND',
                    'CASH'
                ]
            }
        };
        component.chartMeasures = [{name: 'pct_notional_val_0|LCORP3-5', title: 'Notional Market Value %', aggMethod: 'sum', chartType: ChartType.LINE}];
        component.requestConfig.isCompareMode = false;
        let processedData = component.updateSeriesBeforeChartingForScatter(testJson);
        // If it's not compare mode, then data should just be returned
        expect(processedData).toEqual(testJson.data);
        expect(processedData.length).toEqual(24);
        expect(processedData[0].className).toEqual('hidden-line-graph hidden-line');
        component.requestConfig.isCompareMode = true;
        processedData = component.updateSeriesBeforeChartingForScatter(testJson);
        // 10 series should be filtered out
        expect(processedData.length).toEqual(14);
    });

    it('should format the tooltip points', () => {
        component.chartMeasures = [{name: 'pct_mv_1', title: 'Market Value %', aggMethod: 'sum', chartType: ChartType.BAR}];
        // for single measure
        let point = {
            name: 'Market Value % 24-FEB-2017', category: '24-FEB-2017', series: {name: 'FUND'}, y: 0.962044, qbstr: {
                measureName: 'pct_mv_1'
            }
        } as any;
        expect(component.tooltipPointFormatter(point)).toMatchSnapshot();

        // for multiple measures
        point = {
            name: 'Market Value % 24-FEB-2017',
            category: '24-FEB-2017',
            series: {name: 'Market Value % FUND'},
            qbstr: {
                measureName: 'pct_mv_1'
            },
            y: 0.962044
        } as any;
        component.requestConfig.columns.push({
            columnKey: 'pct_notional_val_1',
            columnTitle: 'Notional Market Value %',
            formatter: {format: () => ''},
            dataType: 'DOUBLE',
            columnTag: 'pct_notional_val',
            isSubtotalable: true,
            isHidden: false,
            originalColumnTitle: ''
        });
        component.chartConfig.measures.push({
            name: 'pct_notional_val_1',
            title: 'Notional Market Value %',
            aggMethod: 'sum',
            chartType: ChartType.BAR
        });
        expect(component.tooltipPointFormatter(point)).toMatchSnapshot();
    });

    describe('Test enriching for line Chart', () => {
        let cube;

        beforeEach(() => {
            cube = new SimpleCube([]);
        });

        it('should enrich cube #1', () => {

            const chartConfig: LineChartConfig = {
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum', chartType: ChartType.LINE}],
                groupBy: ['sector', 'country'],
                breakdowns: ['sector', 'country'],
            };

            cube.set(createQK([new GroupByKey('sector'), new AggregationKey('pct_mv_1', 'sum')]), [1]);
            component['enrichCube'](cube, chartConfig, []);
            const sbsc = cube.get(createQK([new GroupByKey('sector'), new GroupByKey('country'), new AggregationKey('pct_mv_1', 'sum')]))
                .subscribe(data => {
                    expect(data).toEqual([1]);
                });
            sbsc.unsubscribe();
        });

        it('should enrich cube #2', () => {
            component.customVizConfig = {
                showTotal: true,
                seriesNameFieldOverride: 'rfv_ftitle'
            };
            const chartConfig: LineChartConfig = {
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum', chartType: ChartType.LINE}],
                groupBy: ['sector', 'country'],
                breakdowns: ['sector', 'country'],
            };

            cube.set(createQK([new GroupByKey('sector'), new AggregationKey('pct_mv_1', 'sum')]), [1]);
            cube.set(createQK([new GroupByKey('country'), new AggregationKey('pct_mv_1', 'sum')]), [2]);

            component['enrichCube'](cube, chartConfig, []);
            const sbsc = cube.get(createQK([new GroupByKey('sector'), new GroupByKey('country'), new AggregationKey('pct_mv_1', 'sum')]))
                .subscribe(data => {
                    expect(data).toEqual([1, 2]);
                });
            sbsc.unsubscribe();
        });

        it('should enrich cube #3', () => {
            component.customVizConfig = {
                showTotal: true,
                seriesNameFieldOverride: 'rfv_ftitle'
            };
            const chartConfig: LineChartConfig = {
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum', chartType: ChartType.COLUMN}],
                groupBy: ['sector', 'country'],
                breakdowns: ['sector', 'country'],
            };

            cube.set(createQK([new GroupByKey('sector'), new AggregationKey('pct_mv_1', 'sum')]), [1]);
            cube.set(createQK([new GroupByKey('country'), new AggregationKey('pct_mv_1', 'sum')]), [2]);

            component['enrichCube'](cube, chartConfig, []);
            const sbsc = cube.get(createQK([new GroupByKey('sector'), new GroupByKey('country'), new AggregationKey('pct_mv_1', 'sum')]))
                .subscribe(data => {
                    expect(data).toEqual([1, 2]);
                });
            sbsc.unsubscribe();
        });
    });

    describe('leaf level enriching for factor time series chart', () => {
        let cube;

        beforeEach(() => {
            cube = new SimpleCube([]);
        });

        it('should enrich data for leaf level, launched from factor group', () => {
            component.customVizConfig = {
                showTotal: false,
                leafLevels: ['rfv_block_path']
            };
            const chartConfig: LineChartConfig = {
                measures: [{name: 'rfv_contrib_port_4', title: 'Risk Contribution', aggMethod: 'sum', chartType: ChartType.LINE}],
                groupBy: ['level-1', 'rfv_block_path'],
                breakdowns: ['level-1', 'rfv_block_path'],
            };
            const defaultQueryKeys = [
                new FilterIncludeKey('_ROOT_', ['PEP']),
                new FilterIncludeKey('level-2', ['COUNTRY'])
            ];

            cube.set(createQK([
                new FilterIncludeKey('_ROOT_', ['PEP']),
                new FilterIncludeKey('level-1', ['30-NOV-2021']),
                new FilterIncludeKey('level-2', ['COUNTRY'])
            ]), [1]);
            cube.set(createQK([
                new FilterIncludeKey('_ROOT_', ['PEP']),
                new FilterIncludeKey('level-1', ['30-NOV-2021']),
                new FilterIncludeKey('level-2', ['STYLE'])
            ]), [2]);
            cube.set(createQK([
                new FilterIncludeKey('_ROOT_', ['PEP']),
                new FilterIncludeKey('level-1', ['31-OCT-2021']),
                new FilterIncludeKey('level-2', ['COUNTRY'])
            ]), [3]);
            cube.set(createQK([
                new FilterIncludeKey('_ROOT_', ['PEP']),
                new FilterIncludeKey('level-1', ['30-SEP-2021']),
                new FilterIncludeKey('level-2', ['COUNTRY'])
            ]), [4]);

            component['enrichCube'](cube, chartConfig, defaultQueryKeys);
            const sbsc = cube.get(createQK([
                new FilterIncludeKey('_ROOT_', ['PEP']),
                new FilterIncludeKey('level-2', ['COUNTRY']),
                new GroupByKey('COUNTRY'),
                new GroupByKey('rfv_block_path'),
                new AggregationKey('rfv_contrib_port_4', 'sum')]))
                .subscribe(data => {
                    expect(data).toEqual([1, 3, 4]);
                });
            sbsc.unsubscribe();
        });

        it('should enrich data for leaf level, launched from lowest factor node (leaf level)', () => {
            component.customVizConfig = {
                showTotal: false,
                leafLevels: ['rfv_block_path'],
                seriesNameFieldOverride: 'rfv_ftitle'
            };
            component['leafNodeFilterKey'] = new FilterIncludeKey<string>('rfv_block_path', ['15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR']);
            const chartConfig: LineChartConfig = {
                measures: [{name: 'rfv_contrib_port_4', title: 'Risk Contribution', aggMethod: 'sum', chartType: ChartType.LINE}],
                groupBy: ['level-1', 'rfv_block_path'],
                breakdowns: ['level-1', 'rfv_block_path'],
            };
            const defaultQueryKeys = [
                new FilterIncludeKey('_ROOT_', ['PEP']),
                new FilterIncludeKey('level-2', ['COUNTRY'])
            ];

            cube.set(createQK([
                new FilterIncludeKey('_ROOT_', ['PEP']),
                new FilterIncludeKey('level-1', ['30-NOV-2021']),
                new FilterIncludeKey('level-2', ['COUNTRY'])
            ]), [
                {
                    'level-1': '30-NOV-2021',
                    'rfv_title': 'China Domestic',
                    'rfv_block_path': '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_CHINA'
                },
                {
                    'level-1': '30-NOV-2021',
                    'rfv_title': 'United Kingdom',
                    'rfv_block_path': '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR'
                }
            ]);
            cube.set(createQK([
                new FilterIncludeKey('_ROOT_', ['PEP']),
                new FilterIncludeKey('level-1', ['30-NOV-2021']),
                new FilterIncludeKey('level-2', ['STYLE'])
            ]), [
                {
                    'level-1': '30-NOV-2021',
                    'rfv_title': 'USA',
                    'rfv_block_path': '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_USA'
                },
                {
                    'level-1': '30-NOV-2021',
                    'rfv_title': 'United Kingdom',
                    'rfv_block_path': '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR'
                },
                {
                    'level-1': '30-NOV-2021',
                    'rfv_title': 'Germany',
                    'rfv_block_path': '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GER'
                }
            ]);
            cube.set(createQK([
                new FilterIncludeKey('_ROOT_', ['PEP']),
                new FilterIncludeKey('level-1', ['31-OCT-2021']),
                new FilterIncludeKey('level-2', ['COUNTRY'])
            ]), [
                {
                    'level-1': '31-OCT-2021',
                    'rfv_title': 'United Kingdom',
                    'rfv_block_path': '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR'
                },
                {
                    'level-1': '31-OCT-2021',
                    'rfv_title': 'Japan',
                    'rfv_block_path': '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_JPY'
                }
            ]);
            cube.set(createQK([
                new FilterIncludeKey('_ROOT_', ['PEP']),
                new FilterIncludeKey('level-1', ['30-SEP-2021']),
                new FilterIncludeKey('level-2', ['COUNTRY'])
            ]), [
                {
                    'level-1': '30-SEP-2021',
                    'rfv_title': 'USA',
                    'rfv_block_path': '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_USA'
                },
                {
                    'level-1': '30-SEP-2021',
                    'rfv_title': 'United Kingdom',
                    'rfv_block_path': '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR'
                }
            ]);

            component['enrichLeafLevel'](cube, chartConfig, defaultQueryKeys);
            const sbsc = cube.get(createQK([
                new FilterIncludeKey('_ROOT_', ['PEP']),
                new FilterIncludeKey('level-2', ['COUNTRY']),
                new GroupByKey('COUNTRY'),
                new GroupByKey('rfv_block_path'),
                new AggregationKey('rfv_contrib_port_4', 'sum')]))
                .subscribe(data => {
                    expect(data).toEqual([
                        {
                            'level-1': '30-NOV-2021',
                            'rfv_title': 'United Kingdom',
                            'rfv_block_path': '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR'
                        },
                        {
                            'level-1': '31-OCT-2021',
                            'rfv_title': 'United Kingdom',
                            'rfv_block_path': '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR'
                        },
                        {
                            'level-1': '30-SEP-2021',
                            'rfv_title': 'United Kingdom',
                            'rfv_block_path': '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR'
                        }
                    ]);
                    expect(component.nameOverrideMapping.size).toEqual(3);
                });
            sbsc.unsubscribe();
        });
    });

    it('overrides series name', () => {
        component.customVizConfig.seriesNameFieldOverride = undefined;
        // no overriding
        expect(component['overrideSeriesName']({name: 'Germany'})).toEqual('Germany');
        expect(component['overrideSeriesName']({name: 'complex series name'})).toEqual('complex series name');

        component.customVizConfig.seriesNameFieldOverride = 'rfv_ftitle';
        component.nameOverrideMapping.set('15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_USA', 'United States');
        component.nameOverrideMapping.set('15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR', 'United Kingdom');
        component.nameOverrideMapping.set('15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_JPY', 'Japan');

        // override
        expect(component['overrideSeriesName']({name: '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_JPY'})).toEqual('Japan');
        expect(component['overrideSeriesName']({name: '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR'})).toEqual('United Kingdom');
        expect(component['overrideSeriesName']({name: 'series name missing override'})).toEqual('series name missing override');
    });

    // write test case for getShortFormOfScale method
    it('should return short form of scale', () => {
        expect(component['getShortFormOfScale']('Thousands (m)')).toEqual('(m)');
        expect(component['getShortFormOfScale']('Millions (mm)')).toEqual('(mm)');
        expect(component['getShortFormOfScale']('Billions (mmm)')).toEqual('(mmm)');
        expect(component['getShortFormOfScale']('Percent (%)')).toEqual('(%)');
        expect(component['getShortFormOfScale']('Basis Point (bp)')).toEqual('(bp)');
    });

    // Test initChartMeasures method
    it('initChartMeasures', () => {
        const cols = [{columnKey: 'pct_mv_1', columnTitle: 'Market Value %', formatter: {format: () => ''}, dataType: 'DOUBLE', columnTag: 'pct_mv', isSubtotalable: true, isHidden: false, originalColumnTitle: ''},
            {columnKey: 'mv_1', columnTitle: 'Market Value', formatter: {format: () => ''}, dataType: 'DOUBLE', columnTag: 'mv', isSubtotalable: true, isHidden: false, originalColumnTitle: ''}];
        component.customVizConfig = {
            comboChartColumns: [
                new ComboChartColumn({colKey: 'pct_mv_1', chartType: ColumnSeriesChartType.LINE, secondaryAxis: true}),
                new ComboChartColumn({colKey: 'mv_1', chartType: ColumnSeriesChartType.BAR})
            ]
        };
        component['initChartMeasures'](cols);
        expect(component.chartMeasures).toEqual([
            {name: 'pct_mv_1', title: 'Market Value %', aggMethod: 'sum', 'axis': 1, chartType: ChartType.LINE},
            {name: 'mv_1', title: 'Market Value', aggMethod: 'sum', chartType: ChartType.COLUMN}
        ]);
    });

    it('initChartMeasures with TimeSeriesSetting.chartType = bar', () => {
        const cols = [{columnKey: 'pct_mv_1', columnTitle: 'Market Value %', formatter: {format: () => ''}, dataType: 'DOUBLE', columnTag: 'pct_mv', isSubtotalable: true, isHidden: false, originalColumnTitle: ''},
            {columnKey: 'mv_1', columnTitle: 'Market Value', formatter: {format: () => ''}, dataType: 'DOUBLE', columnTag: 'mv', isSubtotalable: true, isHidden: false, originalColumnTitle: ''}];
        component.customVizConfig = {
            comboChartColumns: []
        };
        const timeSeriesSettings = new TimeSeriesSettings();
        timeSeriesSettings.chartType = 'bar';
        component.widget.displayInputs.set(ChartWidgetInputConfigType.TIME_SERIES_CHART_SETTINGS, timeSeriesSettings);

        component['initChartMeasures'](cols);
        expect(component.chartMeasures).toEqual([
            {name: 'pct_mv_1', title: 'Market Value %', aggMethod: 'sum', chartType: ChartType.COLUMN},
            {name: 'mv_1', title: 'Market Value', aggMethod: 'sum', chartType: ChartType.COLUMN}
        ]);
    });

    it('initChartMeasures with TimeSeriesSetting.chartType = line', () => {
        const cols = [{columnKey: 'pct_mv_1', columnTitle: 'Market Value %', formatter: {format: () => ''}, dataType: 'DOUBLE', columnTag: 'pct_mv', isSubtotalable: true, isHidden: false, originalColumnTitle: ''},
            {columnKey: 'mv_1', columnTitle: 'Market Value', formatter: {format: () => ''}, dataType: 'DOUBLE', columnTag: 'mv', isSubtotalable: true, isHidden: false, originalColumnTitle: ''}];
        component.customVizConfig = {
            comboChartColumns: []
        };
        const timeSeriesSettings = new TimeSeriesSettings();
        timeSeriesSettings.chartType = 'line';
        component.widget.displayInputs.set(ChartWidgetInputConfigType.TIME_SERIES_CHART_SETTINGS, timeSeriesSettings);

        component['initChartMeasures'](cols);
        expect(component.chartMeasures).toEqual([
            {name: 'pct_mv_1', title: 'Market Value %', aggMethod: 'sum', chartType: ChartType.LINE},
            {name: 'mv_1', title: 'Market Value', aggMethod: 'sum', chartType: ChartType.LINE}
        ]);
    });

    it('initChartMeasures with TimeSeriesSetting.chartType = bar and secondaryAxisColumn', () => {
        const cols = [{columnKey: 'pct_mv_1', columnTitle: 'Market Value %', formatter: {format: () => ''}, dataType: 'DOUBLE', columnTag: 'pct_mv', isSubtotalable: true, isHidden: false, originalColumnTitle: ''},
            {columnKey: 'mv_1', columnTitle: 'Market Value', formatter: {format: () => ''}, dataType: 'DOUBLE', columnTag: 'mv', isSubtotalable: true, isHidden: false, originalColumnTitle: ''}];

        // represents secondaryAxisColumn after it is deserialized
        component.customVizConfig = {
            comboChartColumns: [new ComboChartColumn({colKey: 'pct_mv_1', chartType: undefined, secondaryAxis: true})]
        };
        const timeSeriesSettings = new TimeSeriesSettings();
        timeSeriesSettings.chartType = 'bar';
        component.widget.displayInputs.set(ChartWidgetInputConfigType.TIME_SERIES_CHART_SETTINGS, timeSeriesSettings);

        component['initChartMeasures'](cols);
        expect(component.chartMeasures).toEqual([
            {name: 'pct_mv_1', title: 'Market Value %', aggMethod: 'sum', chartType: ChartType.COLUMN, axis: 1},
            {name: 'mv_1', title: 'Market Value', aggMethod: 'sum', chartType: ChartType.COLUMN}
        ]);
    });

    describe('getComboChartLineStyleCss', () => {
        it('should apply custom-stroke-dashed class for dashed line style', () => {
            const comboChartColumn: ComboChartColumn = new ComboChartColumn({chartType: ColumnSeriesChartType.LINE, lineStyle: LineChartStyle.DASHED});

            const cssClass = component['getComboChartLineStyleCss'](comboChartColumn);

            expect(cssClass).toBe('custom-stroke-dashed');
        });

        it('should apply custom-stroke-dotted class for dotted line style', () => {
            const comboChartColumn: ComboChartColumn = new ComboChartColumn({chartType: ColumnSeriesChartType.LINE, lineStyle: LineChartStyle.DOTTED});

            const cssClass = component['getComboChartLineStyleCss'](comboChartColumn);

            expect(cssClass).toBe('custom-stroke-dotted');
        });

        it('should not apply any class for solid line style', () => {
            const comboChartColumn: ComboChartColumn = new ComboChartColumn({chartType: ColumnSeriesChartType.LINE, lineStyle: LineChartStyle.SOLID});

            const cssClass = component['getComboChartLineStyleCss'](comboChartColumn);

            expect(cssClass).toBeUndefined();
        });

        it('should not apply any class if measure is not a line chart', () => {
            const comboChartColumn: ComboChartColumn = new ComboChartColumn({chartType: ColumnSeriesChartType.BAR, lineStyle: LineChartStyle.DASHED});

            const cssClass = component['getComboChartLineStyleCss'](comboChartColumn);

            expect(cssClass).toBeUndefined();
        });
    });

});
