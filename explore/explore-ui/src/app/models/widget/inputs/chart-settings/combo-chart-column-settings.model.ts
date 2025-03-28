import {AbstractConfig, ChartWidgetInputConfigType, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isEmpty, isNil, isObject, isString, isUndefined} from 'lodash';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';

export class ComboChartColumnSettings extends AbstractConfig implements WidgetInput {

    columns: ComboChartColumn[];

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    getConfigType() {
        return ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS;
    }

    /**
     * Deserialize the passed in data into properties of this object
     */
    deserialize(data: any): void {
        if (isNil(data) || isEmpty(data)) {
            this.columns = [];
        } else if (data.columns) {
            this.columns = data.columns.map(column => new ComboChartColumn(column));
        } else {
            // for old favorites secondaryAxisColumn is stored inside data.data and
            // for new it will be inside data.secondaryAxisColumn else it will be data only
            if (data.data || ((isString(data.secondaryAxisColumn) && !isEmpty(data.secondaryAxisColumn)) || !isNil(data.secondaryAxisColumn?.data))) {
                const secondaryAxisColumn = isUndefined(data.data) ? this.getSecondaryAxisColumn(data) : data.data;
                this.columns = [new ComboChartColumn({colKey: secondaryAxisColumn, secondaryAxis: true})];
            } else {
                this.columns = [];
            }
        }
    }

    private getSecondaryAxisColumn(data: any) {
        return data.secondaryAxisColumn.data ? data.secondaryAxisColumn.data : data.secondaryAxisColumn;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize this object properties into a plain javascript style object
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            columns: this.columns.map(column => column.serialize())
        };
        data.configType = ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS;
        return data;
    }

    /**
     * Return true if the passed in widgetInput is equal to this sorted-columns
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof ComboChartColumnSettings)) {
            return false;
        }

        if (!widgetInput.columns && !this.columns) {
            return true;
        }

        if (widgetInput.columns.length !== this.columns.length) {
            return false;
        }

        return !widgetInput.columns.some((column, index) => {
            return !column.equals(this.columns[index]);
        });
    }

    /**
     * @return true as it's a data store input
     */
    isDataStoreInput(): boolean {
        return false;
    }

    getTrackableProperties(): any {
        return {
            columns: this.columns.map(column => column.colKey),
            barColumns: this.columns.filter(column => column.chartType === ColumnSeriesChartType.BAR).map(column => column.colKey),
            lineColumns: this.columns.filter(column => column.chartType === ColumnSeriesChartType.LINE).map(column => column.colKey),
            secondaryAxisColumn: this.columns.filter(column => !!column.secondaryAxis).map(column => column.colKey)
        };
    }
}
