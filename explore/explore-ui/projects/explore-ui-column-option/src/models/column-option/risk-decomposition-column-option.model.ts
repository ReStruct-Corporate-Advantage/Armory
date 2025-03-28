import {AbstractColumnOption, ColumnOptionMetaDataInterface, SerializeFavoriteType} from '@blk/explore-ui-core';
import {RiskDecompositionType} from '../../enums';
import {forEach, isEmpty, isEqual, isNil, keyBy, mapValues} from 'lodash';

/**
 * Risk decomposition column option
 */
export class RiskDecompositionColumnOption extends AbstractColumnOption {
    static readonly CONFIG_TYPE: string = 'riskDecomposition';

    /** Decomposition type */
    decompositionType: RiskDecompositionType;

    /**
     * Gets the type of the config object
     */
    get configType(): string {
        return RiskDecompositionColumnOption.CONFIG_TYPE;
    }

    /**
     * Options
     * @param columnOptionMetadata column options metadata
     */
    static options(columnOptionMetadata: ColumnOptionMetaDataInterface): Map<RiskDecompositionType, boolean> {
        if (isNil(columnOptionMetadata) || isEmpty(columnOptionMetadata.columnOptionAttributes)) {
            return null;
        }

        const optionsObj: any = mapValues(keyBy(columnOptionMetadata.columnOptionAttributes[0].values, 'label'), 'value');
        const optionsMap: Map<RiskDecompositionType, boolean> = new Map<RiskDecompositionType, boolean>();
        forEach(optionsObj, (value, key) => {
            optionsMap.set(RiskDecompositionType.valueOf(key), value as boolean);
        });
        return optionsMap;
    }

    /**
     * Default decomposition type
     * @param columnOptionMetadata column option metadata
     */
    static defaultDecompositionType(columnOptionMetadata: ColumnOptionMetaDataInterface): RiskDecompositionType {
        const options: Map<RiskDecompositionType, boolean> = RiskDecompositionColumnOption.options(columnOptionMetadata);
        if (isNil(options)) {
            return null;
        }

        const decompositionTypes: RiskDecompositionType[] = RiskDecompositionType.values()
            .filter(riskDecompositionType => options.get(riskDecompositionType));
        return decompositionTypes[0];
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     * @param otherColOption other column option
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof RiskDecompositionColumnOption)) {
            return false;
        }

        if (!isEqual(this.decompositionType, otherColOption.decompositionType)) {
            return false;
        }

        return true;
    }

    /**
     * Initializes the column with the default settings
     * @param defaultSettings default settings
     */
    initialize(defaultSettings: any): void {
        this.decompositionType = this.decompositionType || RiskDecompositionColumnOption.defaultDecompositionType(defaultSettings);
    }

    /**
     * Method that validates if the column option settings are valid to be serialized or to be added on to the request
     */
    isValid(): boolean {
        return !isNil(this.decompositionType);
    }

    /**
     * Get params that are to be send as a part of the request params
     * @param requestParams request params
     */
    protected doAddRequestParams(requestParams: any): void {
        requestParams.riskDecomposition = {
            decompositionType: RiskDecompositionType.name(this.decompositionType)
        };
    }

    /**
     * This function is used to serialize the implementation favorite
     * @param isNested is nested
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return null;
        }

        const data: any = {};
        data.riskDecomposition = {
            decompositionType: RiskDecompositionType.name(this.decompositionType)
        };

        return data;
    }

    /**
     * Deserialize the data into this object
     * @param data data to deserialize
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }

        if (!isNil(data.riskDecomposition)) {
            this.decompositionType = RiskDecompositionType.valueOf(data.riskDecomposition.decompositionType);
        }
    }
}
