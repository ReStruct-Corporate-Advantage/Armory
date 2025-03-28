import {CustomCalculationColumnOption} from './custom-calculation-column-option.model';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';
import {isObject, isString, mapValues} from 'lodash';
import {StyleMeasureColumnOptionModel} from './style-measure-column-option.model';
import {ScopeColumnOption} from './scope-column-option.model';

/**
 * Column option for Style Analysis Columns.
 */
export class StyleAnalysisColumnOption extends CustomCalculationColumnOption {
    static CONFIG_TYPE = 'styleAnalysis';
    styleMeasureMapping: Record<string, StyleMeasureColumnOptionModel> = {};
    showMeasures = true;
    adjustActiveExposure :boolean;

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
        return StyleAnalysisColumnOption.CONFIG_TYPE;
    }

    /**
     * Add required request param to Options values.
     */
    protected doAddRequestParams(requestParams: any): void {
        const copyMeasureMapping: Record<string, any> = {};
        const copyStyleMapping: Record<string, any> = {};
        let index = 0;
        for (const [key, value] of Object.entries(this.measureMapping)) {
            copyMeasureMapping[this.getMeasureAlias(index)] = value.createRequestColumn();
            copyStyleMapping[this.getMeasureAlias(index)] = this.styleMeasureMapping[key].doSerialize();
            index++;
        }
        requestParams['styleAnalysis'] = {
            aliasDependencyMap: copyMeasureMapping,
            styleMeasureMetaData: copyStyleMapping,
            showMeasures: this.showMeasures,
            adjustActiveExposure: this.adjustActiveExposure
        };
    }

    /**
     * Takes a positive integer and returns the corresponding column name similar to excel sheet.
     * i.e. 'a'...'z','aa','ab'...'az'
     * @param num  The positive integer to convert to a column name.
     * @return The column name.
     */
    getMeasureAlias(num: number): string {
        let colNum = num + 1;
        let aliasName = '';
        for (let a = 1, b = 26; (colNum -= a) >= 0; a = b, b *= 26) {
            aliasName = String.fromCharCode(((colNum % b) / a) + 97) + aliasName;
        }
        return aliasName;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }
        super.deserialize(data);
        this.showMeasures = data.showMeasures;
        // CustomCalculationColumnOption model generates new keys for the measures. Replace those keys with existing keys
        for (const [key, value] of Object.entries(this.measureMapping)) {
            value.columnKey = key;
            // this check is required to keep legacy workspaces untouched i.e. they will have Scope column option unselected by default
            if (value.positionColumnType === 'PORT' && (value.optionValues.filter(option => option instanceof ScopeColumnOption).length <= 0)) {
                const scopeColumnOption: ScopeColumnOption = new ScopeColumnOption();
                scopeColumnOption.isApplyBenchmarkSecuritiesChecked = false;
                value.optionValues.push(scopeColumnOption);
            }
        }

        if(data.hasOwnProperty('adjustActiveExposure')) {
            this.adjustActiveExposure = data.adjustActiveExposure;
        }

        this.styleMeasureMapping = mapValues(data.styleMeasureMapping, value => {
                return new StyleMeasureColumnOptionModel(isString(value) ? JSON.parse(value) : value);
            });
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        const serializedOptions = super.doSerialize();
        serializedOptions['showMeasures'] = this.showMeasures;
        serializedOptions['adjustActiveExposure'] = this.adjustActiveExposure;
        serializedOptions['styleMeasureMapping'] = mapValues(this.styleMeasureMapping, value => {
            return value.serialize();
        });
        return serializedOptions;
    }

    /**
     * Equals method implementation to compare with other column option@param otherColOption
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof StyleAnalysisColumnOption)) {
            return false;
        }

        if (!super.equals(otherColOption)) {
            return false;
        }

        if (this.showMeasures !== otherColOption.showMeasures) {
            return false;
        }

        if (this.styleMeasureMapping.size !== otherColOption.styleMeasureMapping.size) {
            return false;
        }

        if(this.adjustActiveExposure !== otherColOption.adjustActiveExposure) {
            return false;
        }

        for (const [key, val] of Object.entries(this.styleMeasureMapping)) {
            const otherStyleMappingValue = otherColOption.styleMeasureMapping[key];
            if (!otherStyleMappingValue || !otherStyleMappingValue.equals(val)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if the column option is valid
     */
    isValid(): boolean {
        return true;
    }
}
