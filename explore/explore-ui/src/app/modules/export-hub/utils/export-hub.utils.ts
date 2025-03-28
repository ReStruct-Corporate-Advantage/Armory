import {isEmpty} from 'lodash';
import {AuxBadgeStyleEnum, Validator} from '@blk/aladdin-angular-components';
import {JobStatus} from '../enums/job-status';
import {Widget} from '@models/widget/widget.model';
import {Date} from '@blk/aladdin-graph-everything/google/type/date_pb';
import {Timestamp} from 'google-protobuf/google/protobuf/timestamp_pb';
import {CommonConstants} from '@constants/common.constants';
import {
    ExportHubJob,
    ExportHubJobExecutionHistory
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {CustomCalculationConstants} from '@blk/explore-ui-column-option';
import {BreakdownUtils} from '@utils/breakdown.utils';
import {Breakdown, CustomSector} from '@blk/explore-ui-breakdown';
import {DateUtils} from '@utils/date.utils';
import {
    AbstractFavoriteConfig,
    CalendarDateUtils,
    CoreFavoriteConstants,
    CoreUserMetaDataStore,
    getWidgetType,
    TokenConstants,
    ColumnConfig, CoreDefinitionStore,
    TokenUtils
} from '@blk/explore-ui-core';

export const dateValidator = [{
    validate: (value: any) => {
        return isEmpty(value) && !CalendarDateUtils.isUSDateFormat(value);
    },
    errorMessage: 'Invalid date entered'
}];

export const weekValidator: Validator[] = [{
    validate: (value: any) => {
        return value.filter(item => item.checked).length !== 0;
    },
    errorMessage: 'No days set'
}];

export const badgeStyles = {
    [JobStatus.IN_PROGRESS]: AuxBadgeStyleEnum.IN_PROGRESS,
    [JobStatus.COMPLETE]: AuxBadgeStyleEnum.SUCCESS,
    [JobStatus.SCHEDULED]: AuxBadgeStyleEnum.NEW,
    [JobStatus.FAILED]: AuxBadgeStyleEnum.ERROR,
    [JobStatus.CANCELLED]: AuxBadgeStyleEnum.NEUTRAL,
    [JobStatus.PARTIALLY_COMPLETED]: AuxBadgeStyleEnum.WARNING
};


export class ExportHubUtils {

    /**
     * Get google date from string (mm/dd/yyyy)
     * @param dateString
     */
    static convertToProtobufDate(dateString: string): Date {
        const [month, day, year] = dateString.split(CommonConstants.SLASH).map(Number);
        const protobufDate = new Date();
        protobufDate.setYear(year);
        protobufDate.setMonth(month);
        protobufDate.setDay(day);
        return protobufDate;
    }

    static convertProtobufDateToString(protobufDate: Date): string {
        return DateUtils.formatDate(protobufDate.getMonth()) + CommonConstants.SLASH + DateUtils.formatDate(protobufDate.getDay()) + CommonConstants.SLASH + protobufDate.getYear();
    }

    /**
     * Get google timestamp from string (HH:mm)
     * @param time
     */
    static convertToProtobufTimestamp(time: string): Timestamp {
        const timestamp = new Timestamp();
        const [hours, minutes] = time.split(CommonConstants.COLON).map(Number);
        timestamp.setSeconds(hours * 3600 + minutes * 60);
        return timestamp;
    }



    /**
     * Format Timestamp to string (MM/DD/YYYY HH:mm:ss)
     * @param time
     */
    static formatDateTime(timestamp: Timestamp): string {
       if(!timestamp){
           return;
       }

        return timestamp.toDate().toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }


    /**
     * Compare two protobuf dates, return true is date1 is before date2
     * @param protobufDate1
     * @param protobufDate2
     * @returns boolean
     */
    static compareProtobufDate(protobufDate1: Date, protobufDate2: Date): boolean {
        return protobufDate1.getYear() < protobufDate2.getYear() ||
            (protobufDate1.getYear() === protobufDate2.getYear() &&
                (protobufDate1.getMonth() < protobufDate2.getMonth() ||
                    (protobufDate1.getMonth() === protobufDate2.getMonth() && protobufDate1.getDay() < protobufDate2.getDay())));
    }

    /**
     * Retrieve the nested part from widget serialize as widget settings for scheduled job
     */
    static encodeWidgetSettingsForScheduledJob(widget: Widget): string {
        let widgetSerialized;
        if (!widget.dataStore) {
            throw new Error('dataStore not found..');
        }

        try {
            widgetSerialized = {
                nestedWidgetConfig: widget.serialize(true),
                nestedDataStore: widget.dataStore?.serialize(false, ExportHubUtils.shouldSaveLinkedFav.bind(ExportHubUtils))
            };
        } catch (e) {
            throw new Error('Serialization error' + (e?.message ? ' -> ' + e.message : CommonConstants.EMPTY_STRING));
        }

        widgetSerialized.nestedDataStore.metaData.type = getWidgetType(widget.configType).toString();
        return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(widgetSerialized))));
    }

    // Function to decode Base64 encoded strings
    static decodeJobExecutionHistory(encodedString: string): ExportHubJobExecutionHistory {
        return ExportHubJobExecutionHistory.deserializeBinary(this.decodeBase64(encodedString));
    }

    // Function to decode Base64 encoded strings
    static decodeExportHubJob(encodedString: string): ExportHubJob {
        return ExportHubJob.deserializeBinary(this.decodeBase64(encodedString));
    }

    static decodeBase64(encodedString: string): Uint8Array {
        const binaryString = atob(encodedString);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    static getOutputLocation() : string {
        return CoreDefinitionStore.tokens[TokenConstants.EXPLORE_SCHEDULE_BATCH_EXPORT_DIRECTORY]
            ? CoreDefinitionStore.tokens[TokenConstants.EXPLORE_SCHEDULE_BATCH_EXPORT_DIRECTORY]
            : CommonConstants.EMPTY_STRING
    }


    /**
     * Custom logic to override the default logic to save linked favorite.
     * Determines whether a given favorite configuration should be saved.
     * @param config - The favorite configuration to check.
     * @returns boolean | Error - True if the favorite should be saved, false otherwise. Throws an error if a custom calculation is not saved.
     */
    static shouldSaveLinkedFav(config: AbstractFavoriteConfig): boolean | Error {
        if (!(config instanceof AbstractFavoriteConfig)) {
            return false;
        }

        if (config instanceof ColumnConfig) {
            const customCalcColTags = [CoreFavoriteConstants.CUSTOM_CALC_COL_TAG, CustomCalculationConstants.PGS_CUSTOM_CALCULATION];
            const styleColTags = ['custom_style', 'forecast_growth', 'forecast_growth_cont', 'forecast_value', 'forecast_value_cont', 'historic_growth', 'historic_growth_cont', 'historic_Value', 'historic_Value_cont', 'style_momentum', 'style_momentum_cont', 'style_quality', 'style_quality_cont', 'style_size', 'style_size_cont'];

            // Check if the column tag is a custom calculation
            if (customCalcColTags.includes(config.columnTag)) {
                throw new Error('Custom Calculation is not currently supported with export hub. Please remove the column to proceed with export hub job');
            }

            // Check if the column tag is a style analysis
            if (styleColTags.includes(config.columnTag)) {
                throw new Error('Style Analysis is not currently supported with export hub. Please remove the column to proceed with export hub job');
            }
        }

        // Check if the favorite is a breakdown with custom sectors
        if (config instanceof Breakdown && BreakdownUtils.hasCustomSector(config)) {
            return true;
        }

        // Check if the favorite is a custom sector
        return config instanceof CustomSector;
    }

    /**
     *  Encode the serialized data to base64 string
     * @param scheduledJobConfig
     */
    static createExportHubJobPayload(scheduledJobConfig: ExportHubJob) {
        return {'exportHubJob': btoa(String.fromCharCode(...scheduledJobConfig.serializeBinary()))};
    }


    /**
     * Check if the export hub feature is enabled for user
     */
    static isExportHubEnabled(): boolean {
        return TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_EXPORT_HUB_ENABLED) && CoreUserMetaDataStore.userMetaData.exportHubAccess;
    }
}
