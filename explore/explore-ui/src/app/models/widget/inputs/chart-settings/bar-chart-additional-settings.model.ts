import {isObject} from 'lodash';
import {ChartMarkerSymbol, ChartType} from '@qbstr/highcharts-api';
import {AbstractConfig, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';

/**
 * Model class for the BarChartAdditionalSettings widget input
 */
export class BarChartAdditionalSettings extends AbstractConfig implements WidgetInput {
    isStacked: boolean;
    stackByImmediateChild: boolean;
    showSelected: boolean;
    selectedAsMeasureSeries: boolean;
    selectedChartType: ChartType.COLUMN | ChartType.LINE;
    selectedChartMarkerSymbol: ChartMarkerSymbol;

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return 'barChartAdditionalSettings';
    }

    getConfigType(): string {
        return BarChartAdditionalSettings.configType;
    }

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * true as its data store input
     */
    isDataStoreInput(): boolean {
        return true;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize the input
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            isStacked: this.isStacked,
            stackByImmediateChild: this.stackByImmediateChild,
            showSelected: this.showSelected,
            selectedAsMeasureSeries: this.selectedAsMeasureSeries,
            selectedChartType: this.selectedChartType,
            selectedChartMarkerSymbol: this.selectedChartMarkerSymbol
        };
    }

    /**
     * Deserialize the input
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        this.isStacked = data.isStacked;
        this.stackByImmediateChild = data.stackByImmediateChild;
        this.showSelected = data.showSelected;
        this.selectedAsMeasureSeries = data.selectedAsMeasureSeries;
        this.selectedChartType = data.selectedChartType;
        this.selectedChartMarkerSymbol = data.selectedChartMarkerSymbol;
    }

    /**
     * Check equality of this and the BarChartSettings passed in
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof BarChartAdditionalSettings)) {
            return false;
        }

        return this.isStacked === widgetInput.isStacked
            && this.stackByImmediateChild === widgetInput.stackByImmediateChild
            && this.showSelected === widgetInput.showSelected
            && this.selectedAsMeasureSeries === widgetInput.selectedAsMeasureSeries
            && this.selectedChartType === widgetInput.selectedChartType
            && this.selectedChartMarkerSymbol === widgetInput.selectedChartMarkerSymbol;
    }
}
