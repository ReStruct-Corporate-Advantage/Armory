/**
 * Numeric Column Format for column definitions
 */
import {ColumnFormat} from './column-format.model';

export class NumericColumnFormat extends ColumnFormat {
    static CONFIG_TYPE = 'numericColumnFormat';

    decimalPlaces: number;
    isUseThousandsSeparator: boolean;
    isScalable: boolean;
    scalingOptions: Map<string, number> = new Map<string, number>();
    scalingFactor: number;

    /**
     * Constructor
     */
    constructor(data?: any) {
        super(data);
    }

    /**
     * Deserialize json into this object
     */
    doDeserialize(data: any) {
        this.decimalPlaces = data.decimalPlaces;
        this.isUseThousandsSeparator = data.useThousandsSeparator;
        this.isScalable = data.scalable;
        if (data.scalingOptions) {
            for (const k of Object.keys(data.scalingOptions)) {
                this.scalingOptions.set(k, data.scalingOptions[k]);
            }
        }
        this.scalingFactor = data.scalingFactor;
    }

    /**
     * ColumnFormat.getConfigType()
     */
    getConfigType(): string {
        return NumericColumnFormat.CONFIG_TYPE;
    }
}
