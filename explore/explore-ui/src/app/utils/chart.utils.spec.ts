import {ChartUtils} from './chart.utils';
import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';
import {decidesChartingLib} from '@interfaces/decides-charting-lib.interface';
import {DateFormatConstants, WidgetConfigType, WidgetInput} from '@blk/explore-ui-core';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {ChartMeasure, ChartType} from '@qbstr/highcharts-api';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';

/**
 * Test class for the chart utils
 */
describe('ChartUtils tests', function () {

    beforeEach((done) => {
        TestUtils.initialize(done);
    });

    describe('Test isChartWidget method', function () {
        it('should return true if configType is of chart widget', function () {
            let widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            expect(ChartUtils.isChartWidget(widget)).toBe(false);
            widget = new Widget(WidgetConfigType.TIME_SERIES);
            expect(ChartUtils.isChartWidget(widget)).toBe(true);
            widget = new Widget(WidgetConfigType.EXPOST_TIME_SERIES);
            widget.getCombinedInputs().forEach((widgetInput: WidgetInput) => {
                if (decidesChartingLib(widgetInput)) {
                    widgetInput.toggleChartingLib();
                }
            });
            expect(ChartUtils.isChartWidget(widget)).toBe(true);
        });
    });

    describe('Test xAxisDateLabelFormatter method', function () {
        it('should format x-axis date labels', () => {
            let formattedLabel = ChartUtils.xAxisDateLabelFormatter('25-FEB-2019', 'M/d');
            expect(formattedLabel).toEqual('2/25');

            // try with a different format
            formattedLabel = ChartUtils.xAxisDateLabelFormatter('25-FEB-2019', 'EEEE, MMMM d, yyyy');
            expect(formattedLabel).toEqual('Monday, February 25, 2019');

            formattedLabel = ChartUtils.xAxisDateLabelFormatter('25-FEB-2019', DateFormatConstants.ALADDIN_DATE_FORMAT_NAME);
            expect(formattedLabel).toEqual('25-FEB-2019');

            formattedLabel = ChartUtils.xAxisDateLabelFormatter('25-FEB-2019', undefined);
            expect(formattedLabel).toEqual('25-FEB-2019');
        });
    });

    it('Test isFactorGraphingBarSpritelet', () => {
        expect(ChartUtils.isFactorGraphingBarSpritelet(WidgetConfigType.FACTOR_GRAPHING_BAR_CHART)).toBeTruthy();
        expect(ChartUtils.isFactorGraphingBarSpritelet(WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART)).toBeTruthy();
        expect(ChartUtils.isFactorGraphingBarSpritelet(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART)).toBeFalsy();
    });

    it('Test isFactorGraphingSpritelet', () => {
        expect(ChartUtils.isFactorGraphingSpritelet(WidgetConfigType.FACTOR_GRAPHING_BAR_CHART)).toBeTruthy();
        expect(ChartUtils.isFactorGraphingSpritelet(WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART)).toBeTruthy();
        expect(ChartUtils.isFactorGraphingSpritelet(WidgetConfigType.FACTOR_GRAPHING_PIE_CHART)).toBeTruthy();
        expect(ChartUtils.isFactorGraphingSpritelet(WidgetConfigType.FACTOR_SECURITY_CONTRIBUTION)).toBeFalsy();
    });

    // Test getColumnMeasureAxisCode
    it('Test getColumnMeasureAxisCode', () => {
        let column = new ComboChartColumn({colKey: 'mkt_val', secondaryAxis: true});
        const chartMeasure = {name: 'mkt_val'} as ChartMeasure<any>;
        expect(ChartUtils.getColumnMeasureAxisCode([column], chartMeasure)).toEqual(1);
        column = new ComboChartColumn({colKey: 'mkt_val', secondaryAxis: false});
        expect(ChartUtils.getColumnMeasureAxisCode([column], chartMeasure)).toBeUndefined();
        chartMeasure.name = 'mkt_val2';
        expect(ChartUtils.getColumnMeasureAxisCode([column], chartMeasure)).toBeUndefined();
    });

    it('test applyComboChartSettingsToChartMeasure', () => {
        let column = new ComboChartColumn({colKey: 'mkt_val', secondaryAxis: true, chartType: ColumnSeriesChartType.BAR});
        let chartMeasure = {name: 'mkt_val'} as ChartMeasure<any>;
        ChartUtils.applyComboChartSettingsOrDefault(column, chartMeasure, WidgetConfigType.BAR);
        expect(chartMeasure.axis).toEqual(1);
        expect(chartMeasure.chartType).toEqual(ChartType.COLUMN);

        column = new ComboChartColumn({colKey: 'mkt_val', secondaryAxis: false, chartType: ColumnSeriesChartType.LINE});
        chartMeasure = {name: 'mkt_val'} as ChartMeasure<any>;
        ChartUtils.applyComboChartSettingsOrDefault(column, chartMeasure, WidgetConfigType.TIME_SERIES);
        expect(chartMeasure.axis).toBeUndefined();
        expect(chartMeasure.chartType).toEqual(ChartType.LINE);
    });

    it('should test setZIndexForComboChart', () => {
        const series: any = [
            {
                name: 'pct_mv',
                type: 'scatter'
            }, {
                name: 'bench_pct_mv',
                type: 'column'
            }, {
                name: 'active_pct_mv',
                type: 'line'
            }
        ];
        ChartUtils.setZIndexForComboChart(series);
        expect(series[0].zIndex).toEqual(9);
        expect(series[1].zIndex).toEqual(1);
        expect(series[2].zIndex).toEqual(5);
    });
});
