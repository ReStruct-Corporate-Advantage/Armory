import {Component, ViewEncapsulation} from '@angular/core';
import {FactorBarCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {createQK, FilterIncludeKey, GroupByKey, QueryKeyEntry} from '@qbstr/data-cube';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {BarChartConfig, ChartMeasure, ChartType} from '@qbstr/highcharts-api';
import {dropRight, first, head, isEmpty, isNil, last, merge, partition} from 'lodash';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ExploreBaseBarChartDirective} from '../explore-base-bar-chart.directive';
import {ChartUtils} from '@utils/chart.utils';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {CommonConstants} from '@constants/common.constants';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {ColumnConstants, WidgetConfigType, WidgetDisplayInputConfigType} from '@blk/explore-ui-core';
import {Options} from 'highcharts';
import {BarChartSettings} from '@models/widget/inputs/chart-settings/bar-chart-settings.model';

/**
 * Explore Factor Bar chart displays factor bar and factor stacked bar charts
 */
@Component({
    selector: 'app-explore-factor-bar-chart',
    templateUrl: '../explore-chart.component.html',
    styleUrls: ['./explore-factor-bar-chart.component.scss', '../explore-chart.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ExploreFactorBarChartComponent extends ExploreBaseBarChartDirective<FactorBarCustomVizConfig> {

    /**
     * For FBA Bar chart, we display marker by configuring it as {chartType: 'line', cssStyleClass: 'lineChart'}
     *  to display it in black when selecting the "Marker" option.
     */
    protected getChartMeasureCssStyleClass(comboChartColumn: ComboChartColumn): string {
        return comboChartColumn?.chartType === ColumnSeriesChartType.LINE ? 'lineChart' : undefined;
    }

    /**
     * createChartConfig
     */
    protected createChartConfig(measures: ChartMeasure<any>[]): BarChartConfig<any> {
        const measuresPartition = this.getMeasuresPartition(measures);
        const breakdownLevels = this.enrichBreakdownLevels();

        return merge({},
            super.createChartConfig(measures),
            {
                groupBy: this.getGroupBys(breakdownLevels),
                widgetType: this.widget.configType,
                measuresAsSeries: measuresPartition.length > 1 ? measuresPartition[1] : undefined,
                flattenedRow: (ChartUtils.isFactorGraphingBarSpritelet(this.widget.configType) || ChartUtils.isPGSGraphingSpritelet(this.widget.configType)) && breakdownLevels.length > 0 ? breakdownLevels[breakdownLevels.length - 1] : undefined,
            });
    }

    protected createChartOptions(chartConfig: BarChartConfig<any>): Options {
        this.customVizConfig.showTotal = this.widget.displayInputs.get(WidgetDisplayInputConfigType.CHART) ? (this.widget.displayInputs.get(WidgetDisplayInputConfigType.CHART) as BarChartSettings).includeTotalValues : undefined;
        const chartOptions = super.createChartOptions(chartConfig);
        // assign total formatter if applicable
        this.assignTotalFormatter(chartOptions, WidgetConfigType.PRA, true);
        return chartOptions;
    }

    /**
     * During createChartConfig process getGroupBys with given breakdownLevels
     */
    protected getGroupBys(breakdownLevels: string[]): string[] {
        return this.customVizConfig.groupBys ?? super.getGroupBys(breakdownLevels);
    }

    /**
     * During createChartConfig process getMeasuresPartition for given measures
     */
    private getMeasuresPartition(measures: ChartMeasure<any>[]): any[] {
        return this.customVizConfig.selectedAsMeasureSeries
            ? partition(measures, measure => measure.chartType !== ChartType.LINE)
            : [measures];
    }

    /**
     * During createChartConfig process getMeasuresAsCols for given measures
     */
    protected getMeasuresAsCols(measures: ChartMeasure<any>[]): ChartMeasure<any>[] {
        return head(this.getMeasuresPartition(measures));
    }

    protected getCubeSelectedEnrichDataSet(cube: SimpleCube<any>, chartConfig: BarChartConfig<any>, defaultQueryKeyEntries: QueryKeyEntry[], measureKeys: QueryKeyEntry[]): Observable<any[]> {
        const groupByQueryKey = last(defaultQueryKeyEntries);

        const defaultQueryKey = dropRight(defaultQueryKeyEntries);
        const groupByKey = new GroupByKey(groupByQueryKey.field);

        return cube.getSimilarIfPresent(createQK([...defaultQueryKey, ...measureKeys, groupByKey])).pipe(
            filter(data => !isNil(data)),
            map((data: any[]) => data.filter(dataItem => dataItem[groupByQueryKey.field] === first((groupByQueryKey as FilterIncludeKey<string>).includes))),
            map((data: any[]) => data.map(dataItem => ({
                ...dataItem,
                forMeasureSeriesOnly: true,
                chartType: this.customVizConfig.selectedChartType,
                chartCssClass: this.customVizConfig.selectedChartType === ChartType.LINE ? 'lineChart' : undefined,
                [chartConfig.stacked]: dataItem[groupByQueryKey.field]
            })))
        );
    }

    /**
     * Enrich cube for PGS stacked bar chart
     * @param chartConfig
     * @param cube
     * @param defaultQueryKeyEntries
     * @param measureKeys
     * @param columnNames
     * @private
     */
    protected enrichCubeForPgsStackedBarChart(chartConfig: BarChartConfig<any>, cube: SimpleCube<any>, defaultQueryKeyEntries: QueryKeyEntry[], measureKeys: QueryKeyEntry[], columnNames: Map<string, string>) {
        if (ChartUtils.isPGSGraphingSpritelet(this.chartConfig.widgetType) && chartConfig.stacked) {
            // get all filter keys and group by keys present in manually defined defaultQueryKeyEntries
            const customFilterKeys: FilterIncludeKey<any>[] = defaultQueryKeyEntries.filter(qk => qk instanceof FilterIncludeKey) as FilterIncludeKey<any>[];
            const customGroupKeys: GroupByKey[] = defaultQueryKeyEntries.filter(qk => qk instanceof GroupByKey) as GroupByKey[];
            // get queryKey corresponding to defaultQueryEntries - it will be missing additional groupBy key for stacked bar chart
            const queryKey = cube.keys().find(ck =>
                (isEmpty(customGroupKeys) || ck.groupKeys().find(gk => gk.isEqual(customGroupKeys[0])))
                && (ck.filterKeys().length === customFilterKeys.length && ck.filterKeys()
                    .every(fk => customFilterKeys.some(cfk => cfk.isEqual(fk)))));
            const modifiedData = [];
            let levels: { minLevel: number; maxLevel: number } | {} = {
                minLevel: Number.MAX_SAFE_INTEGER,
                maxLevel: 0
            };
            // get data from cube for the queryKey and enrich the data to be of the required format for stacked bar chart
            cube.getSimilarIfPresent(queryKey).subscribe(data => {
                if (!isEmpty(data)) {
                    data.forEach(rowData => {
                        levels = this.modifyCubeData(rowData, modifiedData, columnNames, this.breakdownLevels.includes(ColumnConstants.PORTFOLIO) ? this.breakdownLevels.slice(-2)[0] : this.breakdownLevels.slice(-1)[0], levels);
                    });
                }
                if (this.widget.pgsChartInputs.actionKey === TabularWidgetConstants.PGS_LEAF_BAR_CHART_SPRITELET.ACTION_KEY.toString()) {
                    for (let i = levels['maxLevel']; i >= levels['minLevel']; i--) {
                        chartConfig.groupBy.unshift('level-' + i);
                    }
                }
                    // set values for the new queryKey which will be used in stacked pgs bar chart to the cube
                cube.set(createQK([...defaultQueryKeyEntries, ...measureKeys, ...queryKey.groupKeys(), new GroupByKey(chartConfig.stacked)]), modifiedData);
            });
        }
    }

    /**
     * Modify cube data to create individual entries for split column breakdowns for stacked bar chart
     * @param rowData
     * @param modifiedData
     * @param columnNames
     * @param groupBy
     * @param levels
     * @private
     */
    protected modifyCubeData(rowData: any, modifiedData: any[], columnNames: Map<string, string>, groupBy: string, levels: any) {
        const columnKeys = Object.keys(rowData).filter(columnKey => columnNames.has(columnKey.split('|')[0]));
        if (this.widget.pgsChartInputs.actionKey === TabularWidgetConstants.PGS_LEAF_BAR_CHART_SPRITELET.ACTION_KEY.toString()) {
            modifiedData.push(rowData);
            const levelKeys = Object.keys(rowData).filter(key => key.includes('level')).map(level => Number(level.split('-')[1]));
            const portfolioLevel = rowData['level-' + levelKeys[levelKeys.length - 1]] === rowData['level-' + levelKeys[levelKeys.length - 2]] ? levelKeys[levelKeys.length - 3] : levelKeys[levelKeys.length - 2];
            return {
                minLevel: Math.min(levels.minLevel, portfolioLevel),
                maxLevel: Math.max(levels.maxLevel, levelKeys[levelKeys.length - 1])
            };
        }
        columnKeys.forEach(columnKey => {
            // Skip 'Total' column as it is where the modified data will reside in newly created rows
            if (columnKey.split(CommonConstants.COLUMN_KEY_SPLITTER)[1] === 'Total') {
                return;
            }
            // modify value for columnKey and create new object along with other older values
            modifiedData.push({
                ...rowData,
                [columnNames.get(columnKey.split(CommonConstants.COLUMN_KEY_SPLITTER)[0])]: rowData[columnKey],
                [groupBy]: columnKey.split(CommonConstants.COLUMN_KEY_SPLITTER)[1]
            });
        });
        return {};
    }
}
