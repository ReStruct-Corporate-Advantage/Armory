import {AbstractConfig, CommonUtils, ConfigTypeFactory, SerializeFavoriteType} from '@blk/explore-ui-core';
import {isObject} from 'lodash';
import {BatchFrequency} from '@interfaces/batch-frequency.interface';

/**
 * Class for a Batch export schedule
 */
export class BatchSchedule extends AbstractConfig {
    static CONFIG_TYPE = 'BatchSchedule';

    timeValue: string; // Time that the scheduled batch will run
    timeZone: string;
    frequency: BatchFrequency;
    directory: string; // directory that the user specifies where to save exported files. Defaults to what the batchReportConfig favorite title is
    fileNamePrefix: string;
    dateLastUpdated: string;
    lastUpdatedBy: string;
    id: string;

    static get configType(): string {
        return BatchSchedule.CONFIG_TYPE;
    }

    constructor(data?: any) {
        super();
        this.id = CommonUtils.generateUniqueIdAsString();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Serialize the config to json.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            configType: BatchSchedule.CONFIG_TYPE,
            timeValue: this.timeValue,
            timeZone: this.timeZone,
            frequency: this.frequency.serialize(),
            directory: this.directory,
            fileNamePrefix: this.fileNamePrefix,
            id: this.id
        };
    }

    /**
     * Deserialize the json data into this object
     */
    deserialize(data: any): void {
        if (data.timeValue) {
            this.timeValue = data.timeValue;
        }
        if (data.timeZone) {
            this.timeZone = data.timeZone;
        }
        if (data.frequency) {
            this.frequency = ConfigTypeFactory.createConfig(data.frequency, data.frequency.configType, true);
        }
        if (data.directory) {
            this.directory = data.directory;
        }
        if (data.fileNamePrefix) {
            this.fileNamePrefix = data.fileNamePrefix;
        }
        if (data.id) {
            this.id = data.id;
        }
    }
}
