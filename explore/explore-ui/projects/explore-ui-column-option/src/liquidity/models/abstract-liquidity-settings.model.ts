import {DerivedSettings, RequestParamsCreator, Serializable, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Abstract class for liquidity Settings column option
 */
export abstract class AbstractLiquiditySettings implements Serializable, RequestParamsCreator, DerivedSettings<any> {
    private readonly LIQUIDITY_DEFAULT = 'liquidityDefaults';

    /**
     * Initialises the liquidity settings with the default settings.
     */
    initialize(defaultSettings: Map<string, boolean>, definitions?: Map<string, any>): void {
    }

    /**
     * Get portfolio defaults from definitions
     */
    protected getLiquidityDefaults(definitions: Map<string, any>): {string: any} {
        return definitions?.get(this.LIQUIDITY_DEFAULT);
    }

    /**
     * deserialize value from saved value
     */
    abstract deserialize(data: any): void;

    /**
     * serialize settings
     */
    abstract serialize(isNested?: boolean | SerializeFavoriteType): any;

    abstract addRequestParams(optionValues: any): void;

    /**
     * key to getliquidity settings from widget level settings.
     */
    getParentWidgetSettingKey(): string {
        return this.LIQUIDITY_DEFAULT;
    }

    /**
     * key to get liquidity settings from portfolio defaults.
     */
    getParentPortfolioSettingKey(): string {
        return this.LIQUIDITY_DEFAULT;
    }

    /**
     * update AbstractLiquiditySettings with liquidity defaults.
     * overridden implementation can be provided in concrete class.
     */
    updateDerivedSettings(liquidityDefaults: any) {
    }
}
