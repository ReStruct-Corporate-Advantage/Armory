import {AbstractConfig, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {AppUtils} from '@utils/app.utils';

/**
 * Input model for factor block parameters for security contribution spritelet
 */
export class FactorBlockInput extends AbstractConfig implements WidgetInput {
    static readonly CONFIG_TYPE = 'factorBlock';

    // flag indicating if it's a factor block
    isBlock: boolean;
    // factor breakdown path from _ROOT_, set via rfv_block_path hidden column in table
    blockPath: string;

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return FactorBlockInput.CONFIG_TYPE;
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
     * Gets the config type.
     */
    getConfigType(): string {
        return FactorBlockInput.configType;
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
            isBlock: this.isBlock,
            blockPath: this.blockPath
        };
    }

    /**
     * WidgetInput.deserialize(any)
     */
    deserialize(data: any): void {
        this.isBlock = data.isBlock;
        this.blockPath = data.blockPath;
    }

    /**
     * WidgetInput.equals(WidgetInput)
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof FactorBlockInput)) {
            return false;
        }
        if (this.isBlock !== widgetInput.isBlock) {
            return false;
        }
        if (this.blockPath !== widgetInput.blockPath) {
            return false;
        }
        return true;
    }
}
