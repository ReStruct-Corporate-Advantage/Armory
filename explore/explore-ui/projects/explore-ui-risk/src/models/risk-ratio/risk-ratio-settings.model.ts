import {AbstractColumnOption, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {CoreRiskConstants} from '../../core-risk.constants';
import {isEmpty, isObject, isUndefined} from 'lodash';

export class RiskRatioSettings extends AbstractColumnOption implements WidgetInput {

    static readonly CONFIG_TYPE: string = 'riskRatioSettings';

    private _denominator: string;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    get denominator(): string {
        return this._denominator;
    }

    set denominator(value: string) {
        this._denominator = value;
    }

    /**
     * Method to deserialize
     */
    deserialize(data: any) {
        if (data.denominator) {
            this.denominator = data.denominator;
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Method to serialize settings for saving
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            denominator: this.denominator
        };
    }

    getRequestParams(): any {
        const requestParams: any = {};
        requestParams[CoreRiskConstants.RISK_RATIO_SETTINGS_PROPERTIES.DENOMINATOR] = this.denominator;
        return requestParams;
    }

    isValid(): boolean {
        return !isUndefined(this.denominator);
    }

    get configType(): string {
        return RiskRatioSettings.CONFIG_TYPE;
    }

    /**
     * equals method implementation
     */
    equals(riskRatioSettings: RiskRatioSettings): boolean {
        return this.denominator === riskRatioSettings.denominator;
    }

    /**
     * WidgetInput.isDataStoreInput()
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any) {
        if (!isEmpty(this.getRequestParams())) {
            requestParams[CoreRiskConstants.RISK_RATIO_SETTINGS] = this.getRequestParams();
        }
    }
}
