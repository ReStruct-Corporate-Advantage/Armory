import {
    AbstractFavoriteConfig,
    ConfigTypeFactory,
    DateFormatConstants,
    FavoriteDisplayEnum,
    SerializeFavoriteType
} from '@blk/explore-ui-core';
import {cloneDeep, isArray, isEmpty, isObject} from 'lodash';
import {BatchSchedule} from '@models/batch-reporting/scheduled-batch/batch-schedule.model';
import moment from 'moment';

/**
 * Class for a scheduled batch export config
 */
export class ScheduledBatchConfig extends AbstractFavoriteConfig {
    static CONFIG_TYPE = 'SCHEDULED_BATCH';

    batchReportConfigId: number|string;
    batchReportConfigOwner: string; // Store the owner of the underlying batchReportConfig to display to the user. Helps with finding/editing the correct batch favorite
    author: string;
    batchSchedules: BatchSchedule[] = []; // List of schedules associated with the given batch report favorite

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return ScheduledBatchConfig.CONFIG_TYPE;
    }

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
     * Gets the favorite type for this config.
     */
    getConfigType(): string {
        return ScheduledBatchConfig.CONFIG_TYPE;
    }

    /**
     * Serialize the config to json.
     */
    protected doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {};

        data.batchReportConfigId = this.batchReportConfigId;
        data.batchReportConfigOwner = this.batchReportConfigOwner;
        data.author = this.author;
        this.sortBatchSchedulesByLastUpdated();
        data.batchSchedules = this.batchSchedules.map((batchSchedule) => batchSchedule.serialize());

        return data;
    }

    /**
     * Deserialize the json data into this object
     */
    protected doDeserialize(data: any) {
        if (data.batchReportConfigId) {
            this.batchReportConfigId = data.batchReportConfigId;
        }
        if (data.batchReportConfigOwner) {
            this.batchReportConfigOwner = data.batchReportConfigOwner;
        }
        if (data.author) {
            this.author = data.author;
        }
        if (isArray(data.batchSchedules) && !isEmpty(data.batchSchedules)) {
            this.batchSchedules = data.batchSchedules.map((batchSchedule) => ConfigTypeFactory.createConfig(batchSchedule, BatchSchedule.configType, true));
        }
    }

    /**
     * Copy the attributes from another ScheduledBatchConfig
     */
    protected doCopyFrom(source: AbstractFavoriteConfig): void {
        if (!(source instanceof ScheduledBatchConfig)) {
            return;
        }
        this.batchReportConfigId = source.batchReportConfigId;
        this.author = source.author;
        this.batchSchedules = cloneDeep(source.batchSchedules);
    }

    /**
     * Sorts the BatchSchedules by dateLastUpdate with the earliest first
     */
    public sortBatchSchedulesByLastUpdated(): void {
        this.batchSchedules.sort((firstSchedule, secondSchedule) => {
            const firstScheduleMoment = moment(firstSchedule.dateLastUpdated, DateFormatConstants.MMDDYYYY_SLASH);
            const secondScheduleMoment = moment(secondSchedule.dateLastUpdated, DateFormatConstants.MMDDYYYY_SLASH);
            if (firstScheduleMoment > secondScheduleMoment) {
                return 1;
            } else if (secondScheduleMoment > firstScheduleMoment) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    getDisplayType(parent?: any): FavoriteDisplayEnum {
        return FavoriteDisplayEnum.SCHEDULED_BATCH;
    }
}
