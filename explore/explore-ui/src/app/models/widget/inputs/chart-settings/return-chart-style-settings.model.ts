import {AppUtils} from '@utils/index';
import {
    AbstractConfig,
    ChartWidgetInputConfigType,
    DateFormatConstants,
    SerializeFavoriteType,
    WidgetInput
} from '@blk/explore-ui-core';

/**
 * Model class for the ReturnChartStyleSettingsModel widget input
 *
 * This model is used with below configTypes:
 *      ChartWidgetInputConfigType.RETURN_CHART_STYLE_SETTINGS
 */
export class ReturnChartStyleSettingsModel extends AbstractConfig implements WidgetInput {

    /**
     * Model fields
     */
    showActive: boolean;
    showPortfolio: boolean;
    showBenchmark: boolean;
    showActiveCumulative: boolean;
    showPortfolioCumulative: boolean;
    showBenchmarkCumulative: boolean;
    showBaseline: boolean;
    dateFormat: string = DateFormatConstants.ALADDIN_DATE_FORMAT_NAME;
    showDataMarker = true;

    constructor(data?: any) {
        super();
        if (AppUtils.isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize fields that populate to model fields
     * @see AbstractConfig.deserialize
     */
    deserialize(data: any): void {
        if (data) {
            this.showActive = data.showActive;
            this.showPortfolio = data.showPortfolio;
            this.showBenchmark = data.showBenchmark;
            this.showActiveCumulative = data.showActiveCumulative;
            this.showPortfolioCumulative = data.showPortfolioCumulative;
            this.showBenchmarkCumulative = data.showBenchmarkCumulative;
            this.showBaseline = data.showBaseline;
            this.showDataMarker = data.showDataMarker === undefined || data.showDataMarker;
            if (data.dateFormat) {
                this.dateFormat = data.dateFormat;
            }
        }
    }

    /**
     * return true if both object fields are same
     * @see WidgetInput.equals
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof ReturnChartStyleSettingsModel)) {
            return false;
        }
        if (this.showActive !== widgetInput.showActive) {
            return false;
        }
        if (this.showPortfolio !== widgetInput.showPortfolio) {
            return false;
        }
        if (this.showBenchmark !== widgetInput.showBenchmark) {
            return false;
        }
        if (this.showActiveCumulative !== widgetInput.showActiveCumulative) {
            return false;
        }
        if (this.showPortfolioCumulative !== widgetInput.showPortfolioCumulative) {
            return false;
        }
        if (this.showBenchmarkCumulative !== widgetInput.showBenchmarkCumulative) {
            return false;
        }
        if (this.showBaseline !== widgetInput.showBaseline) {
            return false;
        }
        if (this.showDataMarker !== widgetInput.showDataMarker) {
            return false;
        }
        return this.dateFormat === widgetInput.dateFormat;
    }

    /**
     * @return true
     * @see WidgetInput.isDataStoreInput
     */
    isDataStoreInput(): boolean {
        return true;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serializes the input
     * @see AbstractConfig.serialize
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            showActive: this.showActive,
            showPortfolio: this.showPortfolio,
            showBenchmark: this.showBenchmark,
            showActiveCumulative: this.showActiveCumulative,
            showBenchmarkCumulative: this.showBenchmarkCumulative,
            showPortfolioCumulative: this.showPortfolioCumulative,
            showBaseline: this.showBaseline,
            dateFormat: this.dateFormat,
            configType: ChartWidgetInputConfigType.RETURN_CHART_STYLE_SETTINGS,
            showDataMarker: this.showDataMarker
        };
    }
}
