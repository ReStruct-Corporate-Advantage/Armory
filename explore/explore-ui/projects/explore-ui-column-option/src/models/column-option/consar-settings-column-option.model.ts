import {forEach, isEmpty, isEqual, isNil, keyBy, mapValues} from 'lodash';
import {ConsarScenarioType, ConsarScenarioTypeUtils} from '../../enums/consar-scenario-type.enum';
import {AbstractColumnOption, ColumnOptionMetaDataInterface, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Consar settings column option
 */
export class ConsarSettingsColumnOption extends AbstractColumnOption {
    static readonly CONFIG_TYPE: string = 'consarSettings';

    private static readonly DEFAULT_SCENARIO_TYPE: ConsarScenarioType = ConsarScenarioType.REGULAR;
    private static readonly DEFAULT_CONFIDENCE_LEVEL: number = 26;
    private static readonly DEFAULT_HISTORY: number = 1000;

    public static readonly SCENARIO_TYPE = 'SCENARIO_TYPE';
    public static readonly CONFIDENCE_LEVEL = 'CONFIDENCE_LEVEL';
    public static readonly HISTORY = 'HISTORY';

    /** Scenario type */
    scenarioType: ConsarScenarioType;

    /** Confidence level */
    confidenceLevel: number;

    /** History */
    history: number;

    /**
     * Gets the type of the config object
     */
    get configType(): string {
        return ConsarSettingsColumnOption.CONFIG_TYPE;
    }

    /**
     * Options
     * @param columnOptionMetadata column option metadata
     */
    static options(columnOptionMetadata: ColumnOptionMetaDataInterface): Map<string, boolean> {
        if (isNil(columnOptionMetadata) || isEmpty(columnOptionMetadata.columnOptionAttributes)) {
            return null;
        }

        const optionsObj: any = mapValues(keyBy(columnOptionMetadata.columnOptionAttributes[0].values, 'label'), 'value');
        const optionsMap: Map<string, boolean> = new Map<string, boolean>();
        forEach(optionsObj, (value, key) => {
            optionsMap.set(key, value as boolean);
        });
        return optionsMap;
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     * @param otherColOption other column option
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof ConsarSettingsColumnOption)) {
            return false;
        }

        if (!isEqual(this.scenarioType, otherColOption.scenarioType)) {
            return false;
        }

        if (!isEqual(this.confidenceLevel, otherColOption.confidenceLevel)) {
            return false;
        }

        if (!isEqual(this.history, otherColOption.history)) {
            return false;
        }

        return true;
    }

    /**
     * Initializes the column with the default settings
     * @param defaultSettings default column settings
     */
    initialize(defaultSettings: any): void {
        const options: Map<string, boolean> = ConsarSettingsColumnOption.options(defaultSettings);
        if (isNil(options)) {
            return;
        }

        if (options.get(ConsarSettingsColumnOption.SCENARIO_TYPE)) {
            this.scenarioType = this.scenarioType || ConsarSettingsColumnOption.DEFAULT_SCENARIO_TYPE;
        }

        if (options.get(ConsarSettingsColumnOption.CONFIDENCE_LEVEL)) {
            this.confidenceLevel = this.confidenceLevel || ConsarSettingsColumnOption.DEFAULT_CONFIDENCE_LEVEL;
        }

        if (options.get(ConsarSettingsColumnOption.HISTORY)) {
            this.history = this.history || ConsarSettingsColumnOption.DEFAULT_HISTORY;
        }
    }

    /**
     * Method that validates if the column option settings are valid to be serialized or to be added on to the request
     */
    isValid(): boolean {
        return !(isNil(this.scenarioType)
            || isNil(this.confidenceLevel)
            || isNil(this.history));
    }

    /**
     * Get params that are to be send as a part of the request params
     * @param requestParams request params
     */
    protected doAddRequestParams(requestParams: any): void {
        requestParams.consarSettings = {
            scenarioType: ConsarScenarioTypeUtils.typeName(this.scenarioType),
            confidenceLevel: this.confidenceLevel,
            history: this.history
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

        return {
            scenarioType: ConsarScenarioTypeUtils.typeName(this.scenarioType),
            confidenceLevel: this.confidenceLevel,
            history: this.history
        };
    }

    /**
     * Deserialize the data into this object
     * @param data data to deserialize
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }

        this.scenarioType = ConsarScenarioTypeUtils.valueOf(data.scenarioType);
        this.confidenceLevel = data.confidenceLevel;
        this.history = data.history;
    }
}
