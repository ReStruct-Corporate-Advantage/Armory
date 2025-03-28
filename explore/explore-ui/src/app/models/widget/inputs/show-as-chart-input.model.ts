import {AppUtils} from '@utils/app.utils';
import {DecidesChartingLib} from '@interfaces/decides-charting-lib.interface';
import {AbstractConfig, CoreWidgetConstants, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';

/**
 * Input model for the show as chart toggle for return spritelets
 */
export class ShowAsChartInput extends AbstractConfig implements WidgetInput, DecidesChartingLib {
    showAsChart: boolean;

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return 'showAsChartInput';
    }

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (AppUtils.isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * WidgetInput.isDataStoreInput()
     */
    isDataStoreInput(): boolean {
        return true;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * WidgetInput.serialize(boolean)
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            showAsChart: this.showAsChart
        };
    }

    /**
     * WidgetInput.deserialize(any)
     */
    deserialize(data: any): void {
        this.showAsChart = data.showAsChart;
    }

    /**
     * WidgetInput.equals(WidgetInput)
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof ShowAsChartInput)) {
            return false;
        }
        return (this.showAsChart === widgetInput.showAsChart);
    }

    /**
     * DecidesChartingLib.getChartingLib()
     */
    getChartingLib(): string {
        return this.showAsChart ? CoreWidgetConstants.CHARTING_LIB.HIGHCHART : CoreWidgetConstants.CHARTING_LIB.AG_GRID;
    }

    /**
     * DecidesChartingLib.toggleChartingLib()
     */
    toggleChartingLib(): void {
        this.showAsChart = !this.showAsChart;
    }
}
