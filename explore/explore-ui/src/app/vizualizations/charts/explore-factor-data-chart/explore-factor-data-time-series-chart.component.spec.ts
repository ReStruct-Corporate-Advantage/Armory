import {SimpleChange, SimpleChanges, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {NumericColumnFormat, WidgetConfigType} from '@blk/explore-ui-core';
import {data6} from '@mocks/test-data/qbstr-test-data';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {ReactiveCube} from '@qbstr/data-cube-reactive';
import {ROOT_LEVEL} from '@utils/qbstr';
import {TestUtils} from '@utils/test.utils';
import Highcharts from 'highcharts';
import * as hcCore from '@qbstr/highcharts-core';
import {ExploreFactorDataTimeSeriesChartComponent} from './explore-factor-data-time-series-chart.component';
import {DateFormat} from '@models/column-formats/date-format.model';
import {DateDataFormatter} from '@models/data-formatters/date-data.formatter';
import {NumericDataFormatter} from '@blk/explore-ui-column-option';


describe('ExploreFactorDataTimeSeriesChartComponent', () => {
    let component: ExploreFactorDataTimeSeriesChartComponent;
    let fixture: ComponentFixture<ExploreFactorDataTimeSeriesChartComponent>;
    let widgetPayload: WidgetPayload;

    const setupHighchartsSpy = jest.spyOn(hcCore, 'setupHighcharts');
    const generateOptionsSpy = jest.spyOn(hcCore, 'generateOptions');

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        const colFormat = new NumericColumnFormat();
        colFormat.decimalPlaces = 9;
        colFormat.scalingFactor = 1;
        colFormat.isScalable = true;

        const dateFormat = new DateFormat();
        dateFormat.value = 'dd-MMM-yyyy';

        const request = {
            portfolio: 'E_TEA',
            columns: [
                {
                    columnKey: 'date',
                    columnTitle: 'Date',
                    formatter: new DateDataFormatter(dateFormat, []),
                    dataType: 'DATE',
                    columnTag: 'date',
                    isHidden: false,
                    isSubtotalable: false,
                    originalColumnTitle: 'Date'
                },
                {
                    columnKey: 'USD_3m_key',
                    columnTitle: 'Tsy 3M',
                    formatter: new NumericDataFormatter(colFormat, []),
                    dataType: 'DOUBLE',
                    columnTag: 'USD_3m',
                    isHidden: false,
                    isSubtotalable: true,
                    originalColumnTitle: 'USD_3m'
                },
                {
                    columnKey: 'CAD_3m_key',
                    columnTitle: 'CAD 3M',
                    formatter: new NumericDataFormatter(colFormat, []),
                    dataType: 'DOUBLE',
                    columnTag: 'CAD_3m',
                    isHidden: false,
                    isSubtotalable: true,
                    originalColumnTitle: 'CAD_3m'
                },
            ]
        };

        widgetPayload = {widgetConfigType: WidgetConfigType.FACTOR_DATA};
        widgetPayload.requestConfig = request;
        widgetPayload.responseConfig = data6.data as any;
        widgetPayload.cube = new ReactiveCube<any>([]);
        widgetPayload.breakdownLevels = [ROOT_LEVEL];
        widgetPayload.customVizConfig = {
            isTimeSeriesMode: true,
            factorTimeSeriesSelectedOption: 'VOLATILITIES'
        };
        const colMap = {};
        request.columns.forEach(col => colMap[col.columnKey] = col);

        TestBed.configureTestingModule({
            declarations: [ExploreFactorDataTimeSeriesChartComponent],
            imports: [AladdinAngularComponentsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExploreFactorDataTimeSeriesChartComponent);
        component = fixture.componentInstance;
        component.widgetPayload = widgetPayload;

        setupHighchartsSpy.mockImplementation(() => component.hc);
        generateOptionsSpy.mockImplementation(() => Highcharts.getOptions());

        component.widget = new Widget(WidgetConfigType.FACTOR_DATA);
        component['setInternalState'](widgetPayload);
        component['colsMap'] = colMap;
        const simpleChanges: SimpleChanges = {
            widget: new SimpleChange(undefined, new Widget(WidgetConfigType.FACTOR_DATA), true),
            widgetPayload: new SimpleChange(undefined, widgetPayload, true)
        };
        component.ngOnChanges(simpleChanges);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('creates chart config', () => {
        const measures = [
            {name: 'USD_3m_key', title: 'Tsy 3M', aggMethod: 'sum'},
            {name: 'CAD_3m_key', title: 'CAD 3M', aggMethod: 'sum'}
        ];
        expect(component.createChartConfig(measures)).toEqual({
            'drillDown': undefined,
            'groupBy': [
                'date',
            ],
            'measures': [
                {
                    'aggMethod': 'sum',
                    'name': 'USD_3m_key',
                    'title': 'Tsy 3M',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'CAD_3m_key',
                    'title': 'CAD 3M',
                },
            ],
            'stacked': undefined,
        });
    });

    it('creates chart options', () => {
        const config = component.createChartConfig([{name: 'USD_3m_key', title: 'Tsy 3M', aggMethod: 'sum'}, {name: 'CAD_3m_key', title: 'CAD 3M', aggMethod: 'sum'}]);
        expect(component.createChartOptions(config)).toMatchObject({
            'chart': {
                'animation': false,
                'events': {
                },
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
                'line': {
                    'marker': {
                        'enabled': null,
                    },
                },
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
                'gridLineWidth': 0,
                'labels': {
                },
            },
            'yAxis': {
                'labels': {
                },
                'title': {
                    'text': '',
                },
            },
        });
    });

    it('test yAxis value in Percentage compare mode', () => {
        component.customVizConfig.compareModeToggle = true;
        component.customVizConfig.compareMode = 'percent';
        component.chartMeasures = [{name: 'USD_3m_key', title: 'Tsy 3M', aggMethod: 'sum'}];

        const config = component.createChartConfig([{name: 'USD_3m_key', title: 'Tsy 3M', aggMethod: 'sum'}]);
        const options = component.createChartOptions(config);

        const yAxisPoint = { value: 10, formatter: options.yAxis['labels'].formatter };
        expect(yAxisPoint.formatter()).toEqual('10.000000000%');
    });

    it('test format tooltip point', () => {
        const point = {
            name: '27-OCT-2022',
            category: '27-OCT-2022',
            qbstr: {
                measureName: 'USD_3m_key'
            },
            y: 124.96887187908764
        } as any;
        expect(component.tooltipPointFormatter(point)).toMatchSnapshot();
    });

    describe('Test seriesLabelFormatter method', () => {
        let series;
        it('should format the legend labels for factor data time series chart', () => {
            series = {
                name: 'Tsy 3M'
            } as any;

            expect(component.seriesLabelFormatter(series)).toEqual('Tsy 3M');
        });
    });
});
