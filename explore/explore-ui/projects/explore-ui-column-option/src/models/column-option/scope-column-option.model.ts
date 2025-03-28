import {isObject} from 'lodash';
import {AbstractColumnOption} from '@blk/explore-ui-core';

/**
 * Scope Column Options Model
 */
export class ScopeColumnOption extends AbstractColumnOption {

    static CONFIG_TYPE = 'scopeColumnOptionType';
    isApplyBenchmarkSecuritiesChecked = true;

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return ScopeColumnOption.CONFIG_TYPE;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested: boolean|number): any {
        if (!this.isValid()) {
            return undefined;
        }
        return {
            isApplyBenchmarkSecuritiesChecked: this.isApplyBenchmarkSecuritiesChecked
        };
    }

    /**
     *
     */
    deserialize(_data: any) {
        super.deserialize(_data);
        if (_data.isApplyBenchmarkSecuritiesChecked) {
            this.isApplyBenchmarkSecuritiesChecked = _data.isApplyBenchmarkSecuritiesChecked;
        } else {
            this.isApplyBenchmarkSecuritiesChecked = false;
        }
    }

    /**
     * Check if the settings are valid
     */
    isValid(): boolean {
        return true;
    }

    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof ScopeColumnOption)) {
            return false;
        }
        return this.isApplyBenchmarkSecuritiesChecked === otherColOption.isApplyBenchmarkSecuritiesChecked;
    }

    /**
     * Add required Params to option values.
     */
    protected doAddRequestParams(requestParams: any) {
        requestParams['scope'] = {
            'isApplyBenchmarkSecuritiesChecked' : this.isApplyBenchmarkSecuritiesChecked
        };
    }
}

