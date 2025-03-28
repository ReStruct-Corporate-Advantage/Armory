import {AbstractConfig, WidgetInput} from '@blk/explore-ui-core';

/**
 * Legend and label settings model
 *
 * This model is used with below configTypes:
 *      WidgetDisplayInputConfigType.CHART_SETTINGS
 */
export class ChartSettings extends AbstractConfig implements WidgetInput {

    static readonly CHART_SETTINGS = 'chartSettings';
    /**
     * Label show toggle
     */
    labelShow = true;

    /**
     * Legend show toggle
     */
    legendShow = true;

    /**
     * Constructor to create an instance of legend and label settings
     */
    constructor() {
        super();
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Parse information stored in object properties
     * @param data object properties
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }
        let dataToUse = data;
        if (data.chartSettings) {
            dataToUse = data.chartSettings;
        }
        if (typeof dataToUse.labelShow !== 'undefined') {
            this.labelShow = dataToUse.labelShow;
        }
        if (typeof dataToUse.legendShow !== 'undefined') {
            this.legendShow = dataToUse.legendShow;
        }
    }

    /**
     * Convert object property into javascript object to be saved
     */
    serialize(): any {
        return {
            labelShow: this.labelShow,
            legendShow: this.legendShow
        };
    }

    /**
     * @return false as it's not data store input
     */
    isDataStoreInput(): boolean {
        return false;
    }

    /**
     * @returns config type.
     */
    static get configType(): string {
        return ChartSettings.CHART_SETTINGS;
    }

    /**
     * comparing items of ChartSettings
     */
    equals(data: AbstractConfig): boolean {
        return data instanceof ChartSettings ? ( this.labelShow === data.labelShow &&  this.legendShow === data.legendShow ) : false;
    }
}
