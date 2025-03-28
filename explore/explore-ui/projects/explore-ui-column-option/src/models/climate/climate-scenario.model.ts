import {AbstractConfig, ClimateScenarioInterface, SerializeFavoriteType} from '@blk/explore-ui-core';
import {isEmpty, isObject, isEqual} from 'lodash';

/**
 * Model for a climate scenarios rule within the column option.
 */
export class ClimateScenario extends AbstractConfig implements ClimateScenarioInterface {

    scenarioType: string;
    scenarioTypeDisplayName: string;
    scenarioPercentile: string;
    scenarioPercentileDisplayName: string;
    scenarioYear: string;
    scenarioYearDisplayName: string;
    /** Indicates this ClimateScenario should not spawn a child column. */
    preventSpawnChildColumn: boolean;

    /**
     * Constructor to create a new empty climate Scenario or initialize an existing one
     * @param data Optional data to construct existing climate Scenario from
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize saved climate scenario rule from data to object
     * @param data in JSON form
     */
    deserialize(data: any): void {
        this.scenarioType = data.scenarioType;
        this.scenarioTypeDisplayName = data.scenarioTypeDisplayName;
        this.scenarioPercentile = data.scenarioPercentile;
        this.scenarioPercentileDisplayName = data.scenarioPercentileDisplayName;
        this.scenarioYear = data.scenarioYear;
        this.scenarioYearDisplayName = data.scenarioYearDisplayName;
        this.preventSpawnChildColumn = data.preventSpawnChildColumn;
    }

    /**
     * Serialize climate scenario rule to JSON format
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        // only serialize if the scenario settings are valid
        if (!this.isValid()) {
            return undefined;
        }
        return {
            scenarioType: this.scenarioType,
            scenarioTypeDisplayName: this.scenarioTypeDisplayName,
            scenarioPercentile: this.scenarioPercentile ?? 'mean', // mean as a default is applicable to all scenario percentiles
            scenarioPercentileDisplayName: this.scenarioPercentileDisplayName,
            scenarioYear: this.scenarioYear,
            scenarioYearDisplayName: this.scenarioYearDisplayName,
            preventSpawnChildColumn: this.preventSpawnChildColumn
        };
    }
    /**
     * Checks if climate scenario rule is valid for saving.
     */
    isValid(): boolean {
        return !isEmpty(this.scenarioType) && !isEmpty(this.scenarioYear);
    }

    /**
     * Returns true if other is equal to this.
     * Intentionally not checking display names for equality because they are determined dynamically and can change while values are unique enough.
     */
    equals(other: ClimateScenario): boolean {
        if (!(other instanceof ClimateScenario)) {
            return false;
        }
        if (!isEqual(this.scenarioType, other.scenarioType)) {
            return false;
        }
        if (!isEqual(this.scenarioPercentile, other.scenarioPercentile)) {
            return false;
        }
        if (!isEqual(this.preventSpawnChildColumn, other.preventSpawnChildColumn)) {
            return false;
        }
        return isEqual(this.scenarioYear, other.scenarioYear);
    }
}
