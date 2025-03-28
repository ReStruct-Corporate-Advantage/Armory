import {AbstractConfig, ColumnConstants, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {TableBreakdown} from '@interfaces/table-breakdown.interface';
import {AppUtils} from '@utils/app.utils';
import {isArray, isString} from 'lodash';

/**
 * Input model for factor path parameters for fba row based spritelets
 */
export class FactorPathInput extends AbstractConfig implements WidgetInput {
    static readonly CONFIG_TYPE = 'factorPath';
    path: TableBreakdown[] = [];

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return FactorPathInput.CONFIG_TYPE;
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
        return FactorPathInput.configType;
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
        const path = [];
        this.path.forEach((tableBreakdown: TableBreakdown) => {
            path.push({level: tableBreakdown.level, value: tableBreakdown.value});
        });
        return path;
    }

    /**
     * WidgetInput.deserialize(any)
     */
    deserialize(data: any): void {
        let dataPath = data;
        if (data.path) {
            dataPath = data.path;
        }
        if (!isArray(dataPath)) {
            return;
        }
        dataPath.forEach((tableBreakdown: any, index: number) => {
            if (isString(tableBreakdown)) {
                if (index === 0) {
                    this.path.push({level: '_ROOT_', value: tableBreakdown});
                } else {
                    this.path.push({level: 'level-' + index, value: tableBreakdown});
                }
            } else {
                this.path.push({level: tableBreakdown.level, value: tableBreakdown.value});
            }
        });
    }

    /**
     * WidgetInput.equals(WidgetInput)
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof FactorPathInput)) {
            return false;
        }
        if (this.path.length !== widgetInput.path.length) {
            return false;
        }
        let areAllPathsEqual = true;
        this.path.forEach((tableBreakdown: TableBreakdown, index: number) => {
            if (tableBreakdown.level !== widgetInput.path[index].level || tableBreakdown.value !== widgetInput.path[index].value) {
                areAllPathsEqual = false;
            }
        });
        return areAllPathsEqual;
    }

    /**
     * Determines if the factor path goes down to the lowest leaf level
     */
    isFactorTimeSeriesLeafLevelPath(): boolean {
        if (this.path.length === 0) {
            return false;
        }
        const lowestLevel = this.path[this.path.length - 1].level;
        // all new factor time series spritelets will use FBA_BLOCK_PATH, but to maintain backward compatibility FBA_TITLE will also be considered valid
        return lowestLevel === ColumnConstants.FBA_BLOCK_PATH || lowestLevel === ColumnConstants.FBA_TITLE;
    }
}
