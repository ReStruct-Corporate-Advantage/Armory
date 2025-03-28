import {head, isEmpty, isNil} from 'lodash';
import {LiquidityConstants} from '../liquidity.constants';
import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * SEC Liquidity Settings as a part of liquidity Settings
 */
export class SECLiquiditySettings extends AbstractLiquiditySettings {

    private static readonly DEFAULT_RATS: number = 100;
    private static readonly DEFAULT_SCENARIO: string = '';
    private static readonly DEFAULT_SEC_SETTING: string = LiquidityConstants.SEC_LIQUIDITY_RATS;
    private static readonly CUSTOM_SCENARIO_SETTING: string = LiquidityConstants.SEC_LIQUIDITY_PERCENT_NAV;
    private static readonly DEFAULT_ALTERNATE_RATS: string = LiquidityConstants.SEC_LIQUIDITY_SCENARIO;
    private static readonly DEFAULT_IS_SEC_COLUMN: boolean = false;
    private static readonly DEFAULT_HAS_DUMMY_RATS: boolean = true;
    private static readonly DEFAULT_SEC_PERCENT_NAV: number = 100;

    private static readonly SEC_22E4_RATS: string = 'sec_22e4_rats';
    private static readonly SEC_22E4_SCEN1: string = 'sec_22e4_scen1';
    private static readonly SEC_22E4_SCEN2: string = 'sec_22e4_scen2';
    private static readonly SEC_22E4_SCEN3: string = 'sec_22e4_scen3';
    private static readonly SEC_22E4_SCEN4: string = 'sec_22e4_scen4';

    rats: number;
    scenario: string;
    secSetting: string;
    isSECColumn: boolean;
    hasDummyRATS: boolean;
    secPercentNAV: number;
    sendOnlyRatsSecSettings = false;

    /**
     * Initialises the liquidity settings with the default settings.
     */
    initialize(defaultSettings: Map<string, boolean>, definitions: Map<string, any>) {
        super.initialize(defaultSettings, definitions);

        const liquidityDefaults: {} = this.getLiquidityDefaults(definitions);

        this.rats = SECLiquiditySettings.DEFAULT_RATS;
        this.scenario = SECLiquiditySettings.DEFAULT_SCENARIO;
        this.secSetting = SECLiquiditySettings.DEFAULT_SEC_SETTING;
        this.isSECColumn = SECLiquiditySettings.DEFAULT_IS_SEC_COLUMN;
        this.hasDummyRATS = SECLiquiditySettings.DEFAULT_HAS_DUMMY_RATS;
        this.secPercentNAV = SECLiquiditySettings.DEFAULT_SEC_PERCENT_NAV;

        this.sendOnlyRatsSecSettings = defaultSettings.get(LiquidityConstants.ENABLE_SENDING_ONLY_RATS);

        if (liquidityDefaults && SECLiquiditySettings.SEC_22E4_RATS in liquidityDefaults) {
            this.rats = liquidityDefaults[SECLiquiditySettings.SEC_22E4_RATS] * 100;
            this.hasDummyRATS = false;
        }

        const availableScenarios: {} = this.getAvailableScenarios(liquidityDefaults);
        if (!isEmpty(availableScenarios)) {
            this.scenario = head(Object.keys(availableScenarios));
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            rats: this.rats,
            scenario: this.scenario,
            secSetting: this.secSetting,
            isSECColumn: this.isSECColumn,
            hasDummyRATS: this.hasDummyRATS,
            secPercentNAV: this.secPercentNAV,
            sendOnlyRatsSecSettings: this.sendOnlyRatsSecSettings
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }

        this.rats = !isNil(data.rats) ? data.rats : SECLiquiditySettings.DEFAULT_RATS;
        this.scenario = !isNil(data.scenario) ? data.scenario : SECLiquiditySettings.DEFAULT_SCENARIO;
        this.secSetting = !isNil(data.secSetting) ? data.secSetting : SECLiquiditySettings.DEFAULT_SEC_SETTING;
        this.isSECColumn = !isNil(data.isSECColumn) ? data.isSECColumn : SECLiquiditySettings.DEFAULT_IS_SEC_COLUMN;
        this.hasDummyRATS = !isNil(data.hasDummyRATS) ? data.hasDummyRATS : SECLiquiditySettings.DEFAULT_HAS_DUMMY_RATS;
        this.secPercentNAV = !isNil(data.secPercentNAV) ? data.secPercentNAV : SECLiquiditySettings.DEFAULT_SEC_PERCENT_NAV;
        this.sendOnlyRatsSecSettings = !isNil(data.sendOnlyRatsSecSettings) ? data.sendOnlyRatsSecSettings : false;
    }

    /**
     * Return true if two object are same otherwise return false
     */
    equals(option: AbstractLiquiditySettings) {
        if (!(option instanceof SECLiquiditySettings)) {
            return false;
        }

        if (this.scenario !== option.scenario) {
            return false;
        }

        return (this.isSECColumn === option.isSECColumn);
    }

    /**
     * Add value to request params
     */
    addRequestParams(requestParam: any): void {
        requestParam.scenario = this.scenario;
        requestParam.isSECColumn = this.isSECColumn;

        if (this.isSECColumn) {
            // send selected RATS value as custom scenario if it is not a portfolio default
            if (this.secSetting === SECLiquiditySettings.DEFAULT_ALTERNATE_RATS) {
                requestParam.secSetting = this.scenario;
            } else {
                requestParam.secSetting = this.secSetting;
                if (this.secSetting === SECLiquiditySettings.CUSTOM_SCENARIO_SETTING) {
                    requestParam.percentNAVLiquidated = this.secPercentNAV / 100;
                }
            }
        }
    }

    /**
     * Get available scenarios using liquidity defaults
     */
    getAvailableScenarios(liquidityDefaults: {}): {} {
        if (isNil(liquidityDefaults)) {
            return {};
        }

        const availableScenarios: {} = {};
        if (SECLiquiditySettings.SEC_22E4_SCEN1 in liquidityDefaults) {
            availableScenarios[SECLiquiditySettings.SEC_22E4_SCEN1] = liquidityDefaults[SECLiquiditySettings.SEC_22E4_SCEN1] * 100;
        }
        if (SECLiquiditySettings.SEC_22E4_SCEN2 in liquidityDefaults) {
            availableScenarios[SECLiquiditySettings.SEC_22E4_SCEN2] = liquidityDefaults[SECLiquiditySettings.SEC_22E4_SCEN2] * 100;
        }
        if (SECLiquiditySettings.SEC_22E4_SCEN3 in liquidityDefaults) {
            availableScenarios[SECLiquiditySettings.SEC_22E4_SCEN3] = liquidityDefaults[SECLiquiditySettings.SEC_22E4_SCEN3] * 100;
        }
        if (SECLiquiditySettings.SEC_22E4_SCEN4 in liquidityDefaults) {
            availableScenarios[SECLiquiditySettings.SEC_22E4_SCEN4] = liquidityDefaults[SECLiquiditySettings.SEC_22E4_SCEN4] * 100;
        }

        return availableScenarios;
    }

    /**
     * update SECLiquiditySettings with liquidity defaults
     */
    updateDerivedSettings(liquidityDefaults: any) {
        this.rats = SECLiquiditySettings.DEFAULT_RATS;
        this.hasDummyRATS = SECLiquiditySettings.DEFAULT_HAS_DUMMY_RATS;
        if (liquidityDefaults && SECLiquiditySettings.SEC_22E4_RATS in liquidityDefaults) {
            this.rats = liquidityDefaults[SECLiquiditySettings.SEC_22E4_RATS] * 100;
            this.hasDummyRATS = false;
        }
    }
}
